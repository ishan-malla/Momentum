import { useState } from "react";
import EnterEmail from "./EnterEmail";
import EnterOTP from "./EnterOTP";
import ChangePassword from "./ChagePassword";

export type ResetCase = "EnterEmail" | "EnterOTP" | "ChangePassword";

const ResetPassword = () => {
  const [resetState, setResetState] = useState<ResetCase>("EnterEmail");

  switch (resetState) {
    case "EnterEmail":
      return <EnterEmail setResetState={setResetState} />;

    case "EnterOTP":
      return <EnterOTP setResetState={setResetState}></EnterOTP>;

    case "ChangePassword":
      return <ChangePassword setResetState={setResetState}></ChangePassword>;

    default:
      return null;
  }
};

export default ResetPassword;
