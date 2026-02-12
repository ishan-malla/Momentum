import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { ResetCase } from "./ResetPassword";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgetPasswordMutation } from "@/features/auth/authApiSlice";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

type EmailFormInputs = z.infer<typeof emailSchema>;

type EnterEmailProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
};

const EnterEmail = ({ setResetState, setEmail }: EnterEmailProps) => {
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInputs>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormInputs) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    try {
      await forgetPassword({ email: normalizedEmail }).unwrap();
      setEmail(normalizedEmail);
      sessionStorage.setItem("pendingResetEmail", normalizedEmail);
      toast.success("Code sent", { description: "Check your email." });
      setResetState("EnterOTP");
    } catch (error) {
      if (typeof error === "object" && error && "data" in error) {
        const maybeData = (error as { data?: unknown }).data;
        if (
          typeof maybeData === "object" &&
          maybeData &&
          "message" in maybeData &&
          typeof (maybeData as { message?: unknown }).message === "string"
        ) {
          toast.error("Failed", {
            description: (maybeData as { message: string }).message,
          });
          return;
        }
      }
      toast.error("Failed", { description: "Please try again." });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border-border rounded-lg p-6 sm:p-8 shadow-sm"
    >
      <div className="space-y-4">
        <div className="header flex items-center gap-4 bg-gray">
          <div className="w-full">
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h2 className="text-2xl font-serif font-semibold">
                  Reset Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  We'll send you a verification code
                </p>
              </div>
            </div>
            <div className="space-y-4 w-full mt-5">
              <div className="space-y-2 w-full">
                <Label htmlFor="email" className="font-franklin text-sm">
                  Enter Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full font-franklin"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification code"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EnterEmail;
