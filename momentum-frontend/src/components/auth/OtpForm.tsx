import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "Code must be 6 digits" })
    .regex(/^\d+$/, { message: "Code must contain only digits" }),
});

type OTPFormInputs = z.infer<typeof otpSchema>;

type OtpFormProps = {
  title: string;
  description?: string;
  submitLabel?: string;
  onSubmitOtp: (otp: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  resendLabel?: string;
  loading?: boolean;
  headerLeft?: React.ReactNode;
};

const OtpForm = ({
  title,
  description,
  submitLabel = "Verify code",
  onSubmitOtp,
  onResend,
  resendLabel = "Resend code",
  loading,
  headerLeft,
}: OtpFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormInputs>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = async (data: OTPFormInputs) => {
    await onSubmitOtp(data.otp);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm"
      noValidate
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {headerLeft}
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
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
                <InputOTPGroup className="gap-2 sm:gap-3 w-full flex justify-center">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-10 h-10 sm:w-12 sm:h-12 font-semibold shadow-sm"
                    />
                  ))}
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
          <Button
            type="submit"
            className="w-full font-franklin"
            disabled={Boolean(loading)}
          >
            {loading ? "Verifying..." : submitLabel}
          </Button>

          {onResend && (
            <button
              type="button"
              onClick={() => onResend()}
              className="text-sm text-primary hover:cursor-pointer hover:underline"
            >
              {resendLabel}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default OtpForm;

