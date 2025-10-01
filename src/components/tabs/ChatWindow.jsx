import { FolderUp, Send, X } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { sendMessage as apiSendMessage } from "../../api/chat";
import parseResponse from "../../utils/responseParser";
import EntrepreneurialResponse from "../../components/EntrepreneurialResponse";
import ThinkingLoader from "../ThinkingLoader";
import { useNavigate } from 'react-router-dom';

const DRAFT_KEY = "chat_draft";

const initialState = {
  chats: [],
  messages: [],
  status: "idle",
  error: null,
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
    case "RESET_MESSAGES":
      return { ...state, messages: [] };
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
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, draft);
  }, [draft]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  useEffect(() => {
    if (activeTab === "ai-assistant") {
      dispatch({ type: "LOAD", payload: { messages: [] } });
    } else {
      const chat = state.chats.find((c) => c.id === activeTab);
      if (chat) {
        dispatch({ type: "LOAD", payload: { messages: chat.messages } });
      }
    }
  }, [activeTab, state.chats]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() && !uploadingFile) return;

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
      const aiResponse = await apiSendMessage(content, { timeoutMs: 8000 });

      const aiTimestamp = new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
      });

      const displayTextRaw = aiResponse && (aiResponse.text ?? "");
      const finalPayload = aiResponse && (aiResponse.payload ?? null);
      const respType =
        (finalPayload && finalPayload.type) ||
        (aiResponse && aiResponse.type) ||
        "general_response";

      let displayText = displayTextRaw || "";
      if (respType === "entrepreneurial_response" && finalPayload) {
        displayText = parseResponse(finalPayload);
      }

      const aiMsg = {
        id: `${Date.now()}-ai`,
        sender: "ai",
        text: displayText,
        type: respType,
        payload: finalPayload,
        timestamp: aiTimestamp,
      };

      dispatch({ type: "ADD_MESSAGE", payload: aiMsg });
      dispatch({ type: "SET_STATUS", payload: "idle" });
    } catch (err) {
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

  return (
    <main className="flex flex-col h-[86vh] w-full bg-gray-50 p-2 font-ubuntu">
      <header className="p-4 flex items-center justify-between bg-gray-50">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
            AI Assistant
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Get instant answers on launching, managing, or scaling your startup
          </p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden mt-2 bg-white rounded-xl shadow-lg">
        <aside className="hidden md:flex md:w-50 bg-gray-50 border border-gray-400 flex-col rounded-l-xl">
          <div className="p-4 border-b border-gray-300 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-gray-800">New Chat</h2>
            <button
              className="cursor-pointer text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors h-11 w-11 text-2xl font-bold"
              onClick={() => dispatch({ type: "RESET_MESSAGES" })}
            >
              +
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {state.chats.length > 0 ? (
              state.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 hover:bg-gray-100 cursor-pointer border-gray-300 text-sm text-gray-800 truncate ${activeTab === chat.id ? "bg-gray-200" : ""
                    }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/\${chat.id}`)}
                >
                  {chat.text}
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">No chats yet</div>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col w-full border border-gray-400 rounded-r-xl">
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
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-600 text-white"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">
                        {msg.sender === "ai" ? "AI Assistant" : "You"}
                      </span>
                      <span className="text-xs ml-1 text-gray-300">
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.type === "entrepreneurial_response" && msg.payload ? (
                      <div className="">
                        <EntrepreneurialResponse payload={msg.payload} />
                      </div>
                    ) : (
                      <p className="text-base md:text-lg whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}
                    {msg.file && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs truncate max-w-xs">
                          {msg.file.name}
                        </span>
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

              <div className="relative ml-2 flex-shrink-0">
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
                      <circle className="text-green-400" strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - uploadProgress} strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18"/>
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
              </div>

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
