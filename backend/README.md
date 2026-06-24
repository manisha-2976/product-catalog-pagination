# CodeVector Product API

Small Express + MongoDB backend for browsing a large product collection.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `backend/.env`:

```bash
ATLASDB_URL=your_mongodb_connection_string
PORT=8080
```

3. Start the API:

```bash
npm start
```

## Endpoints

### Health

```http
GET /health
```

### List products

```http
GET /api/products?limit=20
GET /api/products?category=Electronics&limit=20
GET /api/products?limit=20&cursor=NEXT_CURSOR_HERE
```

Response shape:

```json
{
  "data": [
    {
      "id": "prod-000001",
      "name": "Classic Bluetooth Earbuds",
      "category": "Electronics",
      "price": 919,
      "created_at": "2026-01-01T00:01:00.000Z",
      "updated_at": "2026-01-01T02:01:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "has_next_page": true,
    "next_cursor": "encoded_cursor"
  }
}
```

### Categories

```http
GET /api/products/categories
```

## Pagination Approach

This API uses cursor pagination, not `skip`/`offset` pagination.

Products are sorted by:

1. `created_at` newest first
2. `_id` newest first as a tie-breaker

On the first request, the API stores a snapshot of the newest product in the cursor. Later pages only read products older than or equal to that snapshot. This keeps browsing stable when newer products are added while someone is already paging through results.

Indexes used:

```js
{ created_at: -1, _id: -1 }
{ category: 1, created_at: -1, _id: -1 }
```
