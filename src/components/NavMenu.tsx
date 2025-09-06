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
import { PAGE_LINK } from "@/lib/constants";

interface GitHubIconProps {
  size?: number;
  className?: string;
}

export function GitHubIcon({ size = 24, className }: GitHubIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="var(--foreground)"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 0.2975C5.37 0.2975 0 5.6675 0 12.2975C0 17.6675 3.438 22.1675 8.205 23.7975C8.805 23.8975 9.025 23.5475 9.025 23.2475C9.025 22.9775 9.015 22.1675 9.01 21.1475C5.672 21.8975 4.968 19.6475 4.968 19.6475C4.422 18.2975 3.633 17.8975 3.633 17.8975C2.547 17.1475 3.717 17.1625 3.717 17.1625C4.922 17.2475 5.555 18.3875 5.555 18.3875C6.633 20.0975 8.297 19.6475 8.922 19.3475C9.022 18.5675 9.328 18.0275 9.672 17.7175C7.015 17.4075 4.266 16.3475 4.266 11.6175C4.266 10.2975 4.734 9.2075 5.547 8.3475C5.422 8.0375 5.047 6.8075 5.672 5.0975C5.672 5.0975 6.672 4.7575 9.01 6.3575C9.948 6.0875 10.952 5.9525 11.955 5.9475C12.958 5.9525 13.962 6.0875 14.901 6.3575C17.238 4.7575 18.237 5.0975 18.237 5.0975C18.862 6.8075 18.487 8.0375 18.362 8.3475C19.177 9.2075 19.644 10.2975 19.644 11.6175C19.644 16.3575 16.888 17.3975 14.222 17.7075C14.645 18.0775 15.022 18.7975 15.022 19.8775C15.022 21.4275 15.01 22.8475 15.01 23.2475C15.01 23.5475 15.222 23.9025 15.832 23.7975C20.602 22.1675 24 17.6675 24 12.2975C24 5.6675 18.63 0.2975 12 0.2975Z" />
    </svg>
  );
}

export function NavMenu({ isOpen }: { isOpen?: boolean }) {
  if (isOpen) {
    return (
      <ul className="flex flex-col flex-grow items-center">
        <li>
          <Link to={PAGE_LINK.retirementFund} className="text-lg font-semibold py-2 block w-full text-center">
            Fondo pensione
          </Link>
        </li>
        <li>
          <Link to={PAGE_LINK.mortgageVsRent} className="text-lg font-semibold py-2 block w-full text-center">
            Acquisto vs Affitto
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
              <Link to={PAGE_LINK.retirementFund}>Fondo pensione</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="px-4 py-2 whitespace-nowrap">
              <Link to={PAGE_LINK.mortgageVsRent}>Affitto vs Mutuo</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="px-4 py-2 text-base whitespace-nowrap">
              {/* <Link to="/docs">Coming soon</Link> */}
              <div>Coming soon</div>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <GitHubIcon />
        <NavigationMenuItem className="text-lg gap-3">
          <Link
            to={PAGE_LINK.buyMeCoffe}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            {/* <span>Supportami</span> */}
            <img className="max-w-6" src={bmcLogo} alt="Buy me a coffee" />
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
