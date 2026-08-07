import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function CurrentIssuePage() {
  const [issue, setIssue] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    api.get('/api/issues/current')
      .then(r => { setIssue(r.data); setState('ok'); })
      .catch(err => setState(err.response?.status === 404 ? 'empty' : 'error'));
  }, []);

  if (state === 'loading') return <div className="rl-loading">Loading…</div>;
  if (state === 'empty')   return <div className="rl-empty">No issues published yet.</div>;
  if (state === 'error')   return <div className="rl-empty">Something went wrong.</div>;

  return (
    <article className="rl-issue">
      <div className="rl-issue-meta">
        <span className="rl-issue-badge">Latest issue</span>
        <time>{new Date(issue.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</time>
      </div>
      <h1 className="rl-issue-title">{issue.title}</h1>
      {issue.author && <div className="rl-issue-author">By {issue.author}</div>}
      <div className="rl-issue-body" dangerouslySetInnerHTML={{ __html: issue.html }} />
      <div className="rl-issue-footer">
        <Link to="/archive" className="rl-link">← Browse past issues</Link>
      </div>
    </article>
  );
}
