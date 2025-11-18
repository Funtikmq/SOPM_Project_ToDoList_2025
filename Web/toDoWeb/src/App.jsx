// App.jsx
import TaskManager from "./components/TaskManager";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (window.location.pathname === "/signup") {
    return <Signup />;
  }

  return user ? children : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <PrivateRoute>
        <TaskManager />
      </PrivateRoute>
    </AuthProvider>
  );
}

export default App;
