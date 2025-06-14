import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import bmcLogo from "../assets/img/bmc-logo.svg";

export function NavMenu({ isOpen }: { isOpen?: boolean }) {
  if (isOpen) {
    return (
      <ul className="flex flex-col flex-grow items-center">
        <li>
          <Link to="/retirement-fund" className="text-lg font-semibold py-2 block w-full text-center">
            Fondo pensione
          </Link>
        </li>
        <li>
          <span className="text-lg py-2 block w-full text-center text-muted-foreground">Coming soon</span>
        </li>
      </ul>
    );
  }
  return (
    <NavigationMenu viewport={true}>
      <NavigationMenuList className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-lg bg-transparent transition-colors">
            Simulazioni
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink asChild className="px-4 py-2 whitespace-nowrap">
              <Link to="/retirement-fund">Fondo pensione</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="px-4 py-2 text-base whitespace-nowrap">
              {/* <Link to="/docs">Coming soon</Link> */}
              <div>Coming soon</div>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
          <NavigationMenuItem className="text-lg">
            <Link
              to="https://www.buymeacoffee.com/latuagrana"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <span>Supportami</span>
              <img className="max-w-6" src={bmcLogo} alt="Buy me a coffee" />
            </Link>
          </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
