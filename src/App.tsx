import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Layout & Pages
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserList from "./pages/UserList";
import Register from "./pages/Register";
import EditUser from "./pages/EditUser";
import GroupList from "./pages/GroupList";
import NotFound from "./NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings/index";

// Import the Modal
import ChangePasswordModal from "./components/ChangePasswordModel";
import RequirePermission from "./components/RequirePermission";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  const [showModal, setShowModal] = useState(false);

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

    // Listener for the global "Password Change" event
    const handleEvent = () => setShowModal(true);
    window.addEventListener("REQUIRE_PASSWORD_CHANGE", handleEvent);

    return () =>
      window.removeEventListener("REQUIRE_PASSWORD_CHANGE", handleEvent);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <AuthProvider>
      {/* Injecting the Modal globally.
        It will sit on top of the Router content
        only when showModal is true.
      */}
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}

      <BrowserRouter>
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
                    className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:scale-105 transition-all"
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

          {/* Protected Routes */}
          <Route
            element={
              <DashboardLayout
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />
            }
          >
            <Route path="/home" element={<Home />} />
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
            <Route path="/me" element={<Profile />} />
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
