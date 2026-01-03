import { Routes, Route } from "react-router";
import Overview from "./pages/Overview";
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Overview />}></Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}

export default App;
