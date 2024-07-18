"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, List, Map, Home, Settings, LogIn, LogOut } from 'lucide-react';
import LoginDialog from './LoginDialog';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/lib/supabaseClient';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/lists', label: 'Lists', icon: List },
  { href: '/extraction', label: 'Extraction', icon: Map },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
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

  useEffect(() => {
    console.log(userEmail);
    console.log(userId)
  }, [userEmail]);

  return (
    <nav className={`fixed left-0 top-0 h-full ${isCollapsed ? 'w-[5%]' : 'w-64'} bg-gradient-to-b from-purple-100 via-purple-50 to-white text-white p-4 transition-width duration-300`}>
      <Button variant="ghost" onClick={() => setIsCollapsed(!isCollapsed)} className="text-purple-800">
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
      <div className="flex items-center mt-6">
        <Link href="/">
          <Image
            src="/images/commonwealth.png"
            alt="Commonwealth"
            width={50}
            height={50}
            href="/"
          />
        </Link>
        {!isCollapsed && (
          <p className="text-lg font-semibold text-purple-800">Commonwealth.ai</p>
        )}
      </div>
      <ul className="space-y-2 mt-40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.label} className="relative">
              <Link href={item.href}>
              {!isCollapsed && (
                <motion.div
                  className={`text-purple-900 flex items-center py-2 px-4 rounded-lg font-medium transition-colors ${isActive ? 'bg-purple-900 shadow-md text-white' : ' hover:bg-purple-900/75 hover:text-white'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={isActive && { type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </motion.div>
              )}
              {isCollapsed && (
                <motion.div
                  className={`text-purple-900 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-colors ${isActive ? 'bg-purple-900 shadow-md text-white' : 'hover:bg-purple-900/75 hover:text-white'}`}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
              )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto pt-4">
        <Avatar className="mx-auto mb-2">
          <AvatarFallback className="text-purple-900 bg-purple-200">
            {userEmail ? userEmail[0].toUpperCase() : 'NA'}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="text-center text-sm text-purple-900 truncate">
            {userEmail || 'Not Found'}
          </div>
        )}
      </div>
      <ul className="mt-auto pt-4">
        {!userId ? (
          <li>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="shadow-md flex items-center justify-center py-2 px-4 hover:bg-purple-900/75 hover:text-white border text-purple-900 bg-purple-200 font-medium rounded-lg w-full"
            >
              <LogIn className={`${!isCollapsed && 'mr-2'} h-5 w-5`} />
              {!isCollapsed && 'Login'}
            </button>
          </li>
        ) : (
          <li>
            <button
              onClick={handleLogout}
              className="shadow-md flex items-center justify-center py-2 px-4 hover:bg-purple-900/75 hover:text-white border text-purple-900 bg-purple-200 font-medium rounded-lg w-full"
            >
              <LogOut className={`${!isCollapsed && 'mr-2'} h-5 w-5`} />
              {!isCollapsed && 'Logout'}
            </button>
          </li>
        )}
      </ul>
      <LoginDialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </nav>
  );
};

export default Navbar;