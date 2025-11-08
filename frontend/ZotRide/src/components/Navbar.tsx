import NavbarItem from "./NavbarItem";

interface NavbarProps {
  activeItem: "HOME" | "ABOUT" | "DRIVER" | "PROFILE";
  setActiveItem: (item: "HOME" | "ABOUT" | "DRIVER" | "PROFILE") => void;
}

const Navbar = ({ activeItem, setActiveItem }: NavbarProps) => {
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
              className="cursor-pointer"
            >
              <NavbarItem text="HOME" active={activeItem === "HOME"} />
            </div>
            <div
              onClick={() => setActiveItem("DRIVER")}
              className="cursor-pointer"
            >
              <NavbarItem text="DRIVER" active={activeItem === "DRIVER"} />
            </div>
            <div
              onClick={() => setActiveItem("PROFILE")}
              className="cursor-pointer"
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
