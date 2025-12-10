// App.jsx
import TaskManager from "./components/TaskManager";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TaskProvider } from "./context/TaskContext";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (window.location.pathname === "/signup") {
    return <Signup />;
  }

  return user ? <TaskProvider>{children}</TaskProvider> : <Login />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PrivateRoute>
          <TaskManager />
        </PrivateRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
