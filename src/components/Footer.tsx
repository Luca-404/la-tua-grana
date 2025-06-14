import { Link } from "react-router-dom";
import bmcButton from "../assets/img/bmc-button.svg";
import logo from "../assets/img/logo.png";

export function Footer() {
  return (
    <footer className="w-full gap-4 md:gap-0 bg-navigation text-foreground py-2 sm:py-4 sm:px-4">
      <div className="flex flex-col sm:flex-row flex-grow justify-between items-center sm:items-stretch mx-auto px-4 sm:px-8 gap-4 sm:gap-6 w-full max-w-screen-xl">
        <img src={logo} alt="Logo" className="h-10 w-16 sm:h-12 sm:w-20 md:h-18 md:w-27 mb-2 sm:mb-0 mx-auto sm:mx-0" />
        <div className="flex flex-col items-center justify-center text-center">
          <span className="block text-sm sm:text-base">© {new Date().getFullYear()} La tua grana. Tutti i diritti riservati.</span>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
            <Link to="mailto:latuagrana@gmail.com" className="underline">
              Contattaci
            </Link>
            <Link to="/privacy-policy" className="underline">
              Privacy Policy
            </Link>
          </div>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <Link to="https://www.buymeacoffee.com/latuagrana" target="_blank" rel="noopener noreferrer">
            <img className="max-w-28 sm:max-w-32 md:max-w-40 mx-auto" src={bmcButton} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
