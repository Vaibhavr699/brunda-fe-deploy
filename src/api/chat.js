const CHAT_ENDPOINT = '/api/chat/';

export async function sendMessage(text, options = {}) {
  const { retries = 2 } = options;

  const baseUrl = import.meta.env.VITE_CHAT_API_BASE_URL;
  const url = `${baseUrl}${CHAT_ENDPOINT}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const reqBody = { user_input: text };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        throw new Error(`Request failed with status ${res.status}: ${bodyText}`);
      }

      let data;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      // ✅ Normalize response so UI always receives { type, data }
      let messagePayload;

      if (data?.message) {
        // server sometimes wraps the payload as a JSON string inside `message`
        if (typeof data.message === 'string') {
          try {
            const parsed = JSON.parse(data.message);
            // parsed might be { type, data } or { text }
            if (parsed?.type && parsed?.data !== undefined) messagePayload = parsed;
            else if (parsed?.text) messagePayload = { type: 'general_response', data: parsed.text };
            else messagePayload = { type: 'general_response', data: parsed };
          } catch (e) {
            // not JSON, use raw string
            messagePayload = { type: 'general_response', data: data.message };
          }
        } else {
          messagePayload = data.message; // backend sent object
        }
      } else if (data?.text && typeof data.text === 'object') {
        messagePayload = data.text; // backend sent { text: { type, data } }
      } else if (typeof data?.text === 'string') {
        messagePayload = { type: 'general_response', data: data.text };
      } else if (typeof data === 'string') {
        // server returned raw string (maybe JSON string already parsed above)
        // try parse JSON inside string
        try {
          const parsed = JSON.parse(data);
          if (parsed?.type && parsed?.data !== undefined) messagePayload = parsed;
          else if (parsed?.text) messagePayload = { type: 'general_response', data: parsed.text };
          else messagePayload = { type: 'general_response', data: parsed };
        } catch (e) {
          messagePayload = { type: 'general_response', data };
        }
      } else {
        messagePayload = { type: 'unknown', data };
      }

      console.log('chatResponse', messagePayload);

      // return both a simple `text` for existing UI and the full normalized payload
      let textValue = '';
      if (typeof messagePayload === 'string') textValue = messagePayload;
      else if (messagePayload && typeof messagePayload.data === 'string') textValue = messagePayload.data;
      else if (messagePayload && messagePayload.data !== undefined) {
        try { textValue = JSON.stringify(messagePayload.data); } catch (e) { textValue = String(messagePayload.data); }
      } else {
        try { textValue = JSON.stringify(messagePayload); } catch (e) { textValue = String(messagePayload); }
      }

      return { text: textValue, payload: messagePayload };
    } catch (err) {
      if (err.name === 'AbortError') {
        if (attempt === retries) throw new Error('Request timed out');
      } else if (attempt === retries) {
        throw err;
      }
    }
  }
}

export default { sendMessage };
