import { FolderUp, Send, X, Download, AlertTriangle, Gauge, RotateCcw } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { chatService } from "../../services/chatService";
import { authService } from "../../services/authService";
import EntrepreneurialResponse from "../../components/EntrepreneurialResponse";
import ThinkingLoader from "../ThinkingLoader";

const DRAFT_KEY = "chat_draft";

// Helper function to format object data into readable text
const formatObjectData = (obj) => {
  if (!obj || typeof obj !== 'object') return String(obj ?? '');
  
  // If it has a text or message property, use that
  if (obj.text) return obj.text;
  if (obj.message) return obj.message;
  
  // Format object as key-value pairs
  const entries = Object.entries(obj);
  return entries.map(([key, value]) => {
    // Format key: convert camelCase to Title Case
    const formattedKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    // Format value
    let formattedValue = value;
    if (typeof value === 'object' && value !== null) {
      formattedValue = JSON.stringify(value, null, 2);
    } else if (typeof value === 'number') {
      formattedValue = value.toLocaleString();
    } else {
      formattedValue = String(value);
    }
    
    return `${formattedKey}: ${formattedValue}`;
  }).join('\n');
};

const initialState = {
  chats: [],
  messages: [],
  status: "idle",
  error: null,
  currentChatId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, messages: action.payload.messages || [] };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, status: "error" };
    case "SET_CURRENT_CHAT":
      return { ...state, currentChatId: action.payload };
    case "ADD_CHAT":
      return { ...state, chats: [action.payload, ...state.chats] };
    case "LOAD_CHATS":
      return { ...state, chats: action.payload };
    case "RESET_MESSAGES":
      return { ...state, messages: [], currentChatId: null };
    case "MARK_MESSAGE_FAILED":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, failed: true } : m
        ),
      };
    case "CLEAR_MESSAGE_FAILED":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, failed: false } : m
        ),
      };
    default:
      return state;
  }
};

export const ChatWindow = ({ activeTab }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [draft, setDraft] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [tokenStats, setTokenStats] = useState({ total: null, used: null });

  const isCoFounder = activeTab === "ai-co-founder";

  const loadAllChats = async () => {
    try {
      const chats = await chatService.getAllChats();
      dispatch({ type: "LOAD_CHATS", payload: chats });
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setDraft(saved);

    if (isCoFounder) {
      (async () => {
        try {
          await authService.initializeAuth();
        } catch (e) {
          // ignore; authFetch will still attempt on demand
        }
        // Token first, then history
        try {
          const stats = await chatService.getTokenStats();
          setTokenStats(stats);
        } catch (e) {
        }
        await loadAllChats();
      })();
    }
  }, [isCoFounder]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, draft);
  }, [draft]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  const handleNewChat = async () => {
    try {
      dispatch({ type: "SET_STATUS", payload: "creating" });
      const { chatId } = await chatService.createNewChat();

      dispatch({ type: "SET_CURRENT_CHAT", payload: chatId });
      dispatch({ type: "RESET_MESSAGES" });
      dispatch({ type: "SET_CURRENT_CHAT", payload: chatId });

      await loadAllChats();

      dispatch({ type: "SET_STATUS", payload: "idle" });
    } catch (err) {
      console.error('Failed to create new chat:', err);
      dispatch({ type: "SET_STATUS", payload: "idle" });
    }
  };

  const loadChatHistory = async (chatId) => {
    try {
      dispatch({ type: "SET_STATUS", payload: "loading" });
      const messages = await chatService.getChatMessages(chatId);
      dispatch({ type: "LOAD", payload: { messages } });
      dispatch({ type: "SET_CURRENT_CHAT", payload: chatId });
      dispatch({ type: "SET_STATUS", payload: "idle" });
    } catch (err) {
      console.error('Failed to load chat history:', err);
      dispatch({ type: "SET_STATUS", payload: "idle" });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() && !uploadingFile) return;

    let chatId = state.currentChatId;

    if (!chatId) {
      try {
        const { chatId: newChatId } = await chatService.createNewChat();
        chatId = newChatId;
        dispatch({ type: "SET_CURRENT_CHAT", payload: chatId });
        await loadAllChats();
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to create chat. Please try again.",
        });
        return;
      }
    }

    const content = draft.trim() || uploadingFile?.name;

    const userTimestamp = new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: content,
      timestamp: userTimestamp,
      file: uploadingFile || null,
    };

    dispatch({ type: "ADD_MESSAGE", payload: userMsg });
    setDraft("");
    setUploadingFile(null);
    setUploadProgress(0);
    dispatch({ type: "SET_STATUS", payload: "sending" });

    try {
      const response = await chatService.sendMessage(chatId, content);

      const aiTimestamp = new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
      });

      // Extract text content from response.data, handling both string and object cases
      let textContent = '';
      if (response.type === 'general_response') {
        if (typeof response.data === 'string') {
          textContent = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If data is an object, format it nicely
          textContent = formatObjectData(response.data);
        } else {
          textContent = String(response.data ?? '');
        }
      }

      const aiMsg = {
        id: `${Date.now()}-ai`,
        sender: "ai",
        text: textContent,
        type: response.type,
        payload: response,
        timestamp: aiTimestamp,
      };

      dispatch({ type: "ADD_MESSAGE", payload: aiMsg });
      dispatch({ type: "SET_STATUS", payload: "idle" });

      // Refresh token stats after successful response
      try {
        const stats = await chatService.getTokenStats();
        setTokenStats(stats);
      } catch { }
    } catch (err) {
      // mark the just-sent user message as failed
      dispatch({ type: "MARK_MESSAGE_FAILED", payload: { id: userMsg.id } });
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Failed to send message",
      });
      dispatch({ type: "SET_STATUS", payload: "idle" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingFile(file);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
  };

  const handleImageDownload = async (imageUrl) => {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-logo-${Date.now()}.png`; // Default filename
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback to opening in new tab if download fails
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRetrySend = async (failedMsg) => {
    if (!failedMsg || failedMsg.sender !== 'user') return;
    const content = failedMsg.text;
    let chatId = state.currentChatId;
    if (!chatId) return; // should exist since we created it before sending

    dispatch({ type: "SET_STATUS", payload: "sending" });
    try {
      const response = await chatService.sendMessage(chatId, content);
      // clear failed flag on this user message
      dispatch({ type: "CLEAR_MESSAGE_FAILED", payload: { id: failedMsg.id } });

      const aiTimestamp = new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
      });
      // Extract text content from response.data, handling both string and object cases
      let textContent = '';
      if (response.type === 'general_response') {
        if (typeof response.data === 'string') {
          textContent = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If data is an object, format it nicely
          textContent = formatObjectData(response.data);
        } else {
          textContent = String(response.data ?? '');
        }
      }

      const aiMsg = {
        id: `${Date.now()}-ai`,
        sender: "ai",
        text: textContent,
        type: response.type,
        payload: response,
        timestamp: aiTimestamp,
      };
      dispatch({ type: "ADD_MESSAGE", payload: aiMsg });
      dispatch({ type: "SET_STATUS", payload: "idle" });

      try {
        const stats = await chatService.getTokenStats();
        setTokenStats(stats);
      } catch { }
    } catch (err) {
      // keep as failed
      dispatch({ type: "SET_STATUS", payload: "idle" });
    }
  };

  if (!isCoFounder) {
    return (
      <main className="flex flex-col h-[86vh] w-full bg-white p-2 font-roboto">
        <header className="p-2 flex items-center justify-between bg-white">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              AI Assistant
            </h1>
            <p className="text-sm md:text-lg text-gray-500">
              Get instant answers on launching, managing, or scaling your startup
            </p>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Chat is only available in AI Co-founder</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-[86vh] w-full bg-white p-2 font-roboto">
      <header className="p-2 flex items-center justify-between bg-white">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            AI Co-founder
          </h1>
          <p className="text-sm md:text-lg text-gray-500">
            Get instant answers on launching, managing, or scaling your startup
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const totalLimit = typeof tokenStats.total === 'number' ? tokenStats.total : 20000;
            const usedValue = typeof tokenStats.used === 'number' ? tokenStats.used : 0;
            const exhausted = usedValue >= totalLimit && totalLimit > 0;

            if (exhausted) {
              return (
                <div className="min-w-[220px] bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-center py-1">
                  <AlertTriangle size={16} className="text-red-600 mr-2" />
                    <span className="text-sm font-semibold text-red-700">All tokens are used</span>
                  </div>
                </div>
              );
            }

            return (
              <div className="min-w-[220px] bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gauge size={16} className="text-gray-600" />
                  <span className="text-xs font-bold text-gray-700">Tokens</span>
                </div>
                <div className="flex items-stretch gap-6 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] uppercase tracking-wide text-gray-500">Used</span>
                    <span className="text-xl font-mono tabular-nums font-semibold text-gray-900">{typeof tokenStats.used === 'number' ? tokenStats.used.toLocaleString() : (tokenStats.used ?? '—')}</span>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] uppercase tracking-wide text-gray-500">Total</span>
                    <span className="text-xl font-mono tabular-nums font-semibold text-gray-900">{typeof tokenStats.total === 'number' ? tokenStats.total.toLocaleString() : (tokenStats.total ?? '—')}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden mt-2 bg-white rounded-xl shadow-lg">
        <aside className="hidden md:flex md:w-50 bg-white border border-gray-200 flex-col rounded-l-xl">
          <div className="p-4 border-b border-gray-300 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-gray-800">Chats</h2>
            <button
              className="cursor-pointer text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors h-11 w-11 text-2xl font-bold"
              onClick={handleNewChat}
              disabled={state.status === "creating"}
            >
              +
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {state.chats.length > 0 ? (
              state.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200 text-sm text-gray-800 truncate ${state.currentChatId === chat.id ? "bg-gray-200" : ""
                    }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => loadChatHistory(chat.id)}
                >
                  {chat.name}
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">No chats yet</div>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col w-full border border-gray-200 rounded-r-xl">
          {state.messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center px-4 text-center ">
              <p className="text-gray-500 text-sm md:text-base max-w-md">
                Get instant answers on launching, managing, or scaling your
                startup — from legal basics to business strategy.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 flex flex-col gap-3">
              {state.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`w-full flex ${msg.sender === "ai" ? "justify-start" : "justify-end"
                    } px-2 mb-3`}
                >
                  <div
                    className={`max-w-full sm:max-w-xs md:max-w-md p-3 rounded-xl shadow ${msg.sender === "ai"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-600 text-white"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-300">
                        {msg.sender === "ai" ? "AI Co-founder" : "You"}
                      </span>
                      <span className={`text-xs ml-1 ${msg.sender === "ai" ? "text-gray-600" : "text-gray-300"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.type === "entrepreneurial_response" && msg.payload ? (
                      <div className="">
                        <EntrepreneurialResponse payload={msg.payload} />
                      </div>
                    ) : msg.type === "image_response" && msg.payload?.logo ? (
                      <div className="flex flex-col gap-2">
                        <div className="relative group">
                          <img
                            src={msg.payload.logo}
                            alt="Generated logo"
                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.nextSibling.style.display = 'block';
                            }}
                          />
                          <button
                            onClick={() => handleImageDownload(msg.payload.logo)}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                            title="Download image"
                          >
                            <Download size={20} className="text-gray-700" />
                          </button>
                          <p className="text-sm text-gray-600 mt-2" style={{ display: 'none' }}>
                            Failed to load image
                          </p>
                        </div>
                      </div>
                    ) : msg.type === "general_response" ? (
                      <div className="text-base md:text-lg space-y-4">
                        {(typeof msg.text === 'string' ? msg.text : String(msg.text ?? '')).split('\n').map((line, idx) => {
                          const trimmedLine = line.trim();

                          // Skip empty lines
                          if (!trimmedLine) {
                            return <div key={idx} className="h-2" />;
                          }

                          // Check for bold markdown headings (e.g., **Domain**: or **Problem**)
                          const boldHeadingMatch = trimmedLine.match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
                          if (boldHeadingMatch) {
                            const [, heading, content] = boldHeadingMatch;
                            return (
                              <div key={idx} className="mt-3">
                                <h4 className="font-bold text-gray-800 text-lg mb-1">
                                  {heading}
                                </h4>
                                {content && (
                                  <p className="text-gray-700 leading-relaxed ml-4">
                                    {content}
                                  </p>
                                )}
                              </div>
                            );
                          }

                          // Check if it's a numbered list item
                          if (/^\d+\./.test(trimmedLine)) {
                            const content = trimmedLine.replace(/^\d+\.\s*/, '').trim();
                            // Handle bold text within list items
                            const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                            return (
                              <div key={idx} className="ml-4 text-gray-700 leading-relaxed">
                                <span className="font-semibold mr-2">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                              </div>
                            );
                          }

                          // Check if it's a bullet list
                          if (/^[•\-\*]\s/.test(trimmedLine)) {
                            const content = trimmedLine.replace(/^[•\-\*]\s*/, '').trim();
                            const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                            return (
                              <div key={idx} className="ml-4 text-gray-700 leading-relaxed">
                                <span className="font-semibold mr-2">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                              </div>
                            );
                          }

                          // Check if it's a heading (text followed by colon)
                          if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
                            return (
                              <h4 key={idx} className="font-semibold text-gray-800 text-base mt-3 mb-1">
                                {trimmedLine}
                              </h4>
                            );
                          }

                          // Regular paragraph with bold text support
                          const formattedLine = trimmedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                          return (
                            <p key={idx} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-base md:text-lg space-y-4">
                        {(typeof msg.text === 'string' ? msg.text : String(msg.text ?? '')).split('\n').map((line, idx) => {
                          const trimmedLine = line.trim();

                          // Skip empty lines
                          if (!trimmedLine) {
                            return <div key={idx} className="h-2" />;
                          }

                          // Check for bold markdown headings (e.g., **Domain**: or **Problem**)
                          const boldHeadingMatch = trimmedLine.match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
                          if (boldHeadingMatch) {
                            const [, heading, content] = boldHeadingMatch;
                            return (
                              <div key={idx} className="mt-3">
                                <h4 className="font-bold text-gray-800 text-lg mb-1">
                                  {heading}
                                </h4>
                                {content && (
                                  <p className="text-gray-700 leading-relaxed ml-4">
                                    {content}
                                  </p>
                                )}
                              </div>
                            );
                          }

                          // Check if it's a numbered list item
                          if (/^\d+\./.test(trimmedLine)) {
                            const content = trimmedLine.replace(/^\d+\.\s*/, '').trim();
                            // Handle bold text within list items
                            const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                            return (
                              <div key={idx} className="ml-4 text-gray-700 leading-relaxed">
                                <span className="font-semibold mr-2">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                              </div>
                            );
                          }

                          // Check if it's a bullet list
                          if (/^[•\-\*]\s/.test(trimmedLine)) {
                            const content = trimmedLine.replace(/^[•\-\*]\s*/, '').trim();
                            const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                            return (
                              <div key={idx} className="ml-4 text-gray-700 leading-relaxed">
                                <span className="font-semibold mr-2">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                              </div>
                            );
                          }

                          // Check if it's a heading (text followed by colon)
                          if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
                            return (
                              <h4 key={idx} className="font-semibold text-gray-800 text-base mt-3 mb-1">
                                {trimmedLine}
                              </h4>
                            );
                          }

                          // Regular paragraph with bold text support
                          const formattedLine = trimmedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                          return (
                            <p key={idx} className="text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                          );
                        })}
                      </div>
                    )}
                    {msg.file && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs truncate max-w-xs">
                          {msg.file.name}
                        </span>
                      </div>
                    )}
                    {msg.sender === 'user' && msg.failed && (
                      <div className="mt-2 flex justify-start">
                        <button
                          type="button"
                          title="Retry"
                          onClick={() => handleRetrySend(msg)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border cursor-pointer transition-colors text-white hover:text-white bg-red-500/80 hover:bg-red-600/80 border-red-500/20`}
                        >
                          <RotateCcw size={16} />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {state.status === "sending" && <ThinkingLoader />}
              <div ref={messagesEndRef} />
            </div>
          )}
          <form
            className="p-3 md:p-4 border-t border-gray-200 rounded-b-lg bg-gray-50 flex-shrink-0"
            onSubmit={handleSend}
          >
            <div className="flex flex-wrap items-center bg-white border border-gray-300 rounded-full px-3 py-2 shadow-sm w-full">
              <input
                type="text"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 min-w-0 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-lg"
              />

              {uploadingFile && (
                <span className="text-sm truncate max-w-[120px] sm:max-w-[60px] md:max-w-[120px] ml-2">
                  {uploadingFile.name}
                </span>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              {/* <div className="relative ml-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="cursor-pointer text-gray-500 hover:text-gray-700 p-2 rounded-full bg-gray-200 h-10 w-10 hover:bg-gray-300 transition-colors flex items-center justify-center relative"
                >
                  <FolderUp />
                </button>

                {uploadingFile && (
                  <>
                    <svg
                      className="absolute top-0 left-0 w-10 h-10"
                      viewBox="0 0 36 36"
                    >
                      <circle className="text-gray-300" strokeWidth="4" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                      <circle className="text-green-400" strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - uploadProgress} strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadingFile(null);
                        setUploadProgress(0);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 shadow hover:bg-red-600 cursor-pointer"
                    >
                      <X size={14} className="text-black" />
                    </button>
                  </>
                )}
              </div> */}

              <button
                type="submit"
                disabled={state.status === "sending"}
                className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-200 h-10 w-10 hover:bg-blue-300 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </div>

            {state.status === "error" && (
              <div className="text-red-600 text-sm mt-2" role="alert">
                {state.error || "Failed to send message"}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
};

export default ChatWindow;
