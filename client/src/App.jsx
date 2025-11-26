import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/login";
import Dashboard from "./pages/Dashboard";
import { PrivateRoute, PublicRoute } from "./pages/auth/AuthRoute";
import { api } from "./services/api";

function App() {
  const [auth, setAuth] = useState({ authenticated: false, profile: null });

  useEffect(() => {
    api.get("/v1/profile")
      .then(res => setAuth({ authenticated: true, profile: res.data }))
      .catch(() => setAuth({ authenticated: false, profile: null }));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute auth={auth}>
            <Login auth={auth} setAuth={setAuth} />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute auth={auth}>
            <Dashboard setAuth={setAuth} />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
