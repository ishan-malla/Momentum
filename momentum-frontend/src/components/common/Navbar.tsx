import { Settings, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <div className="border-b border-border bg-card sticky top-0 z-40  h-16 md:h-22 flex items-center ">
      <div className="xl:w-2/3  flex justify-between w-full p-5 xl:p-0 items-center h-full xl:mx-auto ">
        <h1 className="text-lg md:text-3xl font-semibold font-elegant tracking-tight">
          Momentum
        </h1>
        <div className="flex gap-5">
          <Button
            className="bg-transparent hover:bg-gray-100 hidden md:block"
            variant="outline"
          >
            <Link to="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            className="bg-transparent hover:bg-gray-100 hidden md:block"
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
