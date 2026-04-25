import { useEffect, useState } from "react";

const getWidth = () =>
  typeof window === "undefined" ? 1280 : window.innerWidth;

function useResponsive() {
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const handleResize = () => setWidth(getWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width,
    isMobile: width < 480,
    isLargeMobile: width >= 480 && width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isPhone: width < 768,
    isCompact: width < 1024,
  };
}

export default useResponsive;
