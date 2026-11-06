import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Eager: the layout, the landing page (login) and tiny status pages.
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import NotFound from "./NotFound";
import Unauthorized from "./pages/Unauthorized";
import PendingApproval from "./pages/PendingApproval";
import BackendOffline from "./pages/BackendOffline";

// Lazy: each page becomes its own chunk, fetched on first visit, so the
// login screen doesn't download the whole admin app up front.
const SignUp = lazy(() => import("./pages/SignUp"));
const Home = lazy(() => import("./pages/Home"));
const UserList = lazy(() => import("./pages/UserList"));
const Register = lazy(() => import("./pages/Register"));
const EditUser = lazy(() => import("./pages/EditUser"));
const GroupList = lazy(() => import("./pages/GroupList"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings/index"));

const PageFallback = () => (
  <div className="p-10 text-center text-slate-500 animate-pulse">Loading...</div>
);

// Import the Modal
import ChangePasswordModal from "./components/ChangePasswordModel";
import RequirePermission from "./components/RequirePermission";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Registered once — previously these were torn down and re-added on every
  // theme toggle because they shared the theme effect.
  useEffect(() => {
    // Listener for the global "Password Change" event
    const handleEvent = () => setShowModal(true);
    window.addEventListener("REQUIRE_PASSWORD_CHANGE", handleEvent);

    // Listener for the global "Backend Unreachable" event (dispatched by the
    // axios interceptor whenever a request gets no response at all)
    const handleOffline = () => setBackendOffline(true);
    window.addEventListener("BACKEND_OFFLINE", handleOffline);

    return () => {
      window.removeEventListener("REQUIRE_PASSWORD_CHANGE", handleEvent);
      window.removeEventListener("BACKEND_OFFLINE", handleOffline);
    };
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (backendOffline) {
    return <BackendOffline onRetry={() => window.location.reload()} />;
  }

  return (
    <AuthProvider>
      {/* Injecting the Modal globally.
        It will sit on top of the Router content
        only when showModal is true.
      */}
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}

      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex flex-col p-fluid-md relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isDarkMode ? (
                      <span className="text-sm font-bold">Light Mode</span>
                    ) : (
                      <span className="text-sm font-bold">Dark Mode</span>
                    )}
                  </button>
                </div>
                <Login />
              </div>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route
            element={
              <DashboardLayout
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />
            }
          >
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequirePermission module="system" action="read">
                  <UserList />
                </RequirePermission>
              }
            />
            <Route
              path="/users/register"
              element={
                <RequirePermission module="system" action="create">
                  <Register />
                </RequirePermission>
              }
            />
            <Route
              path="/users/edit/:id"
              element={
                <RequirePermission module="system" action="read">
                  <EditUser />
                </RequirePermission>
              }
            />
            <Route
              path="/groups"
              element={
                <RequirePermission module="groups" action="read">
                  <GroupList />
                </RequirePermission>
              }
            />
            <Route
              path="/me"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequirePermission module="system" action="read">
                  <Settings />
                </RequirePermission>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
