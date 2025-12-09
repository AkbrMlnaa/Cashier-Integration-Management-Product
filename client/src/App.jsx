import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/login";
import Dashboard from "./pages/Dashboard";
import { PrivateRoute, PublicRoute } from "./pages/auth/AuthRoute";
import { api } from "@/services/api";

function App() {
  const [auth, setAuth] = useState({
    authenticated: false,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/v1/profile");

        setAuth({
          authenticated: true,
          profile: res.data,
          loading: false,
        });
      } catch {
        setAuth({
          authenticated: false,
          profile: null,
          loading: false,
        });
      }
    };

    loadUser();
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
            <Dashboard setAuth={setAuth} auth={auth}/>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
