export function formatEntrepreneurial(data) {
  if (!data || typeof data !== 'object') return '';

  const lines = [];

  const idea = data.idea_summary;
  if (idea) {
    if (idea.title) lines.push(`Title: ${idea.title}`);
    if (idea.one_liner) lines.push(`One-liner: ${idea.one_liner}`);
    if (idea.strengths && idea.strengths.length) {
      lines.push('\nStrengths:');
      idea.strengths.forEach((s) => lines.push(`- ${s}`));
    }
    if (idea.risks && idea.risks.length) {
      lines.push('\nRisks:');
      idea.risks.forEach((r) => lines.push(`- ${r}`));
    }
  }

  const roadmap = data.roadmap;
  if (roadmap && roadmap.length) {
    lines.push('\nRoadmap:');
    roadmap.forEach((step) => {
      const title = step.title || `Step ${step.step || ''}`;
      lines.push(`\n${step.step || ''}. ${title}`);
      if (step.description) lines.push(`${step.description}`);
      if (step.resources && step.resources.length) {
        lines.push('Resources:');
        step.resources.forEach((r) => lines.push(`- ${r}`));
      }
    });
  }

  const exec = data.execution_support;
  if (exec) {
    if (exec.automated_content && exec.automated_content.length) {
      lines.push('\nAutomated content:');
      exec.automated_content.forEach((c) => {
        lines.push(`- ${c.type}: ${c.title || ''}`);
        if (c.draft) lines.push(`${c.draft}`);
      });
    }
    if (exec.design_branding) {
      if (exec.design_branding.name_ideas && exec.design_branding.name_ideas.length) {
        lines.push('\nName ideas:');
        exec.design_branding.name_ideas.forEach((n) => lines.push(`- ${n}`));
      }
    }
  }

  const mentorship = data.mentorship;
  if (mentorship && mentorship.suggested_experts && mentorship.suggested_experts.length) {
    lines.push('\nSuggested experts:');
    mentorship.suggested_experts.forEach((m) => {
      lines.push(`- ${m.name} — ${m.expertise}${m.contact ? ` (${m.contact})` : ''}`);
    });
  }

  if (data.events && data.events.length) {
    lines.push('\nEvents:');
    data.events.forEach((e) => lines.push(`- ${e.title} — ${e.date}${e.location ? `, ${e.location}` : ''}${e.link ? ` (${e.link})` : ''}`));
  }

  if (data.funding && data.funding.length) {
    lines.push('\nFunding opportunities:');
    data.funding.forEach((f) => {
      lines.push(`- ${f.type}: ${f.name}${f.amount ? ` — ${f.amount}` : f.ticket_size ? ` — ${f.ticket_size}` : ''}${f.contact ? ` (${f.contact})` : ''}`);
    });
  }

  return lines.join('\n');
}

export default function parseResponse(payload) {
  if (!payload) return '';
  if (payload.type === 'entrepreneurial_response') {
    return formatEntrepreneurial(payload.data || payload);
  }
  if (typeof payload.data === 'string') return payload.data;
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload.data || payload, null, 2);
  } catch (e) {
    return String(payload.data || payload);
  }
}









