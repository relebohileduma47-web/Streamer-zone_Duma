import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Avatar, ErrorMessage, Spinner, timeAgo } from '../../components/Common';
import { formatDate, formatDateTime, getSavedName, getViewerId, isDirectFile, saveName, youtubeEmbed } from '../../utils';

function Media({ item }) {
  const url = item.mediaUrl;
  if (item.type === 'article') {
    const paragraphs = (item.articleContent || '').split(/\n{2,}/).filter(Boolean);
    return (
      <article className="article">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {url && <a className="link" href={url} target="_blank" rel="noopener noreferrer">Read the original article</a>}
      </article>
    );
  }
  const embed = youtubeEmbed(url);
  if (embed) {
    return (
      <div className="embed">
        <iframe src={embed} title={item.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
      </div>
    );
  }
  if (item.type === 'image') return <img className="media-image" src={url} alt={item.title} />;
  if (isDirectFile(url, ['.mp3', '.wav', '.ogg', '.m4a', '.aac'])) return <audio className="media-audio" controls src={url} />;
  if (isDirectFile(url, ['.mp4', '.webm', '.mov'])) return <video className="media-video" controls src={url} />;
  return <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open {item.type}</a>;
}

export default function ContentDetail() {
  const { id } = useParams();
  const { profile } = useOutletContext();
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [like, setLike] = useState({ liked: false, likesCount: 0 });
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const [name, setName] = useState(getSavedName());
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentMsg, setCommentMsg] = useState({ type: '', text: '' });
  const counted = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setError('');
    Promise.all([api.getContent(id), api.getComments(id), api.getLikeStatus(id, getViewerId())])
      .then(([c, cm, l]) => {
        if (!active) return;
        setItem(c); setViews(c.views); setComments(cm); setLike(l);
        if (counted.current !== id) {       // count one view per visit
          counted.current = id;
          api.recordView(id).then((v) => active && setViews(v.views)).catch(() => {});
        }
      })
      .catch((e) => active && (e.status === 404 || e.status === 400 ? setNotFound(true) : setError(e.message)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const toggleLike = async () => {
    try {
      const r = await api.toggleLike({ contentId: id, viewerId: getViewerId() });
      setLike({ liked: r.liked, likesCount: r.likesCount });
    } catch (e) { setError(e.message); }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: item.title, url }); return; }
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied');
    } catch {
      setShareMsg('Copy this link: ' + url);
    }
    setTimeout(() => setShareMsg(''), 3000);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    setCommentMsg({ type: '', text: '' });
    setPosting(true);
    try {
      const r = await api.postComment({ contentId: id, displayName: name.trim(), text: text.trim(), viewerId: getViewerId() });
      saveName(name.trim());
      setText('');
      if (r.comment.status === 'approved') setComments((prev) => [r.comment, ...prev]);
      setCommentMsg({ type: 'ok', text: r.message });
    } catch (err) {
      setCommentMsg({ type: 'error', text: err.message });
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <Spinner />;
  if (notFound) {
    return (
      <div className="container page center-block">
        <h1>Content not found</h1>
        <p className="muted">It may have been removed or is not published yet.</p>
        <Link className="btn" to="/browse">Browse content</Link>
      </div>
    );
  }
  if (!item) return <div className="container page"><ErrorMessage message={error} /></div>;

  return (
    <div className="container page">
      <div className="watch">
        <Link to="/browse" className="link">Back to all content</Link>

        <div className="watch-media"><Media item={item} /></div>

        <h1 className="watch-title">{item.title}</h1>

        <div className="watch-bar">
          <div className="channel-mini">
            <Avatar profile={profile} size="md" />
            <div>
              <strong>{profile?.name || 'Creator'}</strong>
              <span className="muted small">{item.category}</span>
            </div>
          </div>
          <div className="watch-actions">
            <button className={`btn ${like.liked ? 'btn-liked' : 'btn-soft'}`} onClick={toggleLike} aria-pressed={like.liked}>
              {like.liked ? 'Liked' : 'Like'} ({like.likesCount})
            </button>
            <button className="btn btn-soft" onClick={share}>Share link</button>
            {shareMsg && <span className="muted small" role="status">{shareMsg}</span>}
          </div>
        </div>
        <ErrorMessage message={error} />

        <div className="desc-box">
          <p className="desc-stats">
            {views} {views === 1 ? 'view' : 'views'}, {timeAgo(item.publishDate)} (published {formatDate(item.publishDate)})
          </p>
          <p>{item.description}</p>
          <div className="tags">
            <span className="tag">{item.category}</span>
            <span className="tag">{item.type}</span>
          </div>
        </div>

        <section className="comments">
          <h2>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</h2>
          <form onSubmit={submitComment} className="comment-form">
            <label>
              Display name
              <input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={40} required placeholder="How should we show your name?" />
            </label>
            <label>
              Comment
              <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} required rows={3} placeholder="Share your thoughts" />
            </label>
            <button className="btn" disabled={posting}>{posting ? 'Posting...' : 'Post comment'}</button>
            {commentMsg.text && <div className={`alert ${commentMsg.type === 'ok' ? 'alert-ok' : 'alert-error'}`} role="status">{commentMsg.text}</div>}
          </form>

          {comments.length === 0 ? (
            <p className="muted">No comments yet. Be the first to comment.</p>
          ) : (
            <ul className="comment-list">
              {comments.map((c) => (
                <li key={c._id}>
                  <span className="avatar avatar-sm avatar-soft">{c.displayName.charAt(0).toUpperCase()}</span>
                  <div className="comment-body">
                    <div className="comment-head"><strong>{c.displayName}</strong><span className="muted small">{formatDateTime(c.createdAt)}</span></div>
                    <p>{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}