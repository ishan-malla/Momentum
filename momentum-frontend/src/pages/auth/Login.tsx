import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const Login = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
      {/* Login Screen */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-[24px] font-serif font-semibold mb-1">
            Welcome back
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Log in to continue your journey
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-franklin text-[14px]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-franklin text-[14px]">
              Password
            </Label>

            <div className="w-full flex items-center ">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="font-sans"
              />
            </div>
          </div>

          <button className="text-[13px] text-primary hover:underline font-franklin">
            Forgot password?
          </button>

          <Button className="w-full font-franklin">Log in</Button>
        </div>

        <div className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-primary hover:underline font-franklin"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
