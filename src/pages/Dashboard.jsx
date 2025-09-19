import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Handshake,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SmartInsights from "../components/dashboard/SmartInsights";
import DealCard from "../components/dashboard/DealCard";
import DealFilters from "../components/dashboard/DealFilters";
import RecentMessages from "../components/dashboard/RecentMessages";
import UserEmailManager from "../components/dashboard/UserEmailManager";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export default function Dashboard() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({ status: "active", priority: "all" });
  const [sortBy, setSortBy] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Load current user
        const respUser = await fetch(`${API}/users`);
        if (!respUser.ok) throw new Error("Failed to fetch user");
        const users = await respUser.json();
        // For now: assume first user is the logged-in one
        const currentUser = users[0];
        setUser(currentUser);

        if (!currentUser) {
          navigate("/");
          return;
        }

        // Fetch data in parallel
        const [respDeals, respVehicles, respDealers, respMessages] =
          await Promise.all([
            fetch(`${API}/deals`),
            fetch(`${API}/vehicles`).catch(() => null), // vehicles may not exist yet
            fetch(`${API}/dealers`).catch(() => null),  // dealers may not exist yet
            fetch(`${API}/users/${currentUser.key}/messages`),
          ]);

        const dealData = respDeals.ok ? await respDeals.json() : [];
        const vehicleData = respVehicles?.ok ? await respVehicles.json() : [];
        const dealerData = respDealers?.ok ? await respDealers.json() : [];
        const messageData = respMessages.ok ? await respMessages.json() : [];

        setDeals(dealData);
        setVehicles(vehicleData);
        setDealers(dealerData);
        setMessages(messageData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        navigate("/");
        return;
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const getVehicleById = (id) => vehicles.find((v) => v.id === id);
  const getDealerById = (id) => dealers.find((d) => d.id === id);

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;

    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter((deal) =>
          ["quote_requested", "negotiating", "final_offer"].includes(deal.status)
        );
      } else {
        filtered = filtered.filter((deal) => deal.status === filters.status);
      }
    }
    if (filters.priority !== "all") {
      filtered = filtered.filter((deal) => deal.priority === filters.priority);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "highest_offer":
          return (b.current_offer || 0) - (a.current_offer || 0);
        case "biggest_savings":
          const savingsA = (a.asking_price || 0) - (a.current_offer || 0);
          const savingsB = (b.asking_price || 0) - (b.current_offer || 0);
          return savingsB - savingsA;
        case "expiring_soon":
          if (!a.quote_expires) return 1;
          if (!b.quote_expires) return -1;
          return new Date(a.quote_expires) - new Date(b.quote_expires);
        case "recent":
        default:
          return new Date(b.createdAt || b.created_date) -
            new Date(a.createdAt || a.created_date);
      }
    });

    return sorted;
  }, [deals, filters, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-green-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 px-4 py-6 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {user?.name || "Haggler"}!
              </h1>
              <p className="text-slate-600 mt-1">
                Your command center for car deals.
              </p>
            </div>
            <Link to={createPageUrl("AddVehicle")} className="w-full md:w-auto">
              <Button className="bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl font-medium w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add New Deal
              </Button>
            </Link>
          </div>
          <div className="text-center py-20 px-6 bg-white rounded-xl shadow-sm border">
            <Handshake className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-800">
              You're All Set!
            </h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              You have no active deals right now. Click "Add New Deal" to start
              tracking your next vehicle negotiation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {user?.name || "Haggler"}!
            </h1>
            <p className="text-slate-600 mt-1">Your command center for car deals.</p>
          </div>
          <Link to={createPageUrl("AddVehicle")} className="w-full md:w-auto">
            <Button className="bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl font-medium w-full">
              <Plus className="w-5 h-5 mr-2" />
              Add New Deal
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <SmartInsights deals={deals} vehicles={vehicles} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-white"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {showMobileFilters ? "Hide Filters" : "Show Filters & Sort"}
              </Button>
            </div>

            <div className="md:hidden mb-4">
              <UserEmailManager />
            </div>

            <div className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
              <DealFilters
                filters={filters}
                setFilters={setFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {filteredAndSortedDeals.length > 0 ? (
                  filteredAndSortedDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      vehicle={getVehicleById(deal.vehicle_id)}
                      dealer={getDealerById(deal.dealer_id)}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border"
                  >
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      No Deals Found
                    </h3>
                    <p className="text-slate-500 mt-1">
                      Your filters didn't match any deals. Try adjusting your
                      filter settings.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1 space-y-8">
            <UserEmailManager />
            <RecentMessages
              messages={messages}
              dealers={dealers}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
