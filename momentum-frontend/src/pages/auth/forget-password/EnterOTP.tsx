import { Link } from "react-router";
import type { ResetCase } from "./ResetPassword";
import { ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";

type EnterEmailProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
};

const EnterOTP = ({ setResetState }: EnterEmailProps) => {
  return (
    <div className="bg-card border-border rounded-lg p-6 sm:p-8 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link
            to="/auth/login"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-serif font-semibold">Enter Code</h2>
            <p className="text-sm text-muted-foreground">
              We sent a code to your email address
            </p>
          </div>
        </div>

        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          className="pt-2 w-full"
        >
          <InputOTPGroup className="gap-3 w-full flex justify-center">
            <InputOTPSlot
              index={0}
              className="w-12 h-12 font-semibold shadow-sm"
            />
            <InputOTPSlot
              index={1}
              className="w-12 h-12 font-semibold shadow-sm"
            />
            <InputOTPSlot
              index={2}
              className="w-12 h-12 font-semibold shadow-sm"
            />
            <InputOTPSlot
              index={3}
              className="w-12 h-12 font-semibold shadow-sm"
            />
            <InputOTPSlot
              index={4}
              className="w-12 h-12 font-semibold shadow-sm"
            />
            <InputOTPSlot
              index={5}
              className="w-12 h-12 font-semibold shadow-sm"
            />
          </InputOTPGroup>
        </InputOTP>
        <div className="flex flex-col items-center gap-6">
          <Button
            className="w-full font-franklin"
            onClick={() => setResetState("ChangePassword")}
          >
            Verify code
          </Button>

          <button className="text-sm text-primary hover:cursor-pointer hover:underline">
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterOTP;
