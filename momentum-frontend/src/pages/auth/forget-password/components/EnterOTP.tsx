import type { ResetCase } from "./ResetPassword";
import { ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "Code must be 6 digits" })
    .regex(/^\d+$/, { message: "Code must contain only digits" }),
});

type OTPFormInputs = z.infer<typeof otpSchema>;

type EnterEmailProps = {
  setResetState: React.Dispatch<React.SetStateAction<ResetCase>>;
};

const EnterOTP = ({ setResetState }: EnterEmailProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormInputs>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: OTPFormInputs) => {
    console.log(data);
    // Verify OTP here, then proceed to change password
    setResetState("ChangePassword");
  };

  const handleResendCode = () => {
    // Implement resend code logic here
    console.log("Resending code...");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border-border rounded-lg p-6 sm:p-8 shadow-sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setResetState("EnterEmail")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-semibold">Enter Code</h2>
            <p className="text-sm text-muted-foreground">
              We sent a code to your email address
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                className="pt-2 w-full"
                value={field.value}
                onChange={field.onChange}
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
            )}
          />
          {errors.otp && (
            <p className="text-sm text-red-400 text-center">
              {errors.otp.message}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <Button type="submit" className="w-full font-franklin">
            Verify code
          </Button>

          <button
            type="button"
            onClick={handleResendCode}
            className="text-sm text-primary hover:cursor-pointer hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </form>
  );
};

export default EnterOTP;
