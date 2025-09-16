
import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Deal } from '@/api/entities';
import { Message } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const [deals, messages, dealers] = await Promise.all([
          Deal.list('-created_date'),
          Message.list('-created_date'),
          Dealer.list()
        ]);

        const notifications = [];

        // Unread messages
        const unreadMessages = messages.filter(m => !m.is_read);
        if (unreadMessages.length > 0) {
          const dealerNames = unreadMessages.reduce((acc, msg) => {
            const dealer = dealers.find(d => d.id === msg.dealer_id);
            if (dealer && !acc.includes(dealer.name)) {
              acc.push(dealer.name);
            }
            return acc;
          }, []);

          notifications.push({
            id: 'unread_messages',
            type: 'message',
            title: `${unreadMessages.length} New Message${unreadMessages.length > 1 ? 's' : ''}`,
            description: `From: ${dealerNames.slice(0, 2).join(', ')}${dealerNames.length > 2 ? ` +${dealerNames.length - 2} more` : ''}`,
            icon: MessageCircle,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            action: () => setIsOpen(false),
            link: createPageUrl('Messages')
          });
        }

        // Expiring quotes (within 3 days)
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        
        const expiringDeals = deals.filter(deal => {
          if (!deal.quote_expires) return false;
          const expiryDate = new Date(deal.quote_expires);
          return expiryDate <= threeDaysFromNow && expiryDate > now;
        });

        expiringDeals.forEach(deal => {
          const daysUntilExpiry = Math.ceil((new Date(deal.quote_expires) - now) / (1000 * 60 * 60 * 24));
          notifications.push({
            id: `expiring_${deal.id}`,
            type: 'expiring',
            title: 'Quote Expiring Soon',
            description: `${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''} remaining`,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            action: () => setIsOpen(false),
            link: createPageUrl(`DealDetails?deal_id=${deal.id}`)
          });
        });

        // Follow-up reminders (no contact in 5+ days for active deals)
        const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
        const activeDeals = deals.filter(d => ['quote_requested', 'negotiating', 'final_offer'].includes(d.status));
        
        const staleDealIds = activeDeals
          .filter(deal => {
            const lastMessage = messages
              .filter(m => m.dealer_id === deal.dealer_id)
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
            
            if (!lastMessage) return new Date(deal.created_date) < fiveDaysAgo;
            return new Date(lastMessage.created_date) < fiveDaysAgo;
          })
          .slice(0, 3); // Limit to 3 to avoid overwhelming

        staleDealIds.forEach(deal => {
          notifications.push({
            id: `followup_${deal.id}`,
            type: 'followup',
            title: 'Follow-up Needed',
            description: 'No recent activity on this deal',
            icon: AlertTriangle,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            action: () => setIsOpen(false),
            link: createPageUrl(`Messages?dealer_id=${deal.dealer_id}`)
          });
        });

        setNotifications(notifications.slice(0, 10)); // Limit total notifications
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Don't set notifications to empty array on error, keep existing ones
      }
    }

    fetchNotifications();
    // Reduced frequency: Refresh every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const NotificationList = () => (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">All caught up! No new notifications.</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Link 
              to={notification.link}
              onClick={notification.action}
              className="block p-3 rounded-lg border border-slate-200 hover:border-brand-lime hover:bg-slate-50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                  <notification.icon className={`w-4 h-4 ${notification.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 group-hover:text-brand-teal">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {notification.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))
      )}
    </div>
  );

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <motion.div whileTap={{ scale: 0.95 }} className="relative">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-brand-lime text-brand-teal border-white text-xs font-bold">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader className="pb-4">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              Stay updated on your deals and messages
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <NotificationList />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Popover (dropdown)
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div whileTap={{ scale: 0.95 }} className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-slate-600" />
            {notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-brand-lime text-brand-teal border-white text-xs font-bold">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Notifications
              <Button
                variant="ghost" 
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <NotificationList />
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
