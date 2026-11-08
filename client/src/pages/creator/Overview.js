import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Empty, ErrorMessage, Spinner } from '../../components/Common';
import { formatDateTime } from '../../utils';

export default function Overview() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.getStats().then(setS).catch((e) => setError(e.message)); }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!s) return <Spinner />;

  const cards = [
    ['Total content', s.totalContent],
    ['Published', s.published],
    ['Drafts', s.drafts],
    ['Scheduled', s.scheduled],
    ['Comments', s.totalComments],
    ['Awaiting approval', s.pendingComments],
    ['Total views', s.totalViews],
    ['Total likes', s.totalLikes],
  ];

  return (
    <>
      <div className="page-head">
        <h1>Overview</h1>
        <Link to="/dashboard/content/new" className="btn">Add content</Link>
      </div>

      <div className="stats">
        {cards.map(([label, value]) => (
          <div className="stat" key={label}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>Most viewed</h2>
          {s.popular.length === 0 ? <Empty title="No published content yet" /> : (
            <ol className="rank">
              {s.popular.map((p) => (
                <li key={p._id}>
                  <Link to={`/content/${p._id}`}>{p.title}</Link>
                  <span className="muted small">{p.views} views, {p.likesCount} likes</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel">
          <div className="section-head"><h2>Latest comments</h2><Link className="link" to="/dashboard/comments">Moderate</Link></div>
          {s.recentComments.length === 0 ? <Empty title="No comments yet" /> : (
            <ul className="plain">
              {s.recentComments.map((c) => (
                <li key={c._id}>
                  <strong>{c.displayName}</strong> on <em>{c.content?.title || 'deleted content'}</em>
                  <p>{c.text}</p>
                  <span className="muted small">{formatDateTime(c.createdAt)}, {c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
