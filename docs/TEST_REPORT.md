# Test Report

Generated with `npm run test:coverage` (Vitest 5.0.5, Node v26.5.0).

## Summary

| Suite | Files | Tests | Result |
|---|---|---|---|
| API (Node, real Postgres via PGlite) | 9 | 97 | all passing |
| Web (jsdom + Testing Library) | 12 | 60 | all passing |
| **Total** | **21** | **157** | **157 passed, 0 failed** |

## Coverage

| Metric | Coverage |
|---|---|
| Statements | 93.3% |
| Branches | 90.8% |
| Functions | 90.7% |
| Lines | 95.1% |

The React Bits WebGL components, the process entry points and seed scripts are excluded: they need a GPU or a running server and are exercised manually and in the deployed app.

## Test files

| File | Tests | Passed |
|---|---|---|
| `server/tests/auth.test.ts` | 15 | 15 |
| `server/tests/bootstrap.test.ts` | 3 | 3 |
| `server/tests/catalog.test.ts` | 3 | 3 |
| `server/tests/errors.test.ts` | 4 | 4 |
| `server/tests/inventory.test.ts` | 19 | 19 |
| `server/tests/search.test.ts` | 10 | 10 |
| `server/tests/tokenService.test.ts` | 3 | 3 |
| `server/tests/unit.test.ts` | 10 | 10 |
| `server/tests/vehicles.test.ts` | 30 | 30 |
| `src/App.test.tsx` | 7 | 7 |
| `src/components/FilterBar.test.tsx` | 5 | 5 |
| `src/components/VehicleCard.test.tsx` | 5 | 5 |
| `src/components/VehicleFormDialog.test.tsx` | 2 | 2 |
| `src/components/VehiclePhoto.test.tsx` | 4 | 4 |
| `src/hooks/useInventory.test.ts` | 7 | 7 |
| `src/lib/api.test.ts` | 6 | 6 |
| `src/lib/format.test.ts` | 5 | 5 |
| `src/pages/InventoryPage.test.tsx` | 12 | 12 |
| `src/pages/LoginPage.test.tsx` | 2 | 2 |
| `src/pages/PurchasesPage.test.tsx` | 3 | 3 |
| `src/pages/RegisterPage.test.tsx` | 2 | 2 |

## Test cases

### server/tests/auth.test.ts

- PASS Auth API POST /api/auth/register creates a user and returns a token without leaking the password hash
- PASS Auth API POST /api/auth/register never lets a client register itself as an admin
- PASS Auth API POST /api/auth/register rejects a duplicate email regardless of letter case
- PASS Auth API POST /api/auth/register returns 400 for an invalid email
- PASS Auth API POST /api/auth/register returns 400 for a short password
- PASS Auth API POST /api/auth/register returns 400 for a missing name
- PASS Auth API POST /api/auth/login returns a token for valid credentials
- PASS Auth API POST /api/auth/login rejects a wrong password with a generic message
- PASS Auth API POST /api/auth/login rejects an unknown email with the same generic message
- PASS Auth API POST /api/auth/login returns 400 when fields are missing
- PASS Auth API GET /api/auth/me returns the current user for a valid token
- PASS Auth API GET /api/auth/me returns 401 without a token
- PASS Auth API GET /api/auth/me returns 401 for a tampered token
- PASS Auth API unknown routes returns a JSON 404
- PASS Auth API unknown routes reports health without authentication

### server/tests/bootstrap.test.ts

- PASS bootstrap migrates, seeds demo vehicles and creates the admin account
- PASS bootstrap is idempotent and does not re-seed after the catalogue is emptied
- PASS bootstrap skips demo data when seeding is disabled

### server/tests/catalog.test.ts

- PASS refreshDemoCatalog replaces legacy demo cars with the current catalogue and keeps admin-added cars
- PASS refreshDemoCatalog updates catalogue cars that already exist instead of duplicating them, keeping their stock
- PASS refreshDemoCatalog keeps purchase history when a legacy car is removed

### server/tests/errors.test.ts

- PASS error handling rejects malformed JSON with a 400
- PASS error handling hides unexpected errors behind a generic 500
- PASS error handling rejects a token whose account was deleted
- PASS error handling sends security headers

### server/tests/inventory.test.ts

- PASS Inventory API POST /api/vehicles/:id/purchase decreases the quantity by one by default
- PASS Inventory API POST /api/vehicles/:id/purchase supports buying several units at once
- PASS Inventory API POST /api/vehicles/:id/purchase returns 409 when the vehicle is out of stock
- PASS Inventory API POST /api/vehicles/:id/purchase returns 409 and leaves stock untouched when asking for more than is available
- PASS Inventory API POST /api/vehicles/:id/purchase never oversells under concurrent purchases
- PASS Inventory API POST /api/vehicles/:id/purchase returns 404 for an unknown vehicle
- PASS Inventory API POST /api/vehicles/:id/purchase returns 400 for an invalid quantity
- PASS Inventory API POST /api/vehicles/:id/purchase requires authentication
- PASS Inventory API POST /api/vehicles/:id/restock lets an admin increase the quantity
- PASS Inventory API POST /api/vehicles/:id/restock forbids regular users from restocking
- PASS Inventory API POST /api/vehicles/:id/restock returns 400 for quantity 0
- PASS Inventory API POST /api/vehicles/:id/restock returns 400 for quantity -2
- PASS Inventory API POST /api/vehicles/:id/restock returns 400 for quantity 2.5
- PASS Inventory API POST /api/vehicles/:id/restock returns 400 for quantity ten
- PASS Inventory API POST /api/vehicles/:id/restock requires a quantity
- PASS Inventory API POST /api/vehicles/:id/restock returns 404 for an unknown vehicle
- PASS Inventory API GET /api/purchases returns only the signed-in user's purchases, newest first
- PASS Inventory API GET /api/purchases keeps purchase history after the vehicle is deleted
- PASS Inventory API GET /api/vehicles/stats summarises the inventory for the dashboard

### server/tests/search.test.ts

- PASS GET /api/vehicles/search matches make case-insensitively
- PASS GET /api/vehicles/search matches partial model names
- PASS GET /api/vehicles/search filters by exact category, ignoring case
- PASS GET /api/vehicles/search filters by an inclusive price range
- PASS GET /api/vehicles/search supports only a lower or only an upper bound
- PASS GET /api/vehicles/search combines filters with AND
- PASS GET /api/vehicles/search returns everything when no filters are given
- PASS GET /api/vehicles/search treats SQL wildcard characters literally
- PASS GET /api/vehicles/search returns 400 for a non-numeric price
- PASS GET /api/vehicles/search returns 400 when minPrice is greater than maxPrice

### server/tests/tokenService.test.ts

- PASS TokenService round-trips the user id and role
- PASS TokenService rejects tokens signed with another secret
- PASS TokenService rejects expired tokens

### server/tests/unit.test.ts

- PASS buildSearchClause returns no WHERE clause without filters
- PASS buildSearchClause numbers placeholders in the order filters are applied
- PASS buildSearchClause keeps a zero price bound instead of dropping it
- PASS escapeLike escapes %, _ and backslashes
- PASS validate returns parsed data and coerces query-string numbers
- PASS validate treats empty query values as absent filters
- PASS validate throws a ValidationError with field details
- PASS loadConfig uses development defaults
- PASS loadConfig refuses to run in production without a JWT secret
- PASS loadConfig reads the admin seed and database settings

### server/tests/vehicles.test.ts

- PASS Vehicles API authentication get /api/vehicles requires a token
- PASS Vehicles API authentication get /api/vehicles/search requires a token
- PASS Vehicles API authentication post /api/vehicles requires a token
- PASS Vehicles API authentication put /api/vehicles/00000000-0000-4000-8000-000000000000 requires a token
- PASS Vehicles API authentication delete /api/vehicles/00000000-0000-4000-8000-000000000000 requires a token
- PASS Vehicles API POST /api/vehicles lets an admin add a vehicle with a generated id
- PASS Vehicles API POST /api/vehicles forbids regular users from adding vehicles
- PASS Vehicles API POST /api/vehicles returns 400 for a missing make
- PASS Vehicles API POST /api/vehicles returns 400 for a negative price
- PASS Vehicles API POST /api/vehicles returns 400 for a fractional quantity
- PASS Vehicles API POST /api/vehicles returns 400 for a negative quantity
- PASS Vehicles API POST /api/vehicles returns 400 for an empty category
- PASS Vehicles API POST /api/vehicles stores an optional photo with its credit
- PASS Vehicles API POST /api/vehicles leaves the photo fields null when no photo is given
- PASS Vehicles API POST /api/vehicles rejects the photo URL javascript:alert(1)
- PASS Vehicles API POST /api/vehicles rejects the photo URL ftp://example.com/car.jpg
- PASS Vehicles API POST /api/vehicles rejects the photo URL not a url
- PASS Vehicles API POST /api/vehicles defaults quantity to zero when omitted
- PASS Vehicles API GET /api/vehicles lists every vehicle for any signed-in user
- PASS Vehicles API GET /api/vehicles returns an empty list when the lot is empty
- PASS Vehicles API GET /api/vehicles/:id returns a single vehicle
- PASS Vehicles API GET /api/vehicles/:id returns 404 for malformed or unknown ids
- PASS Vehicles API PUT /api/vehicles/:id updates only the supplied fields
- PASS Vehicles API PUT /api/vehicles/:id can remove a photo by setting it to null
- PASS Vehicles API PUT /api/vehicles/:id returns 400 for an empty update
- PASS Vehicles API PUT /api/vehicles/:id returns 404 for an unknown vehicle
- PASS Vehicles API PUT /api/vehicles/:id forbids regular users from editing vehicles
- PASS Vehicles API DELETE /api/vehicles/:id lets an admin delete a vehicle
- PASS Vehicles API DELETE /api/vehicles/:id forbids regular users from deleting
- PASS Vehicles API DELETE /api/vehicles/:id returns 404 for an unknown vehicle

### src/App.test.tsx

- PASS App routing shows the landing page to visitors
- PASS App routing sends visitors to the login page when they open the showroom
- PASS App routing sends signed-in users from login to the showroom
- PASS App routing marks admins in the navigation
- PASS App routing signs out and returns to the login page
- PASS App routing drops an invalid stored session
- PASS App routing renders a friendly 404

### src/components/FilterBar.test.tsx

- PASS FilterBar reports make and price changes
- PASS FilterBar selects a category from the chips and marks the active one
- PASS FilterBar toggles in-stock-only and changes the sort order
- PASS FilterBar only enables reset when something is filtered
- PASS FilterBar resets when a filter is active

### src/components/VehicleCard.test.tsx

- PASS VehicleCard shows the vehicle details and price
- PASS VehicleCard calls onPurchase when the purchase button is clicked
- PASS VehicleCard disables the purchase button when the quantity is zero
- PASS VehicleCard hides admin actions from regular users
- PASS VehicleCard gives admins edit, restock and delete actions

### src/components/VehicleFormDialog.test.tsx

- PASS toPayload trims text and converts numbers
- PASS toPayload sends a blank price as null so the API rejects it instead of saving $0

### src/components/VehiclePhoto.test.tsx

- PASS VehiclePhoto shows the photo with descriptive alt text and a linked credit
- PASS VehiclePhoto falls back to the illustration when the photo fails to load
- PASS VehiclePhoto uses the illustration when there is no photo
- PASS VehiclePhoto can hide the credit on small thumbnails

### src/hooks/useInventory.test.ts

- PASS hasFilters ignores blank values
- PASS useInventory lists all vehicles when no filters are set
- PASS useInventory uses the search endpoint when a filter is set
- PASS useInventory exposes load errors
- PASS useVisibleVehicles hides sold-out cars when asked
- PASS useVisibleVehicles sorts by price in both directions and by name
- PASS useVisibleVehicles puts in-stock cars first for the featured order

### src/lib/api.test.ts

- PASS toQuery drops empty and whitespace-only filters
- PASS request sends the stored token as a bearer header
- PASS request turns error responses into ApiError with validation details
- PASS request notifies listeners when a signed-in request is rejected with 401
- PASS request reports network failures with a friendly message
- PASS request encodes search filters into the query string

### src/lib/format.test.ts

- PASS format helpers formats whole-dollar prices
- PASS format helpers describes a stock of 0 as out
- PASS format helpers describes a stock of 1 as low
- PASS format helpers describes a stock of 2 as low
- PASS format helpers describes a stock of 3 as in

### src/pages/InventoryPage.test.tsx

- PASS InventoryPage for customers lists vehicles with stats and disables purchase for sold-out cars
- PASS InventoryPage for customers buys a car and updates its stock in place
- PASS InventoryPage for customers shows the server message when a purchase fails
- PASS InventoryPage for customers switches to the search endpoint when filtering
- PASS InventoryPage for customers shows an empty state when nothing matches
- PASS InventoryPage for customers offers a retry when loading fails
- PASS InventoryPage for admins adds a vehicle through the form
- PASS InventoryPage for admins shows validation errors from the API in the form
- PASS InventoryPage for admins edits a vehicle and updates the card
- PASS InventoryPage for admins restocks a sold-out vehicle
- PASS InventoryPage for admins deletes a vehicle after confirmation
- PASS InventoryPage for admins keeps the confirmation open when deleting fails

### src/pages/LoginPage.test.tsx

- PASS LoginPage signs in, stores the token and goes to the showroom
- PASS LoginPage shows the server error when credentials are wrong

### src/pages/PurchasesPage.test.tsx

- PASS PurchasesPage lists purchases with totals
- PASS PurchasesPage invites the user to shop when the garage is empty
- PASS PurchasesPage shows load errors

### src/pages/RegisterPage.test.tsx

- PASS RegisterPage creates the account and opens the showroom
- PASS RegisterPage shows why registration failed
