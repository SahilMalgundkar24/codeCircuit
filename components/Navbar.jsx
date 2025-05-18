import React from "react";

const Navbar = () => {
  return (
    <div className="w-full py-5 px-5 flex justify-between items-center font-light text-white">
      <h1 className=" text-4xl logo text-[#70c3ab] w-1/3">VisualX</h1>
      <div className="gap-x-7 w-1/3 justify-center hidden md:flex">
        <h1>Home</h1>
        <h1>About</h1>
        <h1>Contact</h1>
        <h1>Price</h1>
      </div>
      <div className="w-1/3"></div>
    </div>
  );
};

export default Navbar;
