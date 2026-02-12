import OtpForm from "@/components/auth/OtpForm";
import { useResendOTPMutation, useVerifyOTPMutation } from "@/features/auth/authApiSlice";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

type LocationState = {
  email?: string;
  from?: string;
  autoResend?: boolean;
};

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const state = (location.state as LocationState | null) ?? null;
  const [email] = useState(
    state?.email ?? user?.email ?? sessionStorage.getItem("pendingVerifyEmail") ?? "",
  );
  const didAutoResendRef = useRef(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOTPMutation();

  const onVerify = async (otp: string) => {
    if (!normalizedEmail) {
      toast.error("Missing email", { description: "Please enter your email." });
      return;
    }

    try {
      await verifyOtp({ email: normalizedEmail, otp }).unwrap();
      toast.success("Verified", { description: "Your email is now verified." });
      sessionStorage.removeItem("pendingVerifyEmail");
      const from = state?.from ?? "/home";
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
      await resendOtp({ email: normalizedEmail }).unwrap();
      toast.success("Code sent", { description: "Check your email." });
    } catch {
      toast.error("Resend failed", { description: "Please try again." });
    }
  };

  useEffect(() => {
    if (!normalizedEmail) return;
    sessionStorage.setItem("pendingVerifyEmail", normalizedEmail);
  }, [normalizedEmail]);

  useEffect(() => {
    if (!state?.autoResend || didAutoResendRef.current) return;
    if (!normalizedEmail) return;
    didAutoResendRef.current = true;
    onResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.autoResend, normalizedEmail]);

  return (
    <div className="space-y-4">
      {!normalizedEmail && (
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold">
            Verify your email
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please go back to login and try again so we can send the OTP to your email.
          </p>
          <div className="mt-6">
            <Link to="/auth/login" className="text-sm text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      )}

      {normalizedEmail && (
        <OtpForm
          title="Verify your email"
          description="Enter the 6‑digit code we sent to your email."
          onSubmitOtp={onVerify}
          onResend={onResend}
          loading={isVerifying || isResending}
          headerLeft={
            <Link
              to="/auth/login"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Back to login"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          }
        />
      )}
    </div>
  );
};

export default VerifyEmailOtp;
