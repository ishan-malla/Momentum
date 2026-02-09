import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/features/auth/authSlice";
import { useEffect } from "react";
import { useRefreshMutation } from "@/features/auth/authApiSlice";

const RequireAuth = () => {
  const token = useSelector(selectCurrentToken);
  const location = useLocation();
  const [refresh, { isLoading, isUninitialized }] = useRefreshMutation();

  useEffect(() => {
    if (!token && isUninitialized) {
      refresh();
    }
  }, [refresh, token, isUninitialized]);

  if (!token && (isUninitialized || isLoading)) {
    return null;
  }

  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/auth/login" replace state={{ from }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
