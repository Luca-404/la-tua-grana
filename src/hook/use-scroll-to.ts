import { useEffect, useRef, useCallback } from "react";

const useScrollTo = (targetId: string) => {
  const navBarElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const navBarElement = document.getElementById("navBar");
    if (navBarElement) {
      navBarElementRef.current = navBarElement;
    }
  }, []);

  const scrollToElement = useCallback(() => {
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
      console.warn(`Element with ID '${targetId}' not found for scrolling.`);
      return;
    }

    const navBarHeight = navBarElementRef.current?.getBoundingClientRect().height ?? 0;
    
    const targetRect = targetElement.getBoundingClientRect();
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;

    const targetScrollPosition = targetRect.top + currentScrollPosition - navBarHeight;

    window.scrollTo({
      top: targetScrollPosition,
      behavior: "smooth",
    });
  }, [targetId]);

  return { scrollToElement };
};

export default useScrollTo;