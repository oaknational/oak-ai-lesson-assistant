"use client";

import { useState } from "react";

import Header from "./Header";
import MainNavigation from "./MainNavigation";

const HeaderManager = ({ featureFlag }: { featureFlag: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header
        featureFlag={featureFlag}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <MainNavigation
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        featureFlag={featureFlag}
      />
    </>
  );
};

export default HeaderManager;
