import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/features/auth/authSlice";
import { useEffect, useState } from "react";
import { useRefreshMutation } from "@/features/auth/authApiSlice";

const RequireAuth = () => {
  const token = useSelector(selectCurrentToken);
  const location = useLocation();
  const [refresh, { isLoading }] = useRefreshMutation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (token) {
        if (!cancelled) setChecked(true);
        return;
      }

      try {
        await refresh().unwrap();
      } catch {
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [refresh, token]);

  if (!token && (!checked || isLoading)) {
    return null;
  }

  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/auth/login" replace state={{ from }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
