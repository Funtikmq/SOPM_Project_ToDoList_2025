// App.jsx
import TaskManager from "./components/TaskManager";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
<<<<<<< HEAD
=======
import { TaskProvider } from "./context/TaskContext";
>>>>>>> 17375cc (Fix datepicker layering, warm dark theme, centralize tasks context and overdue stats)
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (window.location.pathname === "/signup") {
    return <Signup />;
  }

<<<<<<< HEAD
  return user ? children : <Login />;
=======
  return user ? <TaskProvider>{children}</TaskProvider> : <Login />;
>>>>>>> 17375cc (Fix datepicker layering, warm dark theme, centralize tasks context and overdue stats)
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
