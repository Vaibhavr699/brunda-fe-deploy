import { authFetch } from '../services/authService';

const CHAT_ENDPOINT = '/api/chat/agent/';

export async function sendMessage(text, options = {}) {
  const { retries = 2 } = options;

  const baseUrl = import.meta.env.VITE_CHAT_API_BASE_URL;
  const url = `${baseUrl}${CHAT_ENDPOINT}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const reqBody = { user_input: text };
      const res = await authFetch(url, {
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
      let messagePayload;

      if (data?.message) {
        if (typeof data.message === 'string') {
          try {
            const parsed = JSON.parse(data.message);
            if (parsed?.type && parsed?.data !== undefined) messagePayload = parsed;
            else if (parsed?.text) messagePayload = { type: 'general_response', data: parsed.text };
            else messagePayload = { type: 'general_response', data: parsed };
          } catch (e) {
            messagePayload = { type: 'general_response', data: data.message };
          }
        } else {
          messagePayload = data.message;
        }
      } else if (data?.text && typeof data.text === 'object') {
        messagePayload = data.text;
      } else if (typeof data?.text === 'string') {
        messagePayload = { type: 'general_response', data: data.text };
      } else if (typeof data === 'string') {

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

      // console.log('chatResponse', messagePayload);

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
