import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border rounded-lg p-6 sm:p-8 shadow-sm h-2/3"
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
              type="email"
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
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="font-sans"
              {...register("password")}
            />
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

          <Button type="submit" className="w-full font-franklin">
            Log in
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
