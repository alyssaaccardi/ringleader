import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import IssueBody from '../components/IssueBody';

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

  const isHtml = issue.type === 'html';

  return (
    <article className={`rl-issue${isHtml ? ' rl-issue-html' : ''}`}>
      <div className="rl-issue-meta">
        <time>{new Date(issue.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</time>
        <Link to="/archive" className="rl-issue-meta-link">Archive →</Link>
      </div>
      {!isHtml && <h1 className="rl-issue-title">{issue.title}</h1>}
      {!isHtml && issue.author && <div className="rl-issue-author">By {issue.author}</div>}
      <IssueBody issue={issue} />
      <div className="rl-issue-footer">
        <Link to="/archive" className="rl-link">← Back to archive</Link>
      </div>
    </article>
  );
}
