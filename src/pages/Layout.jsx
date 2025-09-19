import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  LogIn,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationCenter from "./components/notifications/NotificationCenter";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

const navigationItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: createPageUrl("Dashboard") },
  { title: "New Deal", icon: Plus, url: createPageUrl("AddVehicle") },
  { title: "Messages", icon: MessageSquare, url: createPageUrl("Messages") },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch current user
  useEffect(() => {
    let timeoutId = null;

    const checkUser = async (isInitial = false) => {
      try {
        const resp = await fetch(`${API}/users/me`);
        if (!resp.ok) throw new Error("Not authenticated");
        const currentUser = await resp.json();
        setUser(currentUser);
        setRetryCount(0);
      } catch (error) {
        if (isInitial || retryCount === 0) {
          console.error("Error checking user:", error);
        }
        setRetryCount((prev) => Math.min(prev + 1, 5));
        setUser(null);
      }
    };

    checkUser(true);

    const scheduleNextCheck = () => {
      const baseInterval = 180000;
      const backoffMultiplier = Math.pow(2, Math.min(retryCount, 4));
      const interval = baseInterval * backoffMultiplier;

      timeoutId = setTimeout(() => {
        checkUser().finally(() => {
          scheduleNextCheck();
        });
      }, interval);
    };

    scheduleNextCheck();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.pathname, retryCount]);

  const handleLogin = async () => {
    window.location.href = `${API}/auth/login`; // update with real login endpoint
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST" }).catch(() => null);
    setUser(null);
    window.location.reload();
  };

  const publicPages = ["Index", "About", "PrivacyPolicy", "TermsOfService"];
  const isPublicPage = publicPages.includes(currentPageName);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3 w-auto"></div>

          {/* Logo centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img
              src="/logo.png" // replace with your deployed HaggleHub logo
              alt="HaggleHub Logo"
              className="h-10 object-contain"
            />
          </div>

          {/* Right side - notifications and user menu */}
          <div className="flex items-center gap-3">
            {user && <NotificationCenter user={user} />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Avatar className="cursor-pointer h-9 w-9 border-2 border-slate-200">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to={createPageUrl("Account")}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account & Subscription</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button onClick={handleLogin} variant="outline" size="sm" className="font-bold">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto bg-slate-50 ${user ? "pb-32" : "pb-4"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer
        className={`bg-slate-100 border-t border-slate-200 text-center py-4 px-4 ${
          user ? "mb-20" : "mt-0"
        } z-10`}
      >
        <div className="text-xs text-slate-500">
          <Link to={createPageUrl("About")} className="hover:text-brand-teal px-2">
            About Us
          </Link>
          <span className="px-1">|</span>
          <Link to={createPageUrl("TermsOfService")} className="hover:text-brand-teal px-2">
            Terms of Service
          </Link>
          <span className="px-1">|</span>
          <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-brand-teal px-2">
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          © {new Date().getFullYear()} HaggleHub. All rights reserved.
        </p>
      </footer>

      {/* Bottom Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-brand-teal px-4 py-3 z-50 shadow-lg">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              const isMessagesTab = item.title === "Messages";
              return (
                <motion.div
                  key={item.title}
                  whileTap={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="flex-1"
                >
                  <Link
                    to={item.url}
                    className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 font-brand ${
                      isActive
                        ? "bg-brand-lime text-brand-teal shadow-md"
                        : "text-white hover:text-brand-lime hover:bg-brand-teal-light"
                    }`}
                  >
                    {isMessagesTab && (
                      <NotificationCenter user={user} showBadgeOnly />
                    )}
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{item.title}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
