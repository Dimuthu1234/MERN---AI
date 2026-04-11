import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Detail() {
  const { id } = useParams(); // Get :id from URL
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch article + comments when id changes
  useEffect(() => {
    async function fetchDetail() {
      try {
        const [artRes, comRes] = await Promise.all([
          fetch(`https://jsonplaceholder.typicode.com/posts/${id}`),
          fetch(`https://jsonplaceholder.typicode.com/posts/${id}/comments`)
        ]);
        const artData = await artRes.json();
        const comData = await comRes.json();
        setArticle(artData);
        setComments(comData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]); // Re-fetch when id changes!

  if (loading) return <div className="spinner">⏳ Loading article...</div>;
  if (!article) return <div className="error-box">Article not found</div>;

  return (
    <div>
      <Link to="/" className="back-btn">← Back to Articles</Link>

      <div className="detail-card">
        <p style={{ opacity: 0.5, fontSize: 12, marginBottom: 8 }}>
          Article #{article.id} · User {article.userId}
        </p>
        <h2 style={{ fontSize: 22, marginBottom: 16, textTransform: 'capitalize', color: '#2dd4bf' }}>
          {article.title}
        </h2>
        <p style={{ lineHeight: 1.8, fontSize: 15 }}>{article.body}</p>

        {/* Comments Section */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #334155' }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>💬 Comments ({comments.length})</h3>
          {comments.map(comment => (
            <div key={comment.id} style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <p style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                {comment.name}
              </p>
              <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 6 }}>{comment.email}</p>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{comment.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Detail;
