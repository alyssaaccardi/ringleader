import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function IssuePage() {
  const { slug }          = useParams();
  const [issue, setIssue] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    api.get(`/api/issues/${encodeURIComponent(slug)}`)
      .then(r => { setIssue(r.data); setState('ok'); })
      .catch(err => setState(err.response?.status === 404 ? 'missing' : 'error'));
  }, [slug]);

  if (state === 'loading') return <div className="rl-loading">Loading…</div>;
  if (state === 'missing') return <div className="rl-empty">Issue not found. <Link to="/archive" className="rl-link">Back to archive</Link></div>;
  if (state === 'error')   return <div className="rl-empty">Something went wrong.</div>;

  return (
    <article className="rl-issue">
      <div className="rl-issue-meta">
        <time>{new Date(issue.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</time>
      </div>
      <h1 className="rl-issue-title">{issue.title}</h1>
      {issue.author && <div className="rl-issue-author">By {issue.author}</div>}
      <div className="rl-issue-body" dangerouslySetInnerHTML={{ __html: issue.html }} />
      <div className="rl-issue-footer">
        <Link to="/archive" className="rl-link">← Back to archive</Link>
      </div>
    </article>
  );
}
