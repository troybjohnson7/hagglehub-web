import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "@/api/entities";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export default function NotificationCenter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const me = await User.me();
        if (!me?.key) {
          setCount(0);
          return;
        }
        const resp = await fetch(`${API}/inbox/unmatched?userKey=${me.key}`);
        if (!resp.ok) throw new Error("Failed inbox fetch");
        const data = await resp.json();
        setCount(data.length);
      } catch (e) {
        console.error("Inbox check failed:", e);
        setCount(0);
      }
    };

    load();
    timer = setInterval(load, 120000); // refresh every 2 min
    return () => clearInterval(timer);
  }, []);

  return (
    <Link to="/inbox" className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-brand-teal hover:text-brand-lime"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 
             2.032 0 0118 14.158V11a6.002 
             6.002 0 00-4-5.659V5a2 2 0 
             10-4 0v.341C7.67 6.165 6 8.388 
             6 11v3.159c0 .538-.214 1.055-.595 
             1.436L4 17h5m6 0v1a3 3 0 
             11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand-lime text-brand-teal text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
          {count}
        </span>
      )}
    </Link>
  );
}
