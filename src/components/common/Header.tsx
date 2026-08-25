import React, { useState, useEffect, useRef } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import {
  UtensilsCrossed,
  ChefHat,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  ShoppingBag,
  Bell,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  Award,
  X,
  Search,
  Check,
} from 'lucide-react';
import { Role } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { DastnayLogo } from './DastnayLogo';

interface HeaderProps {
  onOpenCart?: () => void;
  onOpenQRScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    theme,
    setTheme,
    networkStatus,
    setNetworkStatus,
    branches,
    currentRestaurantId,
    setCurrentRestaurantId,
    currentBranchId,
    setCurrentBranchId,
    cart,
    notifications,
    markNotificationRead,
    currentTableSession,
    loyalty,
  } = useDastanay();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [areaSearch, setAreaSearch] = useState<string>('');

  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = dictionary[language];
  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  const roles: { key: Role; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'customer', label: t.role_customer, icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'bg-[#9A2D22]' },
    { key: 'kitchen', label: t.role_kitchen, icon: <ChefHat className="w-3.5 h-3.5" />, color: 'bg-stone-800' },
    { key: 'manager', label: t.role_manager, icon: <LayoutDashboard className="w-3.5 h-3.5" />, color: 'bg-amber-700' },
    { key: 'admin', label: t.role_admin, icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-stone-900 dark:bg-stone-100 dark:text-stone-900' },
  ];

  const cities = ['All', 'Karachi', 'Lahore', 'Islamabad'];

  const filteredBranches = branches.filter((b) => {
    const matchesCity = cityFilter === 'All' || b.city === cityFilter;
    const matchesSearch =
      b.name.toLowerCase().includes(areaSearch.toLowerCase()) ||
      b.area.toLowerCase().includes(areaSearch.toLowerCase()) ||
      b.address.toLowerCase().includes(areaSearch.toLowerCase()) ||
      b.city.toLowerCase().includes(areaSearch.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#18181B] border-b border-stone-200 dark:border-stone-800 transition-colors shadow-2xs">
      {/* Network Alert if weak/offline */}
      {networkStatus !== 'online' && (
        <div
          className={`px-4 py-1.5 text-xs text-center font-semibold flex items-center justify-center gap-2 ${
            networkStatus === 'weak'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200'
          }`}
        >
          {networkStatus === 'weak' ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{networkStatus === 'weak' ? t.network_weak : t.network_offline}</span>
          <button
            onClick={() => setNetworkStatus('online')}
            className="underline font-bold ml-2 hover:opacity-80 cursor-pointer"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Main Commercial Top Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo & Commercial Location Selector */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center cursor-pointer shrink-0">
              <div className="sm:hidden">
                <DastnayLogo size="xs" variant="tile" rounded="md" />
              </div>
              <div className="hidden sm:block">
                <DastnayLogo size="md" />
              </div>
            </div>

            {/* Location Selector Button */}
            <button
              id="location-picker-btn"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 text-left transition-colors cursor-pointer max-w-[130px] sm:max-w-[220px]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#9A2D22] shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium block leading-none truncate">
                  {currentBranch.city}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-stone-900 dark:text-stone-100 truncate block mt-0.5">
                  {currentBranch.area}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>
          </div>

          {/* Center / Right: Segmented Role Navigation & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Role Switcher */}
            <div className="flex items-center p-0.5 sm:p-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shrink-0">
              {roles.map((r) => {
                const active = role === r.key;
                return (
                  <button
                    key={r.key}
                    id={`role-btn-${r.key}`}
                    onClick={() => setRole(r.key)}
                    className={`relative flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? `${r.color} text-white shadow-2xs`
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    {r.icon}
                    <span className="hidden md:inline">{r.label}</span>
                    <span className="hidden sm:inline md:hidden">{r.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* DineClub Points (Customer Mode) */}
            {role === 'customer' && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-900 dark:text-[#FEE248]">
                <Award className="w-3.5 h-3.5 text-[#9A2D22] dark:text-[#FEE248]" />
                <span>{loyalty.pointsBalance} pts</span>
              </div>
            )}

            {/* Language & Theme Controls */}
            <div className="flex items-center gap-1">
              <button
                id="lang-toggle-btn"
                onClick={() => setLanguage(language === 'en' ? 'ur_roman' : 'en')}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#9A2D22]" />
                <span>{language === 'en' ? 'EN' : 'اردو'}</span>
              </button>

              <button
                id="theme-toggle-btn"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-stone-700" /> : <Sun className="w-3.5 h-3.5 text-[#FEE248]" />}
              </button>
            </div>

            {/* Live Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                id="notif-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9A2D22] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#18181B] rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 p-3 z-50"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">Live Kitchen Alerts</span>
                      <span className="text-[10px] text-stone-500">{notifications.length} total</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 py-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-stone-500 text-center py-4">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`py-2 px-1.5 rounded-lg cursor-pointer transition-colors ${
                              n.read ? 'opacity-70' : 'bg-amber-50/50 dark:bg-amber-950/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                {n.title}
                              </span>
                              <span className="text-[9px] text-stone-400">{n.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Commercial Cart Button (Customer Mode) */}
            {role === 'customer' && onOpenCart && (
              <button
                id="cart-drawer-btn"
                onClick={onOpenCart}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#9A2D22] hover:bg-[#83241A] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-[#FEE248]" />
                <span className="hidden sm:inline">{t.cart}</span>
                {cartCount > 0 && (
                  <span className="bg-[#FEE248] text-stone-900 px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ml-0.5">
                    {cartCount}
                  </span>
                )}
                {cartTotal > 0 && (
                  <span className="hidden md:inline font-mono font-normal ml-1 border-l border-white/20 pl-1.5 text-[11px] text-amber-100">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#9A2D22]" />
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      Select Pakistani Dining Branch
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      Choose your area to view live tables, local delivery & branch menus
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* City Tabs & Search */}
              <div className="p-3 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-800 space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setCityFilter(city)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        cityFilter === city
                          ? 'bg-[#9A2D22] text-white shadow-2xs'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by area (e.g. DHA, Gulberg, F-7, Clifton)..."
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
                  />
                </div>
              </div>

              {/* Branch Selection List */}
              <div className="p-3 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 space-y-1">
                {filteredBranches.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    No branches found for "{areaSearch}".
                  </div>
                ) : (
                  filteredBranches.map((b) => {
                    const isSelected = b.id === currentBranchId;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setCurrentBranchId(b.id);
                          setCurrentRestaurantId(b.restaurantId);
                          setShowLocationModal(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border border-[#9A2D22]/40 text-[#9A2D22] dark:text-[#FEE248]'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                              {b.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                b.isOpen
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              {b.isOpen ? 'Open Now' : 'Closed'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">{b.address}</p>
                          <p className="text-[10px] text-stone-400 font-mono">🕒 {b.openingHours}</p>
                        </div>

                        <div className="text-right shrink-0 ml-3 flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {b.city}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#9A2D22] dark:text-[#FEE248]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
