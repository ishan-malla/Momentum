import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-container min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-elegant font-bold text-foreground mb-2">
            Momentum
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Track your progress, build better habits
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
