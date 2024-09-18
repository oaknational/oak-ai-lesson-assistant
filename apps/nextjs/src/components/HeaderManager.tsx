"use client";

import { useState } from "react";

import Header from "./Header";
import MainNavigation from "./MainNavigation";

const HeaderManager = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MainNavigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </>
  );
};

export default HeaderManager;
