// App.jsx
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TaskManager from "./components/TaskManager";
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
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppShell = ({ children }) => <TaskProvider>{children}</TaskProvider>;

const Layout = ({ children }) => (
  <div className="app-shell">
    <Header />
    <StatsBar hideMini />
    {children}
  </div>
);

const TasksView = () => (
  <>
    <main className="workspace">
      <Menu />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/calendar"
              element={
                <Protected>
                  <AppShell>
                    <Layout>
                      <Calendar />
                    </Layout>
                  </AppShell>
                </Protected>
              }
            />
            <Route
              path="/"
              element={
                <Protected>
                  <AppShell>
                    <Layout>
                      <TasksView />
                    </Layout>
                  </AppShell>
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
