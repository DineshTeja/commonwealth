"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, List, Map, Home, Settings, LogIn, LogOut } from 'lucide-react';
import LoginDialog from './LoginDialog';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/lib/supabaseClient';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/lists', label: 'Lists', icon: List },
  { href: '/extraction', label: 'Extraction', icon: Map },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { userId, setSession, userEmail } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      setSession(null); // Clear the user session
    }
  };

  return (
    <nav className="z-20 fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-100 via-purple-50 to-white text-white p-4">
      <div 
        className="flex items-center justify-start mt-6"
        style={{
          background: "linear-gradient(to right, #6a1b9a, #da77f2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        <Image
          src="/images/commonwealth.png"
          alt="Commonwealth"
          width={50}
          height={50}
          href="/"
        />
        <p className="text-lg font-medium text-purple-800">Commonwealth.ai</p>
      </div>
      <ul className="space-y-2 mt-40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.label} className="relative">
              <Link href={item.href}>
                <motion.div
                  className={` flex items-center py-2 px-4 rounded-lg font-medium transition-colors ${isActive ? 'bg-purple-900 text-white shadow-md' : 'text-purple-900 hover:bg-purple-900/75 hover:text-white'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={isActive && { type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-[550px] pt-4">
        <Avatar className="mx-auto mb-2">
          <AvatarFallback className="text-purple-900 bg-purple-200">
            {userEmail ? userEmail[0].toUpperCase() : 'NA'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center text-sm text-purple-900 truncate">
          {userEmail || 'Not Found'}
        </div>
      </div>
      <ul className="mt-auto pt-4">
        {!userId ? (
          <li>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="shadow-md flex items-center py-2 px-4 hover:bg-purple-900/75 hover:text-white border text-purple-900 bg-purple-200 font-medium rounded-lg w-full"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </button>
          </li>
        ) : (
          <li>
            <button
              onClick={handleLogout}
              className="shadow-md flex items-center py-2 px-4 hover:bg-purple-900/75 hover:text-white border text-purple-900 bg-purple-200 font-medium rounded-lg w-full"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </button>
          </li>
        )}
      </ul>
      <LoginDialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </nav>
  );
};

export default Navbar;