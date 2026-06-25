import { useEffect, useState } from "react";
import { Bot, FileText, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStatsApi } from "../../api/dashboardApi";

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalChats: 0,
    totalDocuments: 0,
    chats: [],
    documents: [],
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchStats = async () => {
    try {
      setLoading(true);

      const data = await getDashboardStatsApi();

      setStats(data);
    } catch {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-violet-950 p-8 text-white shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Sparkles size={28} />
        </div>

        <h1 className="mt-6 text-3xl font-black">Welcome, {user?.name}</h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          QueryBot helps customers get instant answers from uploaded
          knowledge-base documents using RAG, Gemini AI, and MongoDB Vector
          Search.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Start Chat
          </Link>

          {isAdmin && (
            <Link
              to="/documents"
              className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Manage Documents
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <StatCard
          title="Total Chats"
          value={stats.totalChats}
          icon={MessageCircle}
          loading={loading}
        />

        <StatCard
          title={isAdmin ? "Knowledge Documents" : "Your Role"}
          value={isAdmin ? stats.totalDocuments : "Customer"}
          icon={FileText}
          loading={loading && isAdmin}
        />

        <StatCard
          title="AI Status"
          value="Ready"
          icon={Bot}
          loading={false}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-xl font-black text-slate-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Continue building or testing your QueryBot workflow.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ActionButton
              to="/chat"
              title="Ask a Question"
              description="Test RAG answers from knowledge base"
            />

            {isAdmin && (
              <ActionButton
                to="/documents"
                title="Upload Document"
                description="Add new PDF/TXT knowledge data"
              />
            )}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-xl font-black text-slate-900">
            Recent Chat Activity
          </h2>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 className="animate-spin text-violet-600" size={34} />
            </div>
          ) : stats.chats.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-white/65 p-5 text-center">
              <MessageCircle className="mx-auto text-slate-400" size={38} />
              <h3 className="mt-3 font-black text-slate-800">
                No chats yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Start your first chat to see activity here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {stats.chats.slice(0, 3).map((chat) => (
                <Link
                  key={chat._id}
                  to="/chat"
                  className="block rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:bg-white"
                >
                  <h3 className="line-clamp-1 font-black text-slate-900">
                    {chat.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {chat.lastQuestion}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, loading }) => {
  return (
    <div className="glass-card rounded-[1.5rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>

          {loading ? (
            <Loader2 className="mt-3 animate-spin text-violet-600" size={28} />
          ) : (
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              {value}
            </h3>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ to, title, description }) => {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:border-violet-200 hover:bg-violet-50"
    >
      <h3 className="font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
    </Link>
  );
};

export default Dashboard;