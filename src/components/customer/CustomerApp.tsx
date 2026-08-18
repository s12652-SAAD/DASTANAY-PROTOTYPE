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

  const tabs: { id: 'explore' | 'menu' | 'reserve' | 'track' | 'loyalty'; label: string; icon: React.ReactNode }[] = [
    { id: 'explore', label: t.explore_restaurants, icon: <Compass className="w-4 h-4" /> },
    { id: 'menu', label: t.menu, icon: <MenuSquare className="w-4 h-4" /> },
    { id: 'reserve', label: t.book_table, icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'track', label: t.order_status, icon: <Clock className="w-4 h-4" /> },
    { id: 'loyalty', label: t.loyalty_points, icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-5">
      {/* Top Context Bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
      >
        {/* Selected Restaurant & Branch info */}
        <div className="flex items-center gap-3.5">
          <img
            src={currentRestaurant.logo}
            alt={currentRestaurant.name}
            className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                {currentRestaurant.name}
              </span>
              <span className="app-pill">{currentBranch.city}</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
              {currentBranch.name} • {currentBranch.area}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          {currentTableSession ? (
            <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {currentTableSession.tableNumber}
              </span>
              <button
                onClick={() => endTableSession(currentTableSession.tableId)}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer ml-1"
                title="End Table Session"
              >
                <LogOut className="w-3 h-3" /> End Session
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={onOpenQRScanner}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.scan_qr}</span>
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('reserve')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reserve'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.book_table}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/90 rounded-xl border border-stone-200 dark:border-stone-700/80 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all relative cursor-pointer ${
                active
                  ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'track' && activeOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </motion.button>
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
