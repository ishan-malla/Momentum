import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgetPassword from "./pages/auth/forget-password/ForgetPasswordLayout";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>

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
