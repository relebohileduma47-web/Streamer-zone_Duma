import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

export function Spinner({ label = 'Loading' }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="center-block" role="status">
      <div className="spinner" />
      <p>{label}...</p>
      {slow && <p className="muted small">The server may be waking up. This can take up to a minute on free hosting.</p>}
    </div>
  );
}

export const ErrorMessage = ({ message }) => (message ? <div className="alert alert-error" role="alert">{message}</div> : null);

export const Empty = ({ title, children }) => (
  <div className="empty">
    <h3>{title}</h3>
    {children && <p className="muted">{children}</p>}
  </div>
);

// Round profile picture, or the creator's initials when there is no picture
export function Avatar({ profile, size = 'md' }) {
  const name = profile?.name || 'C';
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={`avatar avatar-${size}`}>
      {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initials}
    </span>
  );
}

// "3 days ago" style date
export function timeAgo(iso) {
  if (!iso) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [name, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function ContentCard({ item }) {
  const ctx = useOutletContext();
  const profile = ctx?.profile;
  return (
    <Link to={`/content/${item._id}`} className="vcard">
      <div className="vthumb">
        {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" loading="lazy" /> : <div className="vfallback">{item.type}</div>}
        <span className="vbadge">{item.type}</span>
      </div>
      <div className="vinfo">
        <Avatar profile={profile} size="sm" />
        <div>
          <h3 className="vtitle">{item.title}</h3>
          <p className="vsub">{profile?.name ? `${profile.name} \u2022 ` : ''}{item.category}</p>
          <p className="vsub">{`${item.views} views \u2022 ${timeAgo(item.publishDate)}`}</p>
        </div>
      </div>
    </Link>
  );
}