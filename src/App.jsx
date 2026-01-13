import { useState } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TaskProvider } from "./context/TaskContext";
import Calendar from "./pages/Calendar";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import Menu from "./components/Menu";
import Footer from "./components/Footer";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="appLoading">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const Layout = ({ children, view, onToggleView }) => (
  <div className="app-shell">
    <Header view={view} onToggleView={onToggleView} />
    <StatsBar hideMini />
    {children}
  </div>
);

const AppShell = () => {
  const [view, setView] = useState("list");

  const toggleView = () => {
    // Keep layout mounted and only swap content for predictable UI state.
    setView((prev) => (prev === "list" ? "calendar" : "list"));
  };

  return (
    <TaskProvider>
      <Layout view={view} onToggleView={toggleView}>
        <main className="workspace">
          {view === "calendar" ? <Calendar /> : <Menu />}
          <Footer />
        </main>
      </Layout>
    </TaskProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Protected>
                  <AppShell />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
