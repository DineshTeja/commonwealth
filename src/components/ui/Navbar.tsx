import Link from 'next/link';
import { Search, List, Map, Home, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/', label: 'Search', icon: Search },
  { href: '/', label: 'Lists', icon: List },
  { href: '/', label: 'Extraction', icon: Map },
  { href: '/', label: 'Settings', icon: Settings },
];

const Navbar = () => {
  return (
    <nav className="z-20 fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-100 via-purple-50 to-white text-white p-4">
      <ul className="space-y-2 mt-40">
        {navItems.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="shadow-md flex items-center py-2 px-4 hover:bg-purple-900/75 hover:text-white border text-purple-900 bg-purple-200 font-medium rounded-lg"
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;