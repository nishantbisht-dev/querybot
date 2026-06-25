import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: "Chat",
      path: "/chat",
      icon: MessageCircle,
      show: true,
    },
    {
      label: "Documents",
      path: "/documents",
      icon: FileText,
      show: user?.role === "admin",
    },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur lg:hidden">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white">
              <Bot size={24} />
            </div>

            <div>
              <h1 className="font-black text-slate-900">QueryBot</h1>
              <p className="text-xs font-semibold text-slate-500">
                AI Support Chatbot
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl bg-slate-900 p-3 text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[280px_1fr]">
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform p-4 transition lg:static lg:w-auto lg:max-w-none lg:translate-x-0 lg:p-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="glass-dark flex h-full flex-col rounded-[2rem] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
                    <Bot size={26} />
                  </div>

                  <div>
                    <h1 className="text-xl font-black">QueryBot</h1>
                    <p className="text-xs text-slate-300">
                      AI Support Chatbot
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl bg-white/10 p-2 text-white lg:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8 rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-bold">{user?.name}</p>
                <p className="mt-1 break-all text-xs text-slate-300">
                  {user?.email}
                </p>
                <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-200">
                  {user?.role}
                </p>
              </div>

              <nav className="mt-8 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-white text-slate-950"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={19} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                >
                  <LogOut size={19} />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
              aria-label="Close sidebar"
            />
          )}

          <main className="rounded-[2rem] bg-white/45 p-5 backdrop-blur lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;