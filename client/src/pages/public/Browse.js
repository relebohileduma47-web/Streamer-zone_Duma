import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { CATEGORIES } from '../../constants';
import { ContentCard, Empty, ErrorMessage, Spinner } from '../../components/Common';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'All';
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // reload the first page whenever the search text or category changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.getContents({ q, category, limit: 12, page: 1 })
      .then((d) => { if (active) { setItems(d.items); setPage(1); setPages(d.pages); setTotal(d.total); } })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [q, category]);

  const update = (next) => {
    const merged = { q, category, ...next };
    const clean = {};
    if (merged.q) clean.q = merged.q;
    if (merged.category && merged.category !== 'All') clean.category = merged.category;
    setParams(clean);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await api.getContents({ q, category, limit: 12, page: page + 1 });
      setItems((prev) => [...prev, ...d.items]);
      setPage(page + 1);
      setPages(d.pages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="container page">
      <div className="chipbar" role="group" aria-label="Filter by category">
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} className={`chip ${category === c ? 'chip-active' : ''}`} onClick={() => update({ category: c })} aria-pressed={category === c}>
            {c}
          </button>
        ))}
      </div>

      <div className="results-head">
        <h1>{q ? `Results for \u201C${q}\u201D` : category === 'All' ? 'All content' : category}</h1>
        {q && <button className="btn btn-small btn-soft" onClick={() => update({ q: '' })}>Clear search</button>}
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty title="No content found">Try a different keyword or choose another category.</Empty>
      ) : (
        <>
          <p className="muted small">{total} {total === 1 ? 'result' : 'results'}</p>
          <div className="vgrid">{items.map((i) => <ContentCard key={i._id} item={i} />)}</div>
          {page < pages && (
            <div className="center-block">
              <button className="btn btn-soft" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}