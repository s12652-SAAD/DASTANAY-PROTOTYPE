import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Restaurant, Branch, Order } from '../../types';
import { RestaurantDiscovery } from './RestaurantDiscovery';
import { TableReservationView } from './TableReservationView';
import { LiveMenuView } from './LiveMenuView';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { OrderTrackerView } from './OrderTrackerView';
import { LoyaltyDashboard } from './LoyaltyDashboard';
import { ReviewModal } from './ReviewModal';
import { QRScannerModal } from '../common/QRScannerModal';
import { DastnayLogo } from '../common/DastnayLogo';
import {
  Compass,
  CalendarDays,
  MenuSquare,
  Clock,
  Award,
  QrCode,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerAppProps {
  onOpenCart: () => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
  isQRScannerOpen: boolean;
  onCloseQRScanner: () => void;
  onOpenQRScanner: () => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  onOpenCart,
  isCartOpen,
  onCloseCart,
  isQRScannerOpen,
  onCloseQRScanner,
  onOpenQRScanner,
}) => {
  const {
    restaurants,
    branches,
    currentRestaurantId,
    setCurrentRestaurantId,
    currentBranchId,
    setCurrentBranchId,
    currentTableSession,
    endTableSession,
    addToCart,
    language,
    orders,
  } = useDastanay();
  const t = dictionary[language];

  const [activeTab, setActiveTab] = useState<'explore' | 'menu' | 'reserve' | 'track' | 'loyalty'>('explore');
  const [selectedReviewOrderId, setSelectedReviewOrderId] = useState<string | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | undefined>(undefined);

  const currentRestaurant =
    restaurants.find((r) => r.id === currentRestaurantId) || restaurants[0];
  const currentBranch =
    branches.find((b) => b.id === currentBranchId) || branches[0];

  const handleSelectRestaurant = (restaurant: Restaurant, branch: Branch) => {
    setCurrentRestaurantId(restaurant.id);
    setCurrentBranchId(branch.id);
    setActiveTab('menu');
  };

  const handleReservationComplete = () => {
    setActiveTab('menu');
  };

  const handleOrderPlaced = (order: Order) => {
    setTrackedOrderId(order.id);
    setActiveTab('track');
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.menuItemId,
        name: item.name,
        basePrice: item.unitPrice,
        selectedAddons: [],
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        itemTotal: item.totalPrice,
      });
    });
    onOpenCart();
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'refunded'
  ).length;

  const tabs: { id: 'explore' | 'menu' | 'reserve' | 'track' | 'loyalty'; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    { id: 'explore', label: t.explore_restaurants, mobileLabel: 'Explore', icon: <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'menu', label: t.menu, mobileLabel: 'Menu', icon: <MenuSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'reserve', label: t.book_table, mobileLabel: 'Reserve', icon: <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'track', label: t.order_status, mobileLabel: 'Track', icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'loyalty', label: t.loyalty_points, mobileLabel: 'Dine Club', icon: <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  ];

  return (
    <div className="app-container py-1 sm:py-2 space-y-3.5 sm:space-y-5">
      {/* Top Context Bar - Compact & Responsive */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-stone-200 dark:border-stone-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Selected Restaurant & Branch info */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentRestaurant.logo}
            alt={currentRestaurant.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate">
                {currentRestaurant.name}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-semibold shrink-0">
                {currentBranch.city}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium truncate">
              {currentBranch.name} • {currentBranch.area}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {currentTableSession ? (
            <div className="flex items-center gap-2 bg-[#F3F5FD] dark:bg-[#22336F]/40 px-3 py-1.5 rounded-lg border border-[#E8ECFB] dark:border-[#364FAB]/40">
              <span className="w-2 h-2 rounded-full bg-[#364FAB] animate-pulse"></span>
              <span className="text-xs font-bold text-[#22336F] dark:text-[#E8ECFB]">
                {currentTableSession.tableNumber}
              </span>
              <button
                onClick={() => endTableSession(currentTableSession.tableId)}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer ml-1"
                title="End Table Session"
              >
                <LogOut className="w-3 h-3" />
                <span>End</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenQRScanner}
              title="Scan Table QR"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#E8ECFB] dark:hover:bg-[#22336F]/40 text-[#202124] dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#364FAB]" />
              <span>{t.scan_qr}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('reserve')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'reserve'
                ? 'bg-[#364FAB] text-white'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-[#E8ECFB] dark:hover:bg-[#22336F]/40 text-[#202124] dark:text-stone-200 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <CalendarDays className={`w-3.5 h-3.5 ${activeTab === 'reserve' ? 'text-white' : 'text-[#364FAB]'}`} />
            <span>{t.book_table}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/90 rounded-lg border border-stone-200 dark:border-stone-700 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                active
                  ? 'bg-white dark:bg-[#22336F] text-[#364FAB] dark:text-[#E8ECFB] shadow-2xs'
                  : 'text-[#687078] dark:text-stone-400 hover:text-[#202124] dark:hover:text-stone-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.mobileLabel}</span>
              {tab.id === 'track' && activeOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#364FAB] animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content with Animated Entry */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'explore' && (
            <RestaurantDiscovery onSelectRestaurant={handleSelectRestaurant} />
          )}

          {activeTab === 'menu' && (
            <LiveMenuView onOpenCart={onOpenCart} />
          )}

          {activeTab === 'reserve' && (
            <TableReservationView
              restaurant={currentRestaurant}
              branch={currentBranch}
              onBack={() => setActiveTab('explore')}
              onReservationComplete={handleReservationComplete}
            />
          )}

          {activeTab === 'track' && (
            <OrderTrackerView
              orderId={trackedOrderId}
              onOpenReviewModal={(id) => setSelectedReviewOrderId(id)}
            />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltyDashboard
              onReorder={handleReorder}
              onTrackOrder={(id) => {
                setTrackedOrderId(id);
                setActiveTab('track');
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={onCloseCart}
        onOrderPlaced={handleOrderPlaced}
        onOpenQRScanner={onOpenQRScanner}
      />

      {/* Review Modal */}
      <ReviewModal
        orderId={selectedReviewOrderId}
        onClose={() => setSelectedReviewOrderId(null)}
      />

      {/* QR Scanner */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={onCloseQRScanner}
        onSessionStarted={() => setActiveTab('menu')}
      />
    </div>
  );
};
