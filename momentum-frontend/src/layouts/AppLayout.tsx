import DesktopNav from "@/components/common/DesktopNav";
import MobileQuickNav from "@/components/common/MobileQuickNav";
import Navbar from "@/components/common/Navbar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 ">
        <Navbar></Navbar>
        <DesktopNav></DesktopNav>
      </header>

      <div className="pb-20 md:pb-6">
        <Outlet></Outlet>
      </div>
      <MobileQuickNav />
    </div>
  );
};
export default Layout;
  
