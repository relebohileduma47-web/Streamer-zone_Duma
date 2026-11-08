import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { Avatar, ContentCard, Empty, ErrorMessage, Spinner } from '../../components/Common';

export default function Home() {
  const { profile, profileLoaded } = useOutletContext();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.getContents({ featured: 'true', limit: 4 }), api.getContents({ limit: 8 })])
      .then(([f, l]) => {
        if (!active) return;
        setFeatured(f.items);
        setLatest(l.items);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading || !profileLoaded) return <Spinner label="Loading" />;

  const name = profile?.name || 'Your favourite creator';

  return (
    <div className="container page">
      <section className="channel">
        <div className="channel-banner" />
        <div className="channel-row">
          <Avatar profile={profile} size="xl" />
          <div className="channel-meta">
            <h1>{name}</h1>
            <p className="channel-bio">{profile?.bio || 'Videos, articles, podcasts and more, all in one place.'}</p>
            <Link to="/browse" className="btn">Browse all content</Link>
          </div>
        </div>
      </section>

      <ErrorMessage message={error} />

      {featured.length > 0 && (
        <section className="section">
          <h2>Featured</h2>
          <div className="vgrid">{featured.map((i) => <ContentCard key={i._id} item={i} />)}</div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Latest</h2>
          <Link to="/browse" className="link">See everything</Link>
        </div>
        {latest.length === 0 && !error ? (
          <Empty title="Nothing published yet">New content will show up here as soon as the creator publishes it.</Empty>
        ) : (
          <div className="vgrid">{latest.map((i) => <ContentCard key={i._id} item={i} />)}</div>
        )}
      </section>
    </div>
  );
}