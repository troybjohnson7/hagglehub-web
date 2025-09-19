import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import VehicleSummary from "../components/deal_details/VehicleSummary";
import PricingCard from "../components/deal_details/PricingCard";
import DealerInfoCard from "../components/deal_details/DealerInfoCard";
import MessageTimeline from "../components/deal_details/MessageTimeline";
import NegotiationCoach from "../components/deal_details/NegotiationCoach";
import CompleteDealModal from "../components/deal_details/CompleteDealModal";

const API = import.meta.env.VITE_API_URL || "https://api.hagglehub.app";

export default function DealDetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dealId = searchParams.get("deal_id");

  const [deal, setDeal] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!dealId) {
      navigate(createPageUrl("Dashboard"));
      return;
    }
    try {
      setIsLoading(true);

      // Fetch the deal
      const respDeal = await fetch(`${API}/deals/${dealId}`);
      if (!respDeal.ok) throw new Error("Deal not found");
      const currentDeal = await respDeal.json();

      // Fetch related lists (vehicles + dealers)
      const [respVehicles, respDealers] = await Promise.all([
        fetch(`${API}/vehicles`).catch(() => null),
        fetch(`${API}/dealers`).catch(() => null),
      ]);
      const vehicles = respVehicles?.ok ? await respVehicles.json() : [];
      const dealers = respDealers?.ok ? await respDealers.json() : [];

      const currentVehicle = vehicles.find((v) => v.id === currentDeal.vehicle_id);
      const currentDealer = dealers.find((d) => d.id === currentDeal.dealer_id);

      // Fetch messages for this deal
      const respMsgs = await fetch(`${API}/deals/${currentDeal.id}/messages`);
      const thread = respMsgs.ok ? await respMsgs.json() : [];

      // Adapt messages to UI structure
      const uiMessages = thread.map((m) => ({
        id: m.id,
        dealer_id: currentDeal.dealer_id,
        deal_id: currentDeal.id,
        channel: m.channel || "email",
        direction: m.direction === "in" ? "inbound" : "outbound",
        content: m.body || "",
        created_date: m.createdAt,
        meta: m.meta || {},
      }));

      setDeal(currentDeal);
      setVehicle(currentVehicle);
      setDealer(currentDealer);
      setMessages(uiMessages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (error) {
      console.error("Failed to fetch deal details:", error);
      navigate(createPageUrl("Dashboard"));
    } finally {
      setIsLoading(false);
    }
  }, [dealId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDealCompleted = (updatedDeal) => {
    setDeal(updatedDeal);
    setShowCompleteModal(false);
  };

  if (isLoading || !deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-lime-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const isActiveStatus = ["quote_requested", "negotiating", "final_offer", "accepted"].includes(
    deal.status
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 px-4 py-6">
      <CompleteDealModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        deal={deal}
        vehicle={vehicle}
        onDealCompleted={handleDealCompleted}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={createPageUrl("Dashboard")}
            className="flex items-center text-sm text-slate-600 hover:text-brand-teal font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          {isActiveStatus && (
            <Button
              onClick={() => setShowCompleteModal(true)}
              className="bg-brand-lime hover:bg-brand-lime-dark text-brand-teal font-bold"
            >
              Complete Deal
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Vehicle and Messages */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {vehicle && <VehicleSummary vehicle={vehicle} deal={deal} />}

            {/* Mobile Negotiation Coach */}
            <div className="block lg:hidden">
              <NegotiationCoach deal={deal} vehicle={vehicle} messages={messages} />
            </div>

            <MessageTimeline
              messages={messages}
              dealer={dealer}
              deal={deal}
              onMessageSent={fetchData}
            />
          </div>

          {/* Right Column - Pricing, Dealer, Desktop Coach */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <PricingCard deal={deal} onUpdate={fetchData} />
            <div className="hidden lg:block">
              <NegotiationCoach deal={deal} vehicle={vehicle} messages={messages} />
            </div>
            {dealer && <DealerInfoCard dealer={dealer} />}
          </div>
        </div>
      </div>
    </div>
  );
}
