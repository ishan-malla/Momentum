import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";

const RequireAdmin = () => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!user) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/auth/login" replace state={{ from }} />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;

