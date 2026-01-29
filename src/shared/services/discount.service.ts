import type { CustomerRegion } from "@/shared/types";

const POLISH_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "New Year" },
  { month: 1, day: 6, name: "Epiphany" },
  { month: 5, day: 1, name: "Labour Day" },
  { month: 5, day: 3, name: "Constitution Day" },
  { month: 8, day: 15, name: "Assumption of Mary" },
  { month: 11, day: 1, name: "All Saints Day" },
  { month: 11, day: 11, name: "Independence Day" },
  { month: 12, day: 25, name: "Christmas Day" },
  { month: 12, day: 26, name: "Second Day of Christmas" },
];

const HOLIDAY_SALE_CATEGORIES = ["electronics", "clothing"];

function getBlackFriday(year: number): Date {
  const lastDay = new Date(year, 11, 0).getDate();

  for (let day = lastDay; day >= 1; day--) {
    const date = new Date(year, 10, day);
    if (date.getDay() === 5) {
      return date;
    }
  }
  return new Date(year, 10, 24);
}

function isBlackFriday(date: Date): boolean {
  const blackFriday = getBlackFriday(date.getFullYear());
  return (
    date.getMonth() === blackFriday.getMonth() &&
    date.getDate() === blackFriday.getDate()
  );
}

function isPolishHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return POLISH_HOLIDAYS.some((h) => h.month === month && h.day === day);
}

export interface DiscountInfo {
  type: string;
  percentage: number;
  description: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface PricingResult {
  subtotal: number;
  discount: DiscountInfo | null;
  discountAmount: number;
  regionAdjustment: number;
  regionAdjustmentPercentage: number;
  finalTotal: number;
}

export function calculatePricing(
  items: OrderItem[],
  customerRegion: CustomerRegion,
  orderDate: Date = new Date(),
): PricingResult {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const applicableDiscounts = getApplicableDiscounts(
    items,
    totalQuantity,
    orderDate,
  );

  const bestDiscount =
    applicableDiscounts.length > 0
      ? applicableDiscounts.reduce((best, current) =>
          current.percentage > best.percentage ? current : best,
        )
      : null;

  const discountAmount = bestDiscount
    ? subtotal * (bestDiscount.percentage / 100)
    : 0;

  const afterDiscount = subtotal - discountAmount;

  const regionAdjustmentPercentage = getRegionAdjustment(customerRegion);
  const regionAdjustment = afterDiscount * (regionAdjustmentPercentage / 100);

  const finalTotal = afterDiscount + regionAdjustment;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: bestDiscount,
    discountAmount: Math.round(discountAmount * 100) / 100,
    regionAdjustment: Math.round(regionAdjustment * 100) / 100,
    regionAdjustmentPercentage,
    finalTotal: Math.round(finalTotal * 100) / 100,
  };
}

function getApplicableDiscounts(
  items: OrderItem[],
  totalQuantity: number,
  orderDate: Date,
): DiscountInfo[] {
  const discounts: DiscountInfo[] = [];

  if (totalQuantity >= 50) {
    discounts.push({
      type: "VOLUME_50_PLUS",
      percentage: 30,
      description: "30% discount for 50+ units",
    });
  } else if (totalQuantity >= 10) {
    discounts.push({
      type: "VOLUME_10_PLUS",
      percentage: 20,
      description: "20% discount for 10+ units",
    });
  } else if (totalQuantity >= 5) {
    discounts.push({
      type: "VOLUME_5_PLUS",
      percentage: 10,
      description: "10% discount for 5+ units",
    });
  }

  if (isBlackFriday(orderDate)) {
    discounts.push({
      type: "BLACK_FRIDAY",
      percentage: 25,
      description: "Black Friday Sale - 25% off all products",
    });
  }

  if (isPolishHoliday(orderDate)) {
    const hasHolidayCategory = items.some((item) =>
      HOLIDAY_SALE_CATEGORIES.includes(item.category.toLowerCase()),
    );

    if (hasHolidayCategory) {
      discounts.push({
        type: "HOLIDAY_SALE",
        percentage: 15,
        description: `Holiday Sale - 15% off ${HOLIDAY_SALE_CATEGORIES.join(
          ", ",
        )}`,
      });
    }
  }

  return discounts;
}

function getRegionAdjustment(region: CustomerRegion): number {
  switch (region) {
    case "EUROPE":
      return 15;
    case "ASIA":
      return -5;
    default:
      return 0;
  }
}

export function getPromotionalInfo(date: Date = new Date()): {
  isBlackFriday: boolean;
  isHoliday: boolean;
  holidayName: string | null;
} {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const holiday = POLISH_HOLIDAYS.find(
    (h) => h.month === month && h.day === day,
  );

  return {
    isBlackFriday: isBlackFriday(date),
    isHoliday: !!holiday,
    holidayName: holiday?.name ?? null,
  };
}

export function getRegionPricingInfo(region: CustomerRegion): {
  region: CustomerRegion;
  adjustment: number;
  description: string;
} {
  const adjustment = getRegionAdjustment(region);

  let description: string;
  switch (region) {
    case "EUROPE":
      description = "Prices increased by 15% due to VAT";
      break;
    case "ASIA":
      description = "Prices reduced by 5% due to lower logistics costs";
      break;
    default:
      description = "Standard pricing";
  }

  return { region, adjustment, description };
}
