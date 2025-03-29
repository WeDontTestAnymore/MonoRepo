import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If the user is not authenticated, redirect to sign-in
  return isAuthenticated ? children : <Navigate to="/sign-in" />;
};

export default ProtectedRoute;
