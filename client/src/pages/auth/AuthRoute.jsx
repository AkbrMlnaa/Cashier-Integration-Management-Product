import { Navigate } from "react-router-dom";


export const PrivateRoute = ({ children, auth }) => {
 
  return auth.authenticated ? children : <Navigate to="/login" replace />;
};


export const PublicRoute = ({ children, auth }) => {
  return auth.authenticated ? <Navigate to="/dashboard" replace /> : children;
};

export const RoleRoute = ({ children, auth, allowedRoles }) => {
  if (!auth.authenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(auth.role)) return <Navigate to="/forbidden" replace />;
  return children;
};
