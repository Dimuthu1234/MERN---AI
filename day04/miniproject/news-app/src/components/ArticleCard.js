import { useNavigate } from 'react-router-dom';

function ArticleCard({ article }) {
  const navigate = useNavigate();

  return (
    <div className="article-card" onClick={() => navigate(`/post/${article.id}`)}>
      <h3>#{article.id} — {article.title}</h3>
      <p>{article.body.substring(0, 120)}...</p>
    </div>
  );
}

export default ArticleCard;
