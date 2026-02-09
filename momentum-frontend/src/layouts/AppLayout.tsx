import DesktopNav from "@/components/common/DesktopNav";
import MobileNav from "@/components/common/MobileNav";
import Navbar from "@/components/common/Navbar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 ">
        <Navbar></Navbar>
        <DesktopNav></DesktopNav>
      </header>

      <div className="pb-20 md:pb-0">
        <Outlet></Outlet>
      </div>
      <MobileNav />
    </div>
  );
};
export default Layout;
