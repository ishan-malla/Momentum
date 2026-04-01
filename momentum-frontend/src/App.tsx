import { Navigate, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmailOtp from "./pages/auth/VerifyEmailOtp";
import ForgetPassword from "./pages/auth/forget-password/ForgetPasswordLayout";
import AppLayout from "./layouts/AppLayout";
import Timer from "./pages/Timer";
import Habits from "./pages/Habits";
import TaskCalendar from "./pages/TaskCalendar";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Achievments from "./pages/Achievments";
import Settings from "./pages/Settings";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/habits/analytics" element={<Analytics />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/task-calendar" element={<TaskCalendar />} />
            <Route
              path="/analytics"
              element={<Navigate to="/habits/analytics" replace />}
            />
            <Route path="/social" element={<Social />} />
            <Route path="/achievments" element={<Achievments />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="otp" element={<VerifyEmailOtp />} />
          <Route path="forget-password" element={<ForgetPassword />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
