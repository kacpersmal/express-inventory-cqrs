import { describe, expect, it } from "vitest";
import {
  calculatePricing,
  getPromotionalInfo,
  getRegionPricingInfo,
  type OrderItem,
} from "./discount.service";

const createItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  productId: "prod-1",
  productName: "Test Product",
  category: "general",
  quantity: 1,
  unitPrice: 100,
  ...overrides,
});

describe("discount.service", () => {
  describe("calculatePricing", () => {
    describe("subtotal calculation", () => {
      it("calculates subtotal for single item", () => {
        const items = [createItem({ quantity: 2, unitPrice: 50 })];

        const result = calculatePricing(items, "US");

        expect(result.subtotal).toBe(100);
      });

      it("calculates subtotal for multiple items", () => {
        const items = [
          createItem({ quantity: 2, unitPrice: 50 }),
          createItem({ productId: "prod-2", quantity: 3, unitPrice: 30 }),
        ];

        const result = calculatePricing(items, "US");

        expect(result.subtotal).toBe(190);
      });

      it("handles empty items array", () => {
        const result = calculatePricing([], "US");

        expect(result.subtotal).toBe(0);
        expect(result.finalTotal).toBe(0);
      });
    });

    describe("volume discounts", () => {
      const regularDate = new Date(2025, 5, 15);

      it("applies no discount for less than 5 items", () => {
        const items = [createItem({ quantity: 4 })];

        const result = calculatePricing(items, "US", regularDate);

        expect(result.discount).toBeNull();
        expect(result.discountAmount).toBe(0);
      });

      it("applies 10% discount for 5+ items", () => {
        const items = [createItem({ quantity: 5, unitPrice: 100 })];

        const result = calculatePricing(items, "US", regularDate);

        expect(result.discount?.type).toBe("VOLUME_5_PLUS");
        expect(result.discount?.percentage).toBe(10);
        expect(result.discountAmount).toBe(50);
      });

      it("applies 20% discount for 10+ items", () => {
        const items = [createItem({ quantity: 10, unitPrice: 100 })];

        const result = calculatePricing(items, "US", regularDate);

        expect(result.discount?.type).toBe("VOLUME_10_PLUS");
        expect(result.discount?.percentage).toBe(20);
        expect(result.discountAmount).toBe(200);
      });

      it("applies 30% discount for 50+ items", () => {
        const items = [createItem({ quantity: 50, unitPrice: 100 })];

        const result = calculatePricing(items, "US", regularDate);

        expect(result.discount?.type).toBe("VOLUME_50_PLUS");
        expect(result.discount?.percentage).toBe(30);
        expect(result.discountAmount).toBe(1500);
      });

      it("sums quantities across multiple items for volume threshold", () => {
        const items = [
          createItem({ quantity: 3, unitPrice: 100 }),
          createItem({ productId: "prod-2", quantity: 3, unitPrice: 100 }),
        ];

        const result = calculatePricing(items, "US", regularDate);

        expect(result.discount?.type).toBe("VOLUME_5_PLUS");
      });
    });

    describe("Black Friday discount", () => {
      it("applies 25% Black Friday discount", () => {
        const blackFriday2025 = new Date(2025, 10, 28);
        const items = [createItem({ quantity: 1, unitPrice: 100 })];

        const result = calculatePricing(items, "US", blackFriday2025);

        expect(result.discount?.type).toBe("BLACK_FRIDAY");
        expect(result.discount?.percentage).toBe(25);
        expect(result.discountAmount).toBe(25);
      });

      it("prefers Black Friday over 10% volume discount", () => {
        const blackFriday2025 = new Date(2025, 10, 28);
        const items = [createItem({ quantity: 5, unitPrice: 100 })];

        const result = calculatePricing(items, "US", blackFriday2025);

        expect(result.discount?.type).toBe("BLACK_FRIDAY");
        expect(result.discount?.percentage).toBe(25);
      });

      it("prefers 30% volume discount over Black Friday", () => {
        const blackFriday2025 = new Date(2025, 10, 28);
        const items = [createItem({ quantity: 50, unitPrice: 100 })];

        const result = calculatePricing(items, "US", blackFriday2025);

        expect(result.discount?.type).toBe("VOLUME_50_PLUS");
        expect(result.discount?.percentage).toBe(30);
      });
    });

    describe("Polish holiday discount", () => {
      const newYearsDay = new Date(2025, 0, 1);

      it("applies 15% holiday discount for electronics category", () => {
        const items = [
          createItem({ quantity: 1, unitPrice: 100, category: "electronics" }),
        ];

        const result = calculatePricing(items, "US", newYearsDay);

        expect(result.discount?.type).toBe("HOLIDAY_SALE");
        expect(result.discount?.percentage).toBe(15);
      });

      it("applies 15% holiday discount for clothing category", () => {
        const items = [
          createItem({ quantity: 1, unitPrice: 100, category: "clothing" }),
        ];

        const result = calculatePricing(items, "US", newYearsDay);

        expect(result.discount?.type).toBe("HOLIDAY_SALE");
        expect(result.discount?.percentage).toBe(15);
      });

      it("does not apply holiday discount for non-eligible categories", () => {
        const items = [
          createItem({ quantity: 1, unitPrice: 100, category: "furniture" }),
        ];

        const result = calculatePricing(items, "US", newYearsDay);

        expect(result.discount).toBeNull();
      });

      it("applies holiday discount if any item is eligible", () => {
        const items = [
          createItem({ category: "furniture", unitPrice: 100 }),
          createItem({
            productId: "prod-2",
            category: "electronics",
            unitPrice: 50,
          }),
        ];

        const result = calculatePricing(items, "US", newYearsDay);

        expect(result.discount?.type).toBe("HOLIDAY_SALE");
      });

      it.each([
        [1, 1, "New Year"],
        [1, 6, "Epiphany"],
        [5, 1, "Labour Day"],
        [5, 3, "Constitution Day"],
        [8, 15, "Assumption of Mary"],
        [11, 1, "All Saints Day"],
        [11, 11, "Independence Day"],
        [12, 25, "Christmas Day"],
        [12, 26, "Second Day of Christmas"],
      ])("applies holiday discount on %i/%i (%s)", (month, day) => {
        const holidayDate = new Date(2025, month - 1, day);
        const items = [createItem({ category: "electronics" })];

        const result = calculatePricing(items, "US", holidayDate);

        expect(result.discount?.type).toBe("HOLIDAY_SALE");
      });
    });

    describe("region adjustments", () => {
      const regularDate = new Date(2025, 5, 15);

      it("applies 15% increase for EUROPE region", () => {
        const items = [createItem({ quantity: 1, unitPrice: 100 })];

        const result = calculatePricing(items, "EUROPE", regularDate);

        expect(result.regionAdjustmentPercentage).toBe(15);
        expect(result.regionAdjustment).toBe(15);
        expect(result.finalTotal).toBe(115);
      });

      it("applies 5% decrease for ASIA region", () => {
        const items = [createItem({ quantity: 1, unitPrice: 100 })];

        const result = calculatePricing(items, "ASIA", regularDate);

        expect(result.regionAdjustmentPercentage).toBe(-5);
        expect(result.regionAdjustment).toBe(-5);
        expect(result.finalTotal).toBe(95);
      });

      it("applies no adjustment for US region", () => {
        const items = [createItem({ quantity: 1, unitPrice: 100 })];

        const result = calculatePricing(items, "US", regularDate);

        expect(result.regionAdjustmentPercentage).toBe(0);
        expect(result.regionAdjustment).toBe(0);
        expect(result.finalTotal).toBe(100);
      });

      it("applies region adjustment after discount", () => {
        const items = [createItem({ quantity: 10, unitPrice: 100 })];

        const result = calculatePricing(items, "EUROPE", regularDate);

        expect(result.subtotal).toBe(1000);
        expect(result.discountAmount).toBe(200);
        expect(result.regionAdjustment).toBe(120);
        expect(result.finalTotal).toBe(920);
      });
    });

    describe("rounding", () => {
      it("rounds all monetary values to 2 decimal places", () => {
        const items = [createItem({ quantity: 3, unitPrice: 33.33 })];

        const result = calculatePricing(items, "US");

        expect(result.subtotal).toBe(99.99);
        expect(Number.isInteger(result.subtotal * 100)).toBe(true);
        expect(Number.isInteger(result.finalTotal * 100)).toBe(true);
      });
    });
  });

  describe("getPromotionalInfo", () => {
    it("detects Black Friday", () => {
      const blackFriday2025 = new Date(2025, 10, 28);

      const result = getPromotionalInfo(blackFriday2025);

      expect(result.isBlackFriday).toBe(true);
    });

    it("returns false for non-Black Friday dates", () => {
      const regularDay = new Date(2025, 5, 15);

      const result = getPromotionalInfo(regularDay);

      expect(result.isBlackFriday).toBe(false);
    });

    it("detects Polish holidays with name", () => {
      const christmasDay = new Date(2025, 11, 25);

      const result = getPromotionalInfo(christmasDay);

      expect(result.isHoliday).toBe(true);
      expect(result.holidayName).toBe("Christmas Day");
    });

    it("returns null holiday name for non-holidays", () => {
      const regularDay = new Date(2025, 5, 15);

      const result = getPromotionalInfo(regularDay);

      expect(result.isHoliday).toBe(false);
      expect(result.holidayName).toBeNull();
    });

    it("uses current date when no date provided", () => {
      const result = getPromotionalInfo();

      expect(result).toHaveProperty("isBlackFriday");
      expect(result).toHaveProperty("isHoliday");
      expect(result).toHaveProperty("holidayName");
    });
  });

  describe("getRegionPricingInfo", () => {
    it("returns correct info for US region", () => {
      const result = getRegionPricingInfo("US");

      expect(result.region).toBe("US");
      expect(result.adjustment).toBe(0);
      expect(result.description).toBe("Standard pricing");
    });

    it("returns correct info for EUROPE region", () => {
      const result = getRegionPricingInfo("EUROPE");

      expect(result.region).toBe("EUROPE");
      expect(result.adjustment).toBe(15);
      expect(result.description).toContain("15%");
      expect(result.description).toContain("VAT");
    });

    it("returns correct info for ASIA region", () => {
      const result = getRegionPricingInfo("ASIA");

      expect(result.region).toBe("ASIA");
      expect(result.adjustment).toBe(-5);
      expect(result.description).toContain("5%");
      expect(result.description).toContain("logistics");
    });
  });
});
