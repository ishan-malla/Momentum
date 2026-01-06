import { Settings, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useLocation } from "react-router";
const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <div className="border-b border-border bg-card   h-16 md:h-22 flex items-center ">
      <div className="xl:w-2/3  flex justify-between w-full p-5 xl:p-0 items-center h-full xl:mx-auto ">
        <h1 className="text-lg md:text-3xl font-semibold font-elegant tracking-tight">
          Momentum
        </h1>
        <div className="flex gap-5">
          <Button
            className={` ${
              pathname === "/settings"
                ? "bg-gray-200 hover:bg-transparent"
                : "bg-transparent hover:bg-gray-100"
            } hidden md:block `}
            variant="outline"
          >
            <Link to="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            className={` ${
              pathname === "/achievments"
                ? "bg-gray-200 hover:bg-transparent"
                : "bg-transparent hover:bg-gray-100"
            } hidden md:block `}
            variant="outline"
          >
            <Link to="/achievments">
              <Trophy className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
