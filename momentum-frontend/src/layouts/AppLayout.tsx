import DesktopNav from "@/components/common/DesktopNav";
import Navbar from "@/components/common/Navbar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <header className=" ">
        <Navbar></Navbar>
        <DesktopNav></DesktopNav>
      </header>

      <div>
        <Outlet></Outlet>
      </div>
    </div>
  );
};
export default Layout;
