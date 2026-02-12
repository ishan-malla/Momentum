import { useState } from "react";
import EnterEmail from "./EnterEmail";
import EnterOTP from "../../EnterOTP";
import ChangePassword from "./ChangePassword";

export type ResetCase = "EnterEmail" | "EnterOTP" | "ChangePassword";

const ResetPassword = () => {
  const [resetState, setResetState] = useState<ResetCase>("EnterEmail");
  const [email, setEmail] = useState(
    () => sessionStorage.getItem("pendingResetEmail") || "",
  );

  switch (resetState) {
    case "EnterEmail":
      return <EnterEmail setResetState={setResetState} setEmail={setEmail} />;

    case "EnterOTP":
      return <EnterOTP setResetState={setResetState} email={email} />;

    case "ChangePassword":
      return <ChangePassword setResetState={setResetState} email={email} />;

    default:
      return null;
  }
};

export default ResetPassword;
