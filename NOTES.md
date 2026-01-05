# Notes

## 1. Assumptions & Simplifications

### What I Assumed

- All prices are in the same currency (no conversion needed)
- Customers pick a region when they sign up and it stays the same
- Only fixed Polish holidays are included
- Stock gets updated right away when an order is placed (no reservation system)

### What I Left Out

- **Authentication** - not needed for this demo, would just add noise
- **Pagination** - endpoints return everything for simplicity
- **Order cancellation** - focused on creating orders, not managing them
- **Redis caching** - set up the client but didn't use it yet
- **Event sourcing** - kept CQRS simple without full event history

### How I Interpreted Unclear Parts

- When someone gets both Black Friday discount and volume discount, I picked the bigger one (they don't stack)
- Region adjustment (like VAT) gets applied after the discount, not before
- Holiday sale only kicks in if the order has electronics or clothing in it

---

## 2. Technical Decisions

### Why MongoDB?

- Orders can have items embedded directly (no joins needed)
- Has transaction support for when I update stock
- Works nicely with TypeScript through Mongoose
- ObjectId makes ID handling easy

### Project Structure

I organized by feature instead of by layer:

```
src/
├── features/
│   ├── products/    → everything about products lives here
│   ├── customers/   → everything about customers lives here
│   └── orders/      → everything about orders lives here
├── infrastructure/  → CQRS buses, database connection
└── shared/          → stuff used everywhere (errors, discount logic)
```

This way, if I need to change something about products, all the code is in one place.

### How CQRS Works Here

**Commands** = things that change data (create product, place order)

- They don't return anything, just do the work
- Examples: `CreateProductCommand`, `CreateOrderCommand`

**Queries** = things that read data (get products, get customers)

- They return data without changing anything
- Examples: `GetProductsQuery`, `GetCustomersQuery`

The buses (`CommandBus`, `QueryBus`) act like a post office - you send a command/query and they figure out which handler should deal with it.

---

## 3. Business Logic

### How Discounts Work

**Available discounts:**

- 5+ items → 10% off
- 10+ items → 20% off
- 50+ items → 30% off
- Black Friday → 25% off
- Polish holiday + electronics/clothing → 15% off

**The rule:** Only the best discount applies. If someone orders 10 items on Black Friday, they get 25% (Black Friday beats the 20% volume discount).

**Region pricing:**

- US → normal price
- Europe → +15% (VAT)
- Asia → -5% (cheaper shipping)

The region adjustment happens after the discount is applied.

### How Stock Stays Consistent

1. Before placing an order, I check if all products have enough stock
2. If something is out of stock, the order fails immediately
3. Stock updates happen inside a MongoDB transaction
4. If anything goes wrong, everything rolls back (no partial updates)

This means two people can't buy the last item at the same time - one of them will get an error.

### Edge Cases I Handled

- Ordering more than available stock → clear error message with what's available
- Product or customer doesn't exist → 404 error before anything happens
- Empty order → validation rejects it
- Negative prices in validation → rejected

---

## 4. Testing

### What's Tested

**Unit tests (37 tests)** - [`discount.service.test.ts`](src/shared/services/discount.service.test.ts)

- All the discount calculations
- Volume thresholds (5+, 10+, 50+)
- Black Friday detection
- All 9 Polish holidays
- Region adjustments
- Rounding to 2 decimal places

**E2E tests (24 tests)** - [`api.e2e.test.ts`](src/e2e/api.e2e.test.ts)

- Creating products, customers, orders
- Getting lists with filters
- Stock updates after orders
- Discount and region adjustment in real orders
- Error responses (404, 400, 409)

The E2E tests spin up a real MongoDB in Docker using testcontainers, so they test the full flow.

### What's Missing for Production

- Tests for concurrent orders (two people ordering at the same time)
- Load testing
- Tests for the CQRS buses themselves
- More validation edge cases
- Security testing (malformed IDs, huge payloads)

### Running Tests

```bash
npm test          # unit tests in watch mode
npm run test:run  # unit tests once
npm run test:e2e  # e2e tests (needs Docker)
```
