import { authFetch } from '../services/authService';

export const EntrepreneurialResponse = ({ payload }) => {
  const data = payload?.data || payload || {};

  const normalizeDraft = (s) => {
    if (typeof s !== 'string') return s;
    return s.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '\t').trim();
  };

  const BASE_URL = import.meta.env.VITE_CHAT_API_BASE_URL;

  const handleTemplateDownload = async (templateName) => {
    if (!templateName) return;
    
    try {
      const url = `${BASE_URL}/api/chat/template/${encodeURIComponent(templateName)}/`;
      console.log('Downloading template from:', url);
      
      const response = await authFetch(url, { method: 'GET' });

      if (!response || !response.ok) {
        const statusText = response?.statusText || 'Unknown error';
        console.error(`Failed to download template: ${response?.status} ${statusText}`);
        alert(`Template download failed (${response?.status}): ${templateName}\n\nThe template might not be available on the server yet. Please contact support if this persists.`);
        return;
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Verify we got actual content
      if (blob.size === 0) {
        console.error('Downloaded file is empty');
        alert('Downloaded file is empty');
        return;
      }
      
      // Create a temporary URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = templateName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Template downloaded successfully:', templateName);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert(`Failed to download template: ${templateName}\n\nError: ${error.message || 'Unknown error'}\n\nPlease check your connection and try again.`);
    }
  };

  const renderResources = (title, resources) => {
    if (!Array.isArray(resources) || resources.length === 0) return null;
    return (
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {resources.map((r, i) => {
            if (typeof r === 'string') {
              return (
                <li key={i}>
                  <a className="underline text-blue-700" href={r} target="_blank" rel="noreferrer">{r}</a>
                </li>
              );
            }

            if (r && typeof r === 'object') {
              const text = r.title || r.url || 'Resource';
              const href = r.url || undefined;
              return (
                <li key={i}>
                  {href ? (
                    <a className="underline text-blue-700" href={href} target="_blank" rel="noreferrer">{text}</a>
                  ) : (
                    <span>{text}</span>
                  )}
                </li>
              );
            }

            return <li key={i}>{String(r)}</li>;
          })}
        </ul>
      </div>
    );
  };

  const renderTemplates = (templates) => {
    if (!Array.isArray(templates) || templates.length === 0) return null;
    return (
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Templates</h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((t, i) => {
            if (!t || (typeof t !== 'object' && typeof t !== 'string')) {
              return (
                <button key={i} type="button" disabled className="px-3 py-1.5 text-sm bg-gray-200 text-gray-600 rounded cursor-not-allowed">
                  Template
                </button>
              );
            }

            // Handle string templates
            if (typeof t === 'string') {
              return (
                <button 
                  key={i} 
                  type="button" 
                  onClick={() => handleTemplateDownload(t)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {t}
                </button>
              );
            }

            // Handle flat object format: { template_name: "...", description: "..." }
            if (t.template_name) {
              const templateFileName = t.template_name;
              const description = t.description;
              
              return (
                <div key={i} className="flex flex-col items-start gap-1">
                  <button
                    type="button"
                    onClick={() => handleTemplateDownload(templateFileName)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {templateFileName}
                  </button>
                  {description && (
                    <div className="text-xs text-gray-600 max-w-xs">{description}</div>
                  )}
                </div>
              );
            }

            // Handle nested object format: { key: { template_name: "...", description: "..." } }
            const [key] = Object.keys(t);
            const info = key ? t[key] : null;
            const title = (info?.template_name || key || 'Template').toString();
            const templateFileName = info?.template_name;
            const description = info?.description;

            return (
              <div key={i} className="flex flex-col items-start gap-1">
                {templateFileName ? (
                  <button
                    type="button"
                    onClick={() => handleTemplateDownload(templateFileName)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {title}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-600 rounded cursor-not-allowed"
                    title="Template name not available"
                  >
                    {title}
                  </button>
                )}
                {description && (
                  <div className="text-xs text-gray-600 max-w-xs">{description}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderList = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {items.map((item, i) => {
            if (typeof item === 'string') return <li key={i}>{item}</li>;
            if (item && typeof item === 'object') {
              // Generic object printer for simple objects
              try { return <li key={i}>{JSON.stringify(item)}</li>; } catch { return <li key={i}>{String(item)}</li>; }
            }
            return <li key={i}>{String(item)}</li>;
          })}
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
                {renderResources('Resources', step.resources)}
                {renderTemplates(step.templates)}
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

              if (type.includes('landing') || (c.title && c.title.toLowerCase().includes('landing'))) {
                const rawHtml = normalizeDraft(c.draft);
                return (
                  <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                    <div className="text-sm font-semibold text-gray-900">{c.title || 'Landing Page'}</div>
                    <div className="mt-3 border rounded overflow-hidden">
                      <div className="p-4 bg-white" dangerouslySetInnerHTML={{ __html: rawHtml }} />
                    </div>
                  </div>
                );
              }
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

            {data.execution_support.design_branding && data.execution_support.design_branding.logo_concepts && (
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Logo concepts</div>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {data.execution_support.design_branding.logo_concepts.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
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



