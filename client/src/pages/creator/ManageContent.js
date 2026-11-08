import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Empty, ErrorMessage, Spinner } from '../../components/Common';
import { formatDateTime } from '../../utils';

const TABS = [['', 'All'], ['published', 'Published'], ['scheduled', 'Scheduled'], ['draft', 'Drafts']];

export default function ManageContent() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getAllContents({ status, q: query })
      .then((d) => { setItems(d.items); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, query]);

  useEffect(load, [load]);

  const patch = async (item, body) => {
    setBusyId(item._id);
    try {
      const updated = await api.updateContent(item._id, body);
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, ...updated } : i)));
    } catch (e) { setError(e.message); } finally { setBusyId(null); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? Its comments and likes will be deleted too.`)) return;
    setBusyId(item._id);
    try {
      await api.deleteContent(item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch (e) { setError(e.message); } finally { setBusyId(null); }
  };

  return (
    <>
      <div className="page-head">
        <h1>My content</h1>
        <Link to="/dashboard/content/new" className="btn">Add content</Link>
      </div>

      <div className="toolbar">
        <div className="chips">
          {TABS.map(([v, label]) => (
            <button key={label} className={`chip ${status === v ? 'chip-active' : ''}`} onClick={() => setStatus(v)}>{label}</button>
          ))}
        </div>
        <form className="search search-small" onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my content" aria-label="Search my content" />
          <button className="btn btn-small">Search</button>
        </form>
      </div>

      <ErrorMessage message={error} />
      {loading ? <Spinner /> : items.length === 0 ? (
        <Empty title="No content here yet">Add your first item to get started.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Content</th><th>Category</th><th>Status</th><th>Publication date</th><th>Views / likes</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id}>
                  <td>
                    <div className="cell-title">
                      {i.thumbnailUrl ? <img src={i.thumbnailUrl} alt="" /> : <span className="mini-thumb">{i.type}</span>}
                      <div>
                        <strong>{i.title}</strong>
                        <span className="muted small">{i.type}{i.featured ? ', featured' : ''}</span>
                      </div>
                    </div>
                  </td>
                  <td>{i.category}</td>
                  <td><span className={`status status-${i.displayStatus}`}>{i.displayStatus}</span></td>
                  <td>{formatDateTime(i.publishDate)}</td>
                  <td>{i.views} / {i.likesCount}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn btn-small btn-outline" to={`/dashboard/content/${i._id}/edit`}>Edit</Link>
                      {i.displayStatus === 'draft' ? (
                        <button className="btn btn-small" disabled={busyId === i._id} onClick={() => patch(i, { status: 'published', publishDate: new Date().toISOString() })}>Publish</button>
                      ) : (
                        <button className="btn btn-small btn-outline" disabled={busyId === i._id} onClick={() => patch(i, { status: 'draft' })}>Unpublish</button>
                      )}
                      <button className="btn btn-small btn-outline" disabled={busyId === i._id} onClick={() => patch(i, { featured: !i.featured })}>
                        {i.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button className="btn btn-small btn-danger" disabled={busyId === i._id} onClick={() => remove(i)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
