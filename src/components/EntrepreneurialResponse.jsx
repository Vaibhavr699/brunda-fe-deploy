import React from 'react';

export const EntrepreneurialResponse = ({ payload }) => {
  const data = payload?.data || payload || {};

  const normalizeDraft = (s) => {
    if (typeof s !== 'string') return s;
    return s.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '\t').trim();
  };

  const renderList = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="prose max-w-none text-base md:text-lg text-gray-800">
      {data.idea_summary && (
        <div>
          <h2 className="text-lg font-bold text-gray-900">{data.idea_summary.title}</h2>
          {data.idea_summary.one_liner && (
            <p className="text-gray-700 mt-1">{data.idea_summary.one_liner}</p>
          )}
          {renderList('Strengths', data.idea_summary.strengths)}
          {renderList('Risks', data.idea_summary.risks)}
        </div>
      )}

      {data.roadmap && data.roadmap.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900">Roadmap</h3>
          <ol className="list-decimal list-inside mt-2 space-y-3 text-sm text-gray-700">
            {data.roadmap.map((step) => (
              <li key={step.step || step.title} className="">
                <p className="font-medium inline">{step.title}</p>
                {step.description && <div className="text-gray-700 mt-1">{step.description}</div>}
                {step.resources && step.resources.length > 0 && (
                  <div className="mt-1">
                    <div className="text-xs font-medium text-gray-600">Resources</div>
                    <ul className="list-disc list-inside text-xs text-blue-700">
                      {step.resources.map((r, i) => (
                        <li key={i}><a className="underline" href={r} target="_blank" rel="noreferrer">{r}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {data.execution_support && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900">Execution Support</h3>
          <div className="mt-3 grid grid-cols-1 gap-4">
            {data.execution_support.automated_content && data.execution_support.automated_content.map((c, i) => {
              const type = (c.type || '').toLowerCase();
              // Email formatting: show subject clearly and body as a callout
              if ((type.includes('email') || (c.title && c.title.toLowerCase().includes('email'))) && c.draft) {
                const raw = normalizeDraft(c.draft);
                const subjectMatch = raw.match(/Subject:\s*(.*)/i);
                const subject = subjectMatch ? subjectMatch[1].trim() : c.title || 'Announcement Email';
                const body = raw.replace(/Subject:\s*.*\n?/i, '').trim();
                return (
                  <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                    <div className="text-sm font-semibold text-gray-900">{subject}</div>
                    <div className="mt-3 text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{body}</div>
                  </div>
                );
              }

              // Landing page preview: visual box + source toggle
              if (type.includes('landing') || (c.title && c.title.toLowerCase().includes('landing'))) {
                const rawHtml = normalizeDraft(c.draft);
                return (
                  <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                    <div className="text-sm font-semibold text-gray-900">{c.title || 'Landing Page'}</div>
                    <div className="mt-3 border rounded overflow-hidden">
                      <div className="p-4 bg-white" dangerouslySetInnerHTML={{ __html: rawHtml }} />
                    </div>
                    <details className="mt-3 text-xs text-gray-600">
                      <summary className="cursor-pointer">Show HTML source</summary>
                      <pre className="text-xs whitespace-pre-wrap mt-2 bg-gray-50 p-2 rounded">{rawHtml}</pre>
                    </details>
                  </div>
                );
              }

              // default: show draft
              return (
                <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">{c.title || c.type}</div>
                  {c.draft && <pre className="text-base whitespace-pre-wrap mt-2 bg-gray-50 p-3 rounded text-gray-800">{normalizeDraft(c.draft)}</pre>}
                </div>
              );
            })}

            {data.execution_support.design_branding && data.execution_support.design_branding.name_ideas && (
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Name ideas</div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {data.execution_support.design_branding.name_ideas.map((n, i) => (
                    <span key={i} className="text-sm bg-blue-50 text-blue-800 px-3 py-1 rounded-lg">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {data.mentorship && data.mentorship.suggested_experts && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900">Suggested Mentors</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {data.mentorship.suggested_experts.map((m, i) => (
              <li key={i}>
                <div className="font-medium">{m.name} <span className="text-xs text-gray-600">— {m.expertise}</span></div>
                {m.contact && <div className="text-xs text-blue-700"><a href={m.contact} target="_blank" rel="noreferrer">{m.contact}</a></div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.events && data.events.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900">Events</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-2">
            {data.events.map((e, i) => (
              <li key={i}>{e.title} — {e.date}{e.location ? `, ${e.location}` : ''} {e.link && (<a className="text-blue-700 underline" href={e.link} target="_blank" rel="noreferrer">(link)</a>)}</li>
            ))}
          </ul>
        </div>
      )}

      {data.funding && data.funding.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900">Funding Opportunities</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-2">
            {data.funding.map((f, i) => (
              <li key={i}>
                <div className="font-medium">{f.name} <span className="text-xs text-gray-600">— {f.type}</span></div>
                <div className="text-xs">{f.ticket_size || f.amount || ''} {f.stage_focus ? `• ${f.stage_focus}` : ''} {f.contact ? `• ${f.contact}` : ''}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EntrepreneurialResponse;



