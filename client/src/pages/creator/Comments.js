import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import { Empty, ErrorMessage, Spinner } from '../../components/Common';
import { formatDateTime } from '../../utils';

const TABS = [['', 'All'], ['pending', 'Awaiting approval'], ['approved', 'Approved'], ['hidden', 'Hidden']];

export default function Comments() {
  const [status, setStatus] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.getAllComments({ status })
      .then((d) => { setComments(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);
  useEffect(load, [load]);

  const setCommentStatus = async (c, next) => {
    try {
      const updated = await api.setCommentStatus(c._id, next);
      setComments((prev) => (status && status !== next ? prev.filter((x) => x._id !== c._id) : prev.map((x) => (x._id === c._id ? updated : x))));
    } catch (e) { setError(e.message); }
  };

  const remove = async (c) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try { await api.deleteComment(c._id); setComments((prev) => prev.filter((x) => x._id !== c._id)); }
    catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="page-head"><h1>Comments</h1></div>
      <div className="chips">
        {TABS.map(([v, label]) => (
          <button key={label} className={`chip ${status === v ? 'chip-active' : ''}`} onClick={() => setStatus(v)}>{label}</button>
        ))}
      </div>
      <ErrorMessage message={error} />
      {loading ? <Spinner /> : comments.length === 0 ? (
        <Empty title="No comments here">Comments from viewers will appear here for you to review.</Empty>
      ) : (
        <ul className="mod-list">
          {comments.map((c) => (
            <li key={c._id} className="panel">
              <div className="comment-head">
                <strong>{c.displayName}</strong>
                <span className={`status status-${c.status}`}>{c.status}</span>
              </div>
              <p>{c.text}</p>
              <p className="muted small">On "{c.content?.title || 'deleted content'}", {formatDateTime(c.createdAt)}</p>
              <div className="row-actions">
                {c.status !== 'approved' && <button className="btn btn-small" onClick={() => setCommentStatus(c, 'approved')}>Approve</button>}
                {c.status !== 'hidden' && <button className="btn btn-small btn-outline" onClick={() => setCommentStatus(c, 'hidden')}>Hide</button>}
                <button className="btn btn-small btn-danger" onClick={() => remove(c)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
