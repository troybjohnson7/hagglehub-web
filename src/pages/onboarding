import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Vehicle } from '@/entities/Vehicle';
import { Dealer } from '@/entities/Dealer';
import { Deal } from '@/entities/Deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PartyPopper, ArrowRight, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Helper function to generate a unique identifier for the email address
const generateShortId = (length = 7) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export default function OnboardingPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    User.me().then(setUser).catch(() => navigate('/')); // Redirect if not logged in
  }, [navigate]);

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      const newIdentifier = generateShortId();
      
      // Step 1: Create a dummy vehicle for the fallback deal
      const fallbackVehicle = await Vehicle.create({
        make: "HaggleHub",
        model: "Inbox",
        year: 2024,
        condition: "new",
        listing_url: "https://hagglehub.app/inbox"
      });

      // Step 2: Create a dummy dealer for the fallback deal
      const fallbackDealer = await Dealer.create({
        name: "HaggleHub Inbox",
        contact_email: `deals-${newIdentifier}@hagglehub.app`,
        address: "Virtual Address",
        phone: "000-000-0000"
      });

      // Step 3: Create the user-specific fallback deal
      const fallbackDeal = await Deal.create({
        vehicle_id: fallbackVehicle.id,
        dealer_id: fallbackDealer.id,
        status: "quote_requested", // Keep it as an "active" status so it shows up in lists
        purchase_type: "cash",
        asking_price: 0,
        negotiation_notes: "This is a virtual deal to catch uncategorized email messages."
      });

      // Step 4: Update user data with onboarding completion and fallback deal ID
      await User.updateMyUserData({
        has_completed_onboarding: true,
        email_identifier: newIdentifier,
        fallback_deal_id: fallbackDeal.id
      });

      toast.success("Welcome aboard! Your personal inbox is ready.");
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast.error('Something went wrong setting up your account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card className="shadow-2xl border-slate-200">
          <CardContent className="p-8 text-center">
            <PartyPopper className="w-16 h-16 text-brand-teal mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {user?.full_name?.split(' ')[0] || 'Haggler'}!
            </h1>
            <p className="text-slate-600 mt-3 max-w-md mx-auto">
              You're all set to start outsmarting dealerships. Here's a quick primer on how HaggleHub works.
            </p>
            
            <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Mail className="w-5 h-5"/>
                    Your Universal Deal Inbox
                </h3>
                <p className="text-sm text-blue-800 mt-2">
                    When you contact dealers, give them a unique HaggleHub email address we generate for you. All their replies will be automatically organized in your Messages tab, so your personal inbox stays clean.
                </p>
            </div>

            <Button
              onClick={handleCompleteOnboarding}
              disabled={isLoading}
              className="mt-8 w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold py-3 text-base"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Let's Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
