import OtpForm from "@/components/auth/OtpForm";
import {
  useForgetPasswordMutation,
  useVerifyResetOTPMutation,
} from "@/features/auth/authApiSlice";
import type { ResetCase } from "./forget-password/components/ResetPassword";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

type EnterOtpProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
  email: string;
};

const EnterOTP = ({ setResetState, email }: EnterOtpProps) => {
  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOTPMutation();
  const [forgetPassword, { isLoading: isResending }] =
    useForgetPasswordMutation();

  const onVerify = async (otp: string) => {
    if (!normalizedEmail) {
      toast.error("Missing email", { description: "Please enter your email." });
      return;
    }

    try {
      await verifyResetOtp({ email: normalizedEmail, otp }).unwrap();
      toast.success("Verified", { description: "Code verified." });
      setResetState("ChangePassword");
    } catch (error) {
      if (typeof error === "object" && error && "data" in error) {
        const maybeData = (error as { data?: unknown }).data;
        if (
          typeof maybeData === "object" &&
          maybeData &&
          "message" in maybeData &&
          typeof (maybeData as { message?: unknown }).message === "string"
        ) {
          toast.error("Verification failed", {
            description: (maybeData as { message: string }).message,
          });
          return;
        }
      }
      toast.error("Verification failed", { description: "Please try again." });
    }
  };

  const onResend = async () => {
    if (!normalizedEmail) {
      toast.error("Missing email", { description: "Please enter your email." });
      return;
    }
    try {
      await forgetPassword({ email: normalizedEmail }).unwrap();
      toast.success("Code sent", { description: "Check your email." });
    } catch {
      toast.error("Resend failed", { description: "Please try again." });
    }
  };

  return (
    <div className="space-y-4">
      {!normalizedEmail ? (
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold">
            Reset password
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please go back and enter your email to receive a code.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setResetState("EnterEmail")}
              className="text-sm text-primary hover:underline"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <OtpForm
          title="Enter Code"
          description="We sent a code to your email address"
          onSubmitOtp={onVerify}
          onResend={onResend}
          loading={isVerifying || isResending}
          headerLeft={
            <button
              type="button"
              onClick={() => setResetState("EnterEmail")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          }
        />
      )}
    </div>
  );
};

export default EnterOTP;
