import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgetPassword from "./pages/auth/forget-password/ForgetPasswordLayout";
import AppLayout from "./layouts/AppLayout";
import Timer from "./pages/Timer";
import Habits from "./pages/Habits";
import TaskCalendar from "./pages/TaskCalendar";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Achievments from "./pages/Achievments";
import Settings from "./pages/Settings";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/task-calendar" element={<TaskCalendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/social" element={<Social />} />
          <Route path="/achievments" element={<Achievments />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forget-password" element={<ForgetPassword />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
