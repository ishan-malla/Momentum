import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useSignupMutation } from "@/features/auth/authApiSlice";
import { useState } from "react";
import { toast } from "sonner";
const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "User name must be at least 3 characters" })
      .max(10, { message: "User name must be at most 10 characters" }),

    email: z.email({ message: "Invalid email" }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(15, { message: "Password must be at most 15 characters" })
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormInputs = z.infer<typeof signupSchema>;

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({ resolver: zodResolver(signupSchema) });

  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const onSubmit = async (data: SignupFormInputs) => {
    setServerMessage(null);
    try {
      const normalizedEmail = data.email.trim().toLowerCase();
      const result = await signup({
        username: data.name,
        email: normalizedEmail,
        password: data.password,
        role: "user",
      }).unwrap();
      toast.success("Account created", {
        description: "Check your email for the verification code (OTP).",
      });
      setServerMessage(result.message);
      sessionStorage.setItem("pendingVerifyEmail", normalizedEmail);
      navigate("/auth/login", { replace: true, state: { email: normalizedEmail } });
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
          toast.error("Signup failed", { description: message });
          setServerMessage(message);
          return;
        }
      }
      toast.error("Signup failed", { description: "Please try again." });
      setServerMessage("Signup failed");
    }
  };
  return (
    <form
      className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/auth/login"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-serif font-semibold">
              Create account
            </h2>
            <p className="text-sm text-muted-foreground">
              Start your productivity journey
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-franklin text-sm">
              Name
            </Label>
            <Input
              id="name"
              type="name"
              placeholder="Alex Johnson"
              className="font-sans"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="font-franklin text-[14px]">
              Email
            </Label>
            <Input
              id="signup-email"
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

          <div className="space-y-2">
            <Label
              htmlFor="signup-password"
              className="font-franklin text-[14px]"
            >
              Password
            </Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              className="font-sans"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="font-franklin text-[14px]"
            >
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="font-sans"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
            {serverMessage && (
              <p className="text-sm text-muted-foreground">{serverMessage}</p>
            )}
            <Button className="w-full font-franklin" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create account"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Signup;
