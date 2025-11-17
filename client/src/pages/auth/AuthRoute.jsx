import { isAuthenticated } from "@/services/auth";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
  if (!isAuthenticated) {
    return <Navigate to={"/login"} replace />;
  }
  return children;
};

export const PublicRoute = ({children}) => {
    if (isAuthenticated) {
        return <Navigate to={"/dashboard"} replace/>
    }
    return children
}

