import { useState } from "react";
import EnterEmail from "./EnterEmail";
import EnterOTP from "./EnterOTP";

export type ResetCase = "EnterEmail" | "EnterOTP" | "ChangePassword";

const ResetPassword = () => {
  const [resetState, setResetState] = useState<ResetCase>("EnterEmail");

  switch (resetState) {
    case "EnterEmail":
      return <EnterEmail setResetState={setResetState} />;

    case "EnterOTP":
      return <EnterOTP setResetState={setResetState}></EnterOTP>;

    case "ChangePassword":
      return <div>Change Password</div>;

    default:
      return null;
  }
};

export default ResetPassword;
