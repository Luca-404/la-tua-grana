import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/provider/theme-toggle";
import { NavMenu } from "./NavMenu";
import logo from "../assets/img/logo.png";
import { Link } from "react-router-dom";
import bmcLogo from "../assets/img/bmc-logo.svg";
import { Button } from "./ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav id="navBar"
      className={`
        sticky top-0 z-50 p-2 sm:px-4 transition-all duration-300 ease-in-out 
        ${
          scrolled || mobileMenuOpen ? "bg-navigation text-foreground shadow-md" : "bg-transparent text-foreground"
        }
      `}
    >
      <div className="flex flex-row justify-between mx-auto px-4 gap-6 w-full max-w-screen-xl">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 w-14 sm:h-18 sm:w-27" />
          </Link>
          <Link to="/" className="text-2xl sm:text-3xl font-bold">
            La tua grana
          </Link>
        </div>
        {/* Bottone hamburger solo su mobile */}
        <Button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Apri menu"
        >
          <span
            className={`block w-6 h-0.5 bg-current mb-1 transition-all duration-200 ${
              mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-current mb-1 transition-all duration-200 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </Button>
        {/* Menu desktop */}
        <div className="hidden sm:flex items-center pr-4 space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <NavMenu />
          <ThemeToggle />
        </div>
        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-navigation text-foreground shadow-md sm:hidden z-50">
            <div className="flex flex-col items-center py-4 animate-fade-in">
              <NavMenu isOpen={mobileMenuOpen} />
            </div>
            <div className="flex flex-row justify-center items-center gap-6 py-3 border-t border-muted-foreground">
              <ThemeToggle />
              <a
                href="https://www.buymeacoffee.com/latuagrana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <span>Supportami</span>
                <img className="max-w-6" src={bmcLogo} alt="Buy me a coffee" />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
