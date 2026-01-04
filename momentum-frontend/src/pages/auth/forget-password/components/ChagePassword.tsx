import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { ResetCase } from "./ResetPassword";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(10, { message: "Password must be at most 10 characters" })
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormInputs = z.infer<typeof passwordSchema>;

type ChangePasswordProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
};

const ChangePassword = ({ setResetState }: ChangePasswordProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormInputs) => {
    console.log(data);
    // Reset password logic here
    // Then redirect to login or show success message
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border-border rounded-lg p-6 sm:p-8 shadow-sm"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setResetState("EnterOTP")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-semibold">
              Reset Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your new password
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-franklin text-[14px]">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              className="font-sans"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-400">
                {errors.newPassword.message}
              </p>
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
          </div>

          <Button type="submit" className="w-full font-franklin">
            Reset Password
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChangePassword;
