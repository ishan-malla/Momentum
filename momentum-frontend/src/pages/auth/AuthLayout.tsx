import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-container min-h-screen bg-background flex pt-30 sm:pt-0 sm:items-center justify-center p-4 ">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-[36px] font-elegant font-bold text-foreground mb-2">
            Momentum
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your progress, build better habits
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
