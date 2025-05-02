import {ModeToggle} from "@/components/provider/mode-toggle.tsx";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 p-4 mb-2 bg-primary">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl text-white font-bold">La tua grana</h1>
        <ul className="flex space-x-4">
          <li>
            <ModeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
