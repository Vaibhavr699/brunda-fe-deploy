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
        return {
          id: `agent-${index}`,
          sender: 'ai',
          type: msg.agent.type || 'general_response',
          text: msg.agent.type === 'general_response' ? msg.agent.data : '',
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
  }
};

