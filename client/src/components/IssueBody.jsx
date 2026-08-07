import React, { useRef, useState } from 'react';

export default function IssueBody({ issue }) {
  const frameRef              = useRef(null);
  const [frameH, setFrameH]   = useState(1200);

  if (issue.type === 'html') {
    const resize = () => {
      const doc = frameRef.current?.contentDocument;
      if (!doc) return;
      const h = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight || 0
      );
      if (h && h !== frameH) setFrameH(h);
    };
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
