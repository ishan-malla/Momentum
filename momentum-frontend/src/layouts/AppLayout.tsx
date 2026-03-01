import AppSidebar from "@/components/common/AppSidebar";
import MobileQuickNav from "@/components/common/MobileQuickNav";
import Navbar from "@/components/common/Navbar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <div className="md:pl-[21rem]">
        <header className="sticky top-0 z-40 md:hidden">
          <Navbar />
        </header>

        <main className="pb-20 md:px-2 md:pb-12 lg:px-3">
          <Outlet />
        </main>
      </div>

      <MobileQuickNav />
    </div>
  );
};
export default Layout;
  
