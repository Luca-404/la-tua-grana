import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky w-full top-0 z-50 p-4 mb-2 bg-primary">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">FP Analysis</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
