import React, { Dispatch, SetStateAction } from "react";
import { ReactComponent as Search } from "../../icons/search.svg";

interface NavProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Navbar: React.FC<NavProps> = ({ setIsOpen }) => {
  return (
    <nav className="p-4 flex items-center justify-between bg-[#6750a4]">
      <div className="text-2xl text-white font-semibold">Query Quest</div>
      <div
        className="flex items-center justify-center rounded-full p-1 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-8 h-8 text-white" />
      </div>
    </nav>
  );
};

export default Navbar;
