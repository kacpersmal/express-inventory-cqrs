import {
  MongoDBContainer,
  type StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import type { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let mongoContainer: StartedMongoDBContainer;
let app: Express;

beforeAll(async () => {
  mongoContainer = await new MongoDBContainer("mongo:7").start();

  const mongoUri = mongoContainer.getConnectionString();

  process.env.MONGODB_URI = `${mongoUri}?directConnection=true`;
  process.env.REDIS_URL = "redis://localhost:6379";
  process.env.NODE_ENV = "test";

  await mongoose.connect(process.env.MONGODB_URI);

  const appModule = await import("@/app");
  app = appModule.default;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoContainer?.stop();
}, 30000);

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

describe("Health Check", () => {
  it("GET /health returns ok status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.timestamp).toBeDefined();
  });
});

describe("Products API", () => {
  describe("POST /api/products", () => {
    it("creates a new product", async () => {
      const productData = {
        name: "Test Product",
        description: "A test product",
        price: 99.99,
        stock: 100,
        category: "electronics",
      };

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
      expect(response.body.data.stock).toBe(productData.stock);
    });

    it("returns 400 for invalid product data", async () => {
      const invalidData = {
        name: "",
        price: -10,
      };

      const response = await request(app)
        .post("/api/products")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toBeDefined();
    });
  });

  describe("GET /api/products", () => {
    it("returns empty array when no products exist", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    it("returns all products", async () => {
      await request(app).post("/api/products").send({
        name: "Product 1",
        description: "Description 1",
        price: 50,
        stock: 10,
        category: "electronics",
      });
      await request(app).post("/api/products").send({
        name: "Product 2",
        description: "Description 2",
        price: 75,
        stock: 20,
        category: "clothing",
      });

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it("filters products by category", async () => {
      await request(app).post("/api/products").send({
        name: "Electronics Item",
        description: "Desc",
        price: 100,
        stock: 10,
        category: "electronics",
      });
      await request(app).post("/api/products").send({
        name: "Clothing Item",
        description: "Desc",
        price: 50,
        stock: 5,
        category: "clothing",
      });

      const response = await request(app)
        .get("/api/products")
        .query({ category: "electronics" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe("electronics");
    });
  });

  describe("POST /api/products/:id/restock", () => {
    it("increases product stock", async () => {
      const createResponse = await request(app).post("/api/products").send({
        name: "Restock Test",
        description: "Desc",
        price: 100,
        stock: 10,
        category: "general",
      });
      const productId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/products/${productId}/restock`)
        .send({ quantity: 50 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.previousStock).toBe(10);
      expect(response.body.data.addedQuantity).toBe(50);
      expect(response.body.data.newStock).toBe(60);
    });

    it("returns 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post(`/api/products/${fakeId}/restock`)
        .send({ quantity: 10 });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/products/:id/sell", () => {
    it("decreases product stock", async () => {
      const createResponse = await request(app).post("/api/products").send({
        name: "Sell Test",
        description: "Desc",
        price: 100,
        stock: 50,
        category: "general",
      });
      const productId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/products/${productId}/sell`)
        .send({ quantity: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.previousStock).toBe(50);
      expect(response.body.data.soldQuantity).toBe(10);
      expect(response.body.data.newStock).toBe(40);
    });

    it("returns 400 for insufficient stock", async () => {
      const createResponse = await request(app).post("/api/products").send({
        name: "Low Stock",
        description: "Desc",
        price: 100,
        stock: 5,
        category: "general",
      });
      const productId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/products/${productId}/sell`)
        .send({ quantity: 10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Insufficient stock");
    });
  });
});

describe("Customers API", () => {
  describe("POST /api/customers", () => {
    it("creates a new customer", async () => {
      const customerData = {
        name: "John Doe",
        email: "john@example.com",
        region: "US",
      };

      const response = await request(app)
        .post("/api/customers")
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(customerData.name);
      expect(response.body.data.email).toBe(customerData.email);
      expect(response.body.data.region).toBe(customerData.region);
    });

    it("returns 409 for duplicate email", async () => {
      const customerData = {
        name: "John Doe",
        email: "duplicate@example.com",
        region: "US",
      };

      await request(app).post("/api/customers").send(customerData);

      const response = await request(app)
        .post("/api/customers")
        .send({ ...customerData, name: "Jane Doe" });

      expect(response.status).toBe(409);
    });

    it("returns 400 for invalid email", async () => {
      const response = await request(app).post("/api/customers").send({
        name: "Invalid Email",
        email: "not-an-email",
        region: "US",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/customers", () => {
    it("returns all customers", async () => {
      await request(app).post("/api/customers").send({
        name: "Customer 1",
        email: "c1@example.com",
        region: "US",
      });
      await request(app).post("/api/customers").send({
        name: "Customer 2",
        email: "c2@example.com",
        region: "EUROPE",
      });

      const response = await request(app).get("/api/customers");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customers).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it("filters customers by region", async () => {
      await request(app).post("/api/customers").send({
        name: "US Customer",
        email: "us@example.com",
        region: "US",
      });
      await request(app).post("/api/customers").send({
        name: "EU Customer",
        email: "eu@example.com",
        region: "EUROPE",
      });

      const response = await request(app)
        .get("/api/customers")
        .query({ region: "EUROPE" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customers).toHaveLength(1);
      expect(response.body.data.customers[0].region).toBe("EUROPE");
    });
  });
});

describe("Orders API", () => {
  describe("POST /api/orders", () => {
    it("creates an order and updates stock", async () => {
      const productResponse = await request(app).post("/api/products").send({
        name: "Order Product",
        description: "Desc",
        price: 100,
        stock: 50,
        category: "electronics",
      });
      const productId = productResponse.body.data.id;

      const customerResponse = await request(app).post("/api/customers").send({
        name: "Order Customer",
        email: "order@example.com",
        region: "US",
      });
      const customerId = customerResponse.body.data.id;

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId,
          products: [{ productId, quantity: 5 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.customerId).toBe(customerId);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].quantity).toBe(5);
      expect(response.body.data.subtotal).toBe(500);

      const productsResponse = await request(app).get("/api/products");
      const updatedProduct = productsResponse.body.data.products.find(
        (p: { id: string }) => p.id === productId,
      );
      expect(updatedProduct.stock).toBe(45);
    });

    it("applies volume discount for 10+ items", async () => {
      const productResponse = await request(app).post("/api/products").send({
        name: "Bulk Product",
        description: "Desc",
        price: 100,
        stock: 100,
        category: "general",
      });
      const productId = productResponse.body.data.id;

      const customerResponse = await request(app).post("/api/customers").send({
        name: "Bulk Buyer",
        email: "bulk@example.com",
        region: "US",
      });
      const customerId = customerResponse.body.data.id;

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId,
          products: [{ productId, quantity: 10 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subtotal).toBe(1000);
      expect(response.body.data.discountPercentage).toBe(20);
      expect(response.body.data.discountAmount).toBe(200);
      expect(response.body.data.finalTotal).toBe(800);
    });

    it("applies region adjustment for EUROPE customer", async () => {
      const productResponse = await request(app).post("/api/products").send({
        name: "EU Product",
        description: "Desc",
        price: 100,
        stock: 50,
        category: "general",
      });
      const productId = productResponse.body.data.id;

      const customerResponse = await request(app).post("/api/customers").send({
        name: "EU Customer",
        email: "eu-order@example.com",
        region: "EUROPE",
      });
      const customerId = customerResponse.body.data.id;

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId,
          products: [{ productId, quantity: 1 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subtotal).toBe(100);
      expect(response.body.data.regionAdjustment).toBe(15);
      expect(response.body.data.finalTotal).toBe(115);
    });

    it("returns 400 for insufficient stock", async () => {
      const productResponse = await request(app).post("/api/products").send({
        name: "Low Stock Product",
        description: "Desc",
        price: 100,
        stock: 5,
        category: "general",
      });
      const productId = productResponse.body.data.id;

      const customerResponse = await request(app).post("/api/customers").send({
        name: "Customer",
        email: "stock-test@example.com",
        region: "US",
      });
      const customerId = customerResponse.body.data.id;

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId,
          products: [{ productId, quantity: 10 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Insufficient stock");
    });

    it("returns 404 for non-existent customer", async () => {
      const productResponse = await request(app).post("/api/products").send({
        name: "Some Product",
        description: "Desc",
        price: 100,
        stock: 50,
        category: "general",
      });
      const productId = productResponse.body.data.id;

      const fakeCustomerId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId: fakeCustomerId,
          products: [{ productId, quantity: 1 }],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Customer");
    });

    it("returns 404 for non-existent product", async () => {
      const customerResponse = await request(app).post("/api/customers").send({
        name: "Customer",
        email: "product-test@example.com",
        region: "US",
      });
      const customerId = customerResponse.body.data.id;

      const fakeProductId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId,
          products: [{ productId: fakeProductId, quantity: 1 }],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Product");
    });

    it("handles multiple products in one order", async () => {
      const product1 = await request(app).post("/api/products").send({
        name: "Product A",
        description: "Desc",
        price: 50,
        stock: 100,
        category: "electronics",
      });
      const product2 = await request(app).post("/api/products").send({
        name: "Product B",
        description: "Desc",
        price: 75,
        stock: 100,
        category: "clothing",
      });

      const customer = await request(app).post("/api/customers").send({
        name: "Multi Product Customer",
        email: "multi@example.com",
        region: "US",
      });

      const response = await request(app)
        .post("/api/orders")
        .send({
          customerId: customer.body.data.id,
          products: [
            { productId: product1.body.data.id, quantity: 2 },
            { productId: product2.body.data.id, quantity: 3 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.subtotal).toBe(325);
    });
  });
});

describe("Error Handling", () => {
  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
  });

  it("returns proper error format for validation errors", async () => {
    const response = await request(app).post("/api/products").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toBeDefined();
  });
});
