import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import LiveClock from '../components/LiveClock';

function Home() {
  // 3 essential states for data fetching
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch data on mount (empty dependency array = run once)
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!response.ok) throw new Error('Failed to fetch articles');
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  // useEffect cleanup example: Debounced search
  // Waits 300ms after user stops typing before filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    // Cleanup: clear previous timer when search changes
    return () => {
      clearTimeout(timer); // This is the cleanup!
    };
  }, [search]);

  // Filter articles based on debounced search
  const filtered = articles.filter(article =>
    article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    article.body.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Loading state
  if (loading) {
    return <div className="spinner">⏳ Loading articles...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="error-box">
        <p>❌ {error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          🔄 Retry
        </button>
      </div>
    );
  }

  // Success state — show data
  return (
    <div>
      {/* useEffect Cleanup Demo: Live Clock */}
      <LiveClock />

      <input
        className="search-input"
        placeholder="🔍 Search articles by title or content..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="stats-bar">
        <span className="stat-pill">Total: <strong>{articles.length}</strong></span>
        <span className="stat-pill">Showing: <strong>{filtered.length}</strong></span>
        {search && <span className="stat-pill">Search: "<strong>{search}</strong>"</span>}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
          😕 No articles found for "{search}"
        </div>
      ) : (
        filtered.slice(0, 20).map(article => (
          <ArticleCard key={article.id} article={article} />
        ))
      )}
    </div>
  );
}

export default Home;
