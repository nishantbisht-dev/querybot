import { Navigate } from "react-router-dom";
import { Bot, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center text-slate-700">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg">
          <Bot size={34} />
        </div>

        <Loader2 className="mt-6 animate-spin text-violet-600" size={32} />

        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Loading QueryBot
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we check your session.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;