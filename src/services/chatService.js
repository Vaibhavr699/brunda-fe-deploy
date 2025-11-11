import { authFetch } from './authService';

const BASE_URL = import.meta.env.VITE_CHAT_API_BASE_URL;

export const chatService = {
  getAllChats: async () => {
    const url = `${BASE_URL}/api/chat/history/`;
    const response = await authFetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.status}`);
    }

    const data = await response.json();
    const chats = data?.message || [];

    return chats.map(item => ({
      id: item?.detail?.chat_id,
      name: item?.detail?.chat_name || 'New Chat',
      timestamp: new Date().toISOString()
    })).filter(chat => chat.id);
  },

  createNewChat: async () => {
    const url = `${BASE_URL}/api/chat/new-chat/`;
    const response = await authFetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to create new chat: ${response.status}`);
    }

    const data = await response.json();
    return {
      chatId: data?.message?.chat_id,
      chatName: data?.message?.chat_name || 'New Chat'
    };
  },

  sendMessage: async (chatId, userInput) => {
    const url = `${BASE_URL}/api/chat/agent/?chat-id=${encodeURIComponent(chatId)}`;
    const response = await authFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: userInput })
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    const data = await response.json();
    const message = data?.message || {};
    return {
      type: message.type || 'general_response',
      data: message.data,
      // Include other fields from message for responses like image_response
      ...message
    };
  },

  getChatMessages: async (chatId) => {
    const url = `${BASE_URL}/api/chat/history/?chat-id=${encodeURIComponent(chatId)}`;
    const response = await authFetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to get chat messages: ${response.status}`);
    }

    const result = await response.json();
    const messages = result?.message || [];

    return messages.map((msg, index) => {
      if (msg.user) {
        return {
          id: `user-${index}`,
          sender: 'user',
          text: msg.user,
          timestamp: new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            day: 'numeric'
          })
        };
      } else if (msg.agent) {
        // Extract text content from msg.agent.data, handling both string and object cases
        let textContent = '';
        if (msg.agent.type === 'general_response') {
          if (typeof msg.agent.data === 'string') {
            textContent = msg.agent.data;
          } else if (msg.agent.data && typeof msg.agent.data === 'object') {
            // If data is an object, try to extract text property or stringify it
            textContent = msg.agent.data.text || msg.agent.data.message || JSON.stringify(msg.agent.data);
          } else {
            textContent = String(msg.agent.data ?? '');
          }
        }

        return {
          id: `agent-${index}`,
          sender: 'ai',
          type: msg.agent.type || 'general_response',
          text: textContent,
          payload: msg.agent,
          timestamp: new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            day: 'numeric'
          })
        };
      }
      return null;
    }).filter(Boolean);
  },

  getTokenStats: async () => {
    const url = `${BASE_URL}/api/chat/token`;
    const response = await authFetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to get token stats: ${response.status}`);
    }

    const data = await response.json();
    const payload = data?.message ?? data ?? {};

    const used = payload.used ?? payload.tokens_used ?? payload.used_tokens ?? payload.token_used ?? null;
    const total = payload.total ?? payload.total_tokens ?? payload.tokens_total ?? payload.total_token ?? null;

    return { used, total };
  }
};

