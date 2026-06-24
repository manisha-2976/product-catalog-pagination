import { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const PAGE_LIMIT = 12;

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div>
        <span className="category">{product.category}</span>
        <h2>{product.name}</h2>
      </div>

      <div className="product-meta">
        <strong>{formatPrice(product.price)}</strong>
        <span>Created {formatDate(product.created_at)}</span>
      </div>
    </article>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/categories`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load categories');
      }

      setCategories(result.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadProducts = async ({ cursor = null, category = selectedCategory } = {}) => {
    setLoading(true);
    setError('');

    try {
      const url = new URL(`${API_BASE_URL}/api/products`);
      url.searchParams.set('limit', PAGE_LIMIT);

      if (category) {
        url.searchParams.set('category', category);
      }

      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load products');
      }

      setProducts((currentProducts) => (
        cursor ? [...currentProducts, ...result.data] : result.data
      ));
      setNextCursor(result.pagination.next_cursor);
      setHasNextPage(result.pagination.has_next_page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setNextCursor(null);
    setProducts([]);
    loadProducts({ category });
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  return (
    <main className="page">
      <section className="top-bar">
        <div>
          <p className="eyebrow">Product browser</p>
          <h1>Products</h1>
        </div>

        <label className="filter">
          <span>Category</span>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && <p className="message error">{error}</p>}

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {!loading && products.length === 0 && !error && (
        <p className="message">No products found.</p>
      )}

      <div className="actions">
        {loading && <p className="message">Loading products...</p>}

        {!loading && hasNextPage && (
          <button type="button" onClick={() => loadProducts({ cursor: nextCursor })}>
            Load more
          </button>
        )}
      </div>
    </main>
  );
}

export default App;
