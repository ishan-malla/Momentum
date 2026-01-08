import DesktopNav from "@/components/common/DesktopNav";
import Navbar from "@/components/common/Navbar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 ">
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
