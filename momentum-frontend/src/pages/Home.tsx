import DesktopNav from "@/components/common/DesktopNav";
import Navbar from "@/components/common/Navbar";
import GreetUser from "@/components/users/GreetUser";

const Home = () => {
  return (
    <div className="w-full h-screen">
      <header className="w-full ">
        <Navbar></Navbar>
        <DesktopNav></DesktopNav>
      </header>

      <GreetUser></GreetUser>
    </div>
  );
};
export default Home;
