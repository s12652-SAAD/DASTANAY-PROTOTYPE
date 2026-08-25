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
import { DastnayLogo, DASTNAY_LOGO_URL } from './DastnayLogo';

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

  // Close notifications on click outside & Keyboard shortcut for Location Modal (Alt+L, Ctrl+L, or L key)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      // Alt+L, Ctrl+L, or Meta+L (or simple 'L' when not typing)
      if (
        (e.altKey && (e.key === 'l' || e.key === 'L')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L' || e.key === 'k' || e.key === 'K')) ||
        (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'l' || e.key === 'L'))
      ) {
        e.preventDefault();
        setShowLocationModal((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setShowLocationModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const t = dictionary[language];
  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  const roles: { key: Role; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'customer', label: t.role_customer, icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'bg-[#364FAB]' },
    { key: 'kitchen', label: t.role_kitchen, icon: <ChefHat className="w-3.5 h-3.5" />, color: 'bg-[#22336F]' },
    { key: 'manager', label: t.role_manager, icon: <LayoutDashboard className="w-3.5 h-3.5" />, color: 'bg-[#2D428F]' },
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
      <div className="app-container">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo & Commercial Location Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="flex items-center cursor-pointer shrink-0">
              <div className="sm:hidden">
                <DastnayLogo size="xs" variant="tile" rounded="lg" />
              </div>
              <div className="hidden sm:block">
                <DastnayLogo size="md" />
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-stone-200 dark:bg-stone-700 shrink-0" />

            {/* Location Selector Button with Shortcut */}
            <button
              id="location-picker-btn"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/90 hover:bg-stone-200 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 text-left transition-all cursor-pointer shrink-0 shadow-2xs group select-none"
              title="Change Branch Location (Shortcut: Alt+L or Press L)"
            >
              <div className="w-6 h-6 rounded-lg bg-[#364FAB]/10 dark:bg-[#364FAB]/30 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#364FAB] dark:text-[#E8ECFB]" />
              </div>

              {/* Branch Text Details */}
              <div className="flex flex-col justify-center min-w-0 text-left">
                <span className="text-[9px] sm:text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider leading-none truncate">
                  {currentBranch.city}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-stone-900 dark:text-stone-100 truncate block leading-tight mt-0.5 max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] md:max-w-[190px]">
                  {currentBranch.area || currentBranch.name}
                </span>
              </div>

              {/* Shortcut Badge */}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-stone-200/90 dark:bg-stone-700/90 text-stone-600 dark:text-stone-300 border border-stone-300/80 dark:border-stone-600/80 shadow-2xs">
                Alt+L
              </kbd>

              <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0 transition-transform group-hover:translate-y-0.5" />
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
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F3F5FD] dark:bg-[#22336F]/40 border border-[#E8ECFB] dark:border-[#364FAB]/30 text-xs font-bold text-[#22336F] dark:text-[#E8ECFB]">
                <Award className="w-3.5 h-3.5 text-[#364FAB] dark:text-[#E8ECFB]" />
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
                <Globe className="w-3.5 h-3.5 text-[#364FAB]" />
                <span>{language === 'en' ? 'EN' : 'اردو'}</span>
              </button>

              <button
                id="theme-toggle-btn"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-stone-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
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
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#364FAB] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
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
                              n.read ? 'opacity-70' : 'bg-[#F3F5FD] dark:bg-[#22336F]/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-[#202124] dark:text-[#F7F8FA]">
                                {n.title}
                              </span>
                              <span className="text-[9px] text-[#687078]">{n.timestamp}</span>
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
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#364FAB] hover:bg-[#2D428F] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">{t.cart}</span>
                {cartCount > 0 && (
                  <span className="bg-[#E8ECFB] text-[#22336F] px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ml-0.5">
                    {cartCount}
                  </span>
                )}
                {cartTotal > 0 && (
                  <span className="hidden md:inline font-mono font-normal ml-1 border-l border-white/20 pl-1.5 text-[11px] text-white/90">
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
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#364FAB]/10 dark:bg-[#364FAB]/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#364FAB] dark:text-[#E8ECFB]" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span>Select Dining Branch</span>
                      <kbd className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
                        Alt+L
                      </kbd>
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      Choose branch to view live tables, local delivery & branch menus
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
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
                          ? 'bg-[#364FAB] text-white shadow-2xs'
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
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB]"
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
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer gap-3 ${
                          isSelected
                            ? 'bg-[#F3F5FD] dark:bg-[#22336F]/40 border border-[#364FAB]/40 text-[#364FAB] dark:text-[#E8ECFB]'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#364FAB] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}`}>
                            <MapPin className="w-4 h-4" />
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                                {b.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                  b.isOpen
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                }`}
                              >
                                {b.isOpen ? 'Open Now' : 'Closed'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">{b.address}</p>
                            <p className="text-[10px] text-stone-400 font-mono">🕒 {b.openingHours}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2 flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {b.city}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#364FAB] dark:text-[#E8ECFB]" />}
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
