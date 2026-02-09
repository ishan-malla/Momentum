import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/features/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/features/auth/authSlice";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      reset();
      toast.success("Logged in", {
        description: `Welcome back, ${result.user.username}`,
      });

      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      const from =
        (location.state as { from?: string } | null)?.from ?? "/home";
      navigate(from, { replace: true });
    } catch (error) {
      if (typeof error === "object" && error && "data" in error) {
        const maybeData = (error as { data?: unknown }).data;
        if (
          typeof maybeData === "object" &&
          maybeData &&
          "message" in maybeData &&
          typeof (maybeData as { message?: unknown }).message === "string"
        ) {
          const message = (maybeData as { message: string }).message;
          if (message.toLowerCase().includes("not verified")) {
            toast.warning("Email not verified", {
              description: "Please verify your email before logging in.",
            });
          } else {
            toast.error("Login failed", { description: message });
          }
          return;
        }
      }
      toast.error("Login failed", { description: "Please try again." });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border rounded-lg p-6 sm:p-8 shadow-sm h-2/3"
      noValidate
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-semibold mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Log in to continue your journey
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-franklin text-[14px]">
              Email
            </Label>
            <Input
              id="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="font-sans"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-franklin text-[14px]">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="font-sans pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Link
            to="/auth/forget-password"
            className="text-sm text-primary hover:underline font-franklin"
          >
            Forgot password?
          </Link>

          <Button
            type="submit"
            className="w-full font-franklin"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
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
    </form>
  );
};

export default Login;
