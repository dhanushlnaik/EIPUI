import React from "react";
import { useColorModeValue } from "./ui/color-mode";
import logoLight from '@/../public/EIPsInsightsDark.gif';     // for light mode
import logoDark from '@/../public/EIPsInsights.gif';     // for dark mode
import Image from 'next/image';

function Logo() {
  const logoSrc = useColorModeValue(logoLight, logoDark); // use the imported image objects

  return (
    <Image
      src={logoSrc}
      width={50}
      height={50}
      alt="logo"
      priority
      style={{ color: 'inherit', backgroundColor: 'transparent' }}
    />
  );
}

export default Logo;
