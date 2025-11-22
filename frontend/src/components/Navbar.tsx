import NavbarItem from "./NavbarItem";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  activeItem: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE";
  setActiveItem: (
    item: "HOME" | "ABOUT" | "DRIVER" | "ORGANIZATIONS" | "PROFILE"
  ) => void;
  isAuthenticated: boolean;
}

const Navbar = ({
  activeItem,
  setActiveItem,
  isAuthenticated,
}: NavbarProps) => {
  const { user } = useAuth();
  const isDriver = user?.is_driver || false;

  return (
    <div className="flex justify-center w-full">
      <div className="navbar border border-black w-19/20 h-20 rounded-full justify-center mt-4">
        <div className="navbar-start px-4 text-black">
          <div></div>
        </div>
        <div className="navbar-center hidden lg:flex text-black">
          <div className="flex gap-6">
            <div
              onClick={() => setActiveItem("ABOUT")}
              className="cursor-pointer"
            >
              <NavbarItem text="ABOUT" active={activeItem === "ABOUT"} />
            </div>
            <div
              onClick={() => setActiveItem("HOME")}
              className={
                isAuthenticated
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }
            >
              <NavbarItem text="HOME" active={activeItem === "HOME"} />
            </div>
            <div
              onClick={() => setActiveItem("DRIVER")}
              className={
                isAuthenticated && isDriver
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }
              title={
                !isDriver && isAuthenticated
                  ? "Only available for ZotDrivers"
                  : ""
              }
            >
              <NavbarItem text="DRIVER" active={activeItem === "DRIVER"} />
            </div>
            <div
              onClick={() => setActiveItem("ORGANIZATIONS")}
              className={
                isAuthenticated
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }
            >
              <NavbarItem text="ORGS" active={activeItem === "ORGANIZATIONS"} />
            </div>
            <div
              onClick={() => setActiveItem("PROFILE")}
              className={
                isAuthenticated
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }
            >
              <NavbarItem text="PROFILE" active={activeItem === "PROFILE"} />
            </div>
          </div>
        </div>
        <div className="navbar-end px-4">
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
