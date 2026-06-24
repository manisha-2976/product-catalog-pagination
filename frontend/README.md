# Product Browser Frontend

Simple React + Vite UI for browsing products from the backend API.

## Run

Start the backend first:

```bash
cd ../backend
npm start
```

Then start the frontend:

```bash
cd ../frontend
npm run dev
```

The frontend reads from:

```bash
http://localhost:8080
```

To use another backend URL, create `frontend/.env`:

```bash
VITE_API_URL=https://your-backend-url.com
```
