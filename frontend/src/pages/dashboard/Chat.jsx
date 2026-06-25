import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Bot,
  Clock,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  User,
} from "lucide-react";
import {
  askQuestionApi,
  deleteChatApi,
  getChatsApi,
  getSingleChatApi,
} from "../../api/chatApi";
import { useAuth } from "../../context/AuthContext";

const Chat = () => {
  const { user } = useAuth();

  const messagesEndRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingSingleChat, setLoadingSingleChat] = useState(false);
  const [asking, setAsking] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);

      const data = await getChatsApi();

      setChats(data.chats || []);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch chats";
      toast.error(message);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, asking]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setSources([]);
    setQuestion("");
  };

  const handleAskQuestion = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length < 3) {
      toast.error("Question must be at least 3 characters");
      return;
    }

    const temporaryUserMessage = {
      role: "user",
      content: trimmedQuestion,
      _id: `temp-user-${Date.now()}`,
    };

    setMessages((prev) => [...prev, temporaryUserMessage]);
    setQuestion("");

    try {
      setAsking(true);

      const data = await askQuestionApi({
        question: trimmedQuestion,
        chatId: currentChatId,
      });

      setCurrentChatId(data.chat?._id || null);
      setMessages(data.chat?.messages || []);
      setSources(data.sources || []);

      await fetchChats();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to generate answer";

      toast.error(message);

      setMessages((prev) =>
        prev.filter((messageItem) => messageItem._id !== temporaryUserMessage._id)
      );
    } finally {
      setAsking(false);
    }
  };

  const handleOpenChat = async (chatId) => {
    try {
      setLoadingSingleChat(true);

      const data = await getSingleChatApi(chatId);

      setCurrentChatId(data.chat._id);
      setMessages(data.chat.messages || []);
      setSources(data.chat.sources || []);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to open chat";
      toast.error(message);
    } finally {
      setLoadingSingleChat(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(chatId);

      const data = await deleteChatApi(chatId);

      toast.success(data.message || "Chat deleted successfully");

      if (currentChatId === chatId) {
        handleNewChat();
      }

      await fetchChats();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete chat";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const exampleQuestions = [
    "Can I get my money back after delivery?",
    "How many days does shipping take?",
    "How can I contact support?",
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">QueryBot Chat</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Ask questions and get grounded answers from uploaded knowledge-base
            documents.
          </p>
        </div>

        <button
          onClick={handleNewChat}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="glass-card rounded-[2rem] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Chat History
              </h2>
              <p className="text-sm text-slate-500">{chats.length} chat(s)</p>
            </div>

            <button
              onClick={fetchChats}
              disabled={loadingChats}
              className="rounded-xl bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={loadingChats ? "animate-spin" : ""}
              />
            </button>
          </div>

          {loadingChats ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="animate-spin text-violet-600" size={32} />
            </div>
          ) : chats.length === 0 ? (
            <div className="rounded-2xl bg-white/65 p-5 text-center">
              <MessageCircle className="mx-auto text-slate-400" size={36} />
              <h3 className="mt-3 font-black text-slate-800">No chats yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Your chat history will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
              {chats.map((chat) => (
                <ChatHistoryCard
                  key={chat._id}
                  chat={chat}
                  active={currentChatId === chat._id}
                  deletingId={deletingId}
                  onOpen={handleOpenChat}
                  onDelete={handleDeleteChat}
                />
              ))}
            </div>
          )}
        </aside>

        <main className="glass-card flex min-h-[720px] flex-col rounded-[2rem] p-5">
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Bot size={24} />
              </div>

              <div>
                <h2 className="font-black">AI Support Assistant</h2>
                <p className="text-xs text-slate-300">
                  {currentChatId ? "Continuing selected chat" : "New chat"}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-200">
              Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-white/55 p-4">
            {loadingSingleChat ? (
              <div className="flex h-full min-h-96 items-center justify-center">
                <Loader2 className="animate-spin text-violet-600" size={38} />
              </div>
            ) : messages.length === 0 ? (
              <EmptyChat
                user={user}
                exampleQuestions={exampleQuestions}
                onUseQuestion={setQuestion}
              />
            ) : (
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message._id || `${message.role}-${index}`}
                    message={message}
                  />
                ))}

                {asking && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-[1.4rem] rounded-tl-sm bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Loader2 className="animate-spin" size={17} />
                        QueryBot is thinking...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {sources.length > 0 && (
            <SourcePanel sources={sources} />
          )}

          <form onSubmit={handleAskQuestion} className="mt-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask something about refund, shipping, support..."
                className="soft-input min-h-14 flex-1 rounded-2xl px-5 py-3 outline-none"
                disabled={asking}
              />

              <button
                type="submit"
                disabled={asking}
                className="primary-btn inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-bold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {asking ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Asking
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

const EmptyChat = ({ user, exampleQuestions, onUseQuestion }) => {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg">
        <Bot size={34} />
      </div>

      <h3 className="mt-6 text-2xl font-black text-slate-900">
        Hello, {user?.name}
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Ask a question and QueryBot will search the uploaded knowledge base,
        retrieve relevant chunks, and generate a grounded answer.
      </p>

      <div className="mt-6 grid w-full max-w-2xl gap-3 md:grid-cols-3">
        {exampleQuestions.map((question) => (
          <button
            key={question}
            onClick={() => onUseQuestion(question)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            isUser
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-white"
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        <div
          className={`rounded-[1.4rem] p-4 text-sm leading-7 shadow-sm ${
            isUser
              ? "rounded-tr-sm bg-violet-600 text-white"
              : "rounded-tl-sm bg-white text-slate-700"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

const SourcePanel = ({ sources }) => {
  return (
    <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
      <h3 className="text-sm font-black text-violet-900">
        Sources used by QueryBot
      </h3>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {sources.map((source, index) => (
          <div
            key={`${source.chunkId}-${index}`}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-900">
                {source.documentTitle}
              </p>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                Score {source.score?.toFixed?.(2) || "N/A"}
              </span>
            </div>

            <p className="text-xs font-semibold text-violet-700">
              Chunk #{source.chunkIndex}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              {source.contentPreview}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatHistoryCard = ({
  chat,
  active,
  deletingId,
  onOpen,
  onDelete,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-violet-200 bg-violet-50"
          : "border-slate-200 bg-white/75 hover:bg-white"
      }`}
    >
      <button
        onClick={() => onOpen(chat._id)}
        className="block w-full text-left"
      >
        <h3 className="line-clamp-1 font-black text-slate-900">
          {chat.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
          {chat.lastQuestion}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Clock size={14} />
          {new Date(chat.updatedAt).toLocaleString()}
        </div>
      </button>

      <button
        onClick={() => onDelete(chat._id)}
        disabled={deletingId === chat._id}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      >
        {deletingId === chat._id ? (
          <Loader2 className="animate-spin" size={15} />
        ) : (
          <Trash2 size={15} />
        )}
        Delete
      </button>
    </div>
  );
};

export default Chat;