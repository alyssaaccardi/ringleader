import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import IssueBody from '../components/IssueBody';

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

  const isHtml = issue.type === 'html';

  return (
    <article className={`rl-issue${isHtml ? ' rl-issue-html' : ''}`}>
      <div className="rl-issue-meta">
        <span className="rl-issue-badge">Latest issue</span>
        <time>{new Date(issue.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</time>
        <Link to="/archive" className="rl-issue-meta-link">Archive →</Link>
      </div>
      {!isHtml && <h1 className="rl-issue-title">{issue.title}</h1>}
      {!isHtml && issue.author && <div className="rl-issue-author">By {issue.author}</div>}
      <IssueBody issue={issue} />
      <div className="rl-issue-footer">
        <Link to="/archive" className="rl-link">← Browse past issues</Link>
      </div>
    </article>
  );
}
