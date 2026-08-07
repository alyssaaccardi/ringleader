import React, { useRef, useState } from 'react';

export default function IssueBody({ issue }) {
  const frameRef              = useRef(null);
  const [frameH, setFrameH]   = useState(1200);

  if (issue.type === 'html') {
    const onLoad = () => {
      const doc = frameRef.current?.contentDocument;
      if (!doc) return;

      // Make every link in the newsletter open in a new tab
      if (doc.head && !doc.head.querySelector('base[data-rl-injected]')) {
        const base = doc.createElement('base');
        base.target = '_blank';
        base.setAttribute('data-rl-injected', '1');
        doc.head.appendChild(base);
      }
      doc.querySelectorAll('a[href]').forEach(a => {
        if (!a.target) a.target = '_blank';
        if (!a.rel)    a.rel    = 'noopener noreferrer';
      });

      const h = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight || 0
      );
      if (h && h !== frameH) setFrameH(h);
    };
    const resize = onLoad;
    return (
      <iframe
        ref={frameRef}
        className="rl-issue-frame"
        title={issue.title}
        srcDoc={issue.html}
        style={{ height: frameH }}
        onLoad={resize}
      />
    );
  }

  return (
    <div className="rl-issue-body" dangerouslySetInnerHTML={{ __html: issue.html }} />
  );
}
