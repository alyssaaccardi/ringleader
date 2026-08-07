import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ArchivePage() {
  const [issues, setIssues] = useState(null);

  useEffect(() => {
    api.get('/api/issues').then(r => setIssues(r.data)).catch(() => setIssues([]));
  }, []);

  if (issues === null) return <div className="rl-loading">Loading…</div>;
  if (!issues.length)  return <div className="rl-empty">No issues yet.</div>;

  return (
    <div className="rl-archive">
      <h1 className="rl-page-title">Archive</h1>
      <ul className="rl-archive-list">
        {issues.map(i => (
          <li key={i.slug} className="rl-archive-item">
            <Link to={`/issues/${i.slug}`} className="rl-archive-link">
              <time className="rl-archive-date">
                {new Date(i.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </time>
              <span className="rl-archive-title">{i.title}</span>
              {i.excerpt && <span className="rl-archive-excerpt">{i.excerpt}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
