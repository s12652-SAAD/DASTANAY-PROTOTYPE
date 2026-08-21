import React, { useState, useEffect } from 'react';
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
  Store,
  Clock,
  Calendar,
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
  } = useDastanay();

  const [showNotifications, setShowNotifications] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const t = dictionary[language];

  const formattedDateStr = liveTime.toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formattedTimeStr = liveTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const roles: { key: Role; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'customer', label: t.role_customer, icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'bg-[#9A2D22]' },
    { key: 'manager', label: t.role_manager, icon: <LayoutDashboard className="w-3.5 h-3.5" />, color: 'bg-amber-600' },
    { key: 'kitchen', label: t.role_kitchen, icon: <ChefHat className="w-3.5 h-3.5" />, color: 'bg-rose-700' },
    { key: 'admin', label: t.role_admin, icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-stone-800 dark:bg-stone-200 dark:text-stone-900' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors shadow-2xs">
      {/* Network Alert if weak/offline */}
      {networkStatus !== 'online' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`px-4 py-1 text-xs text-center font-medium flex items-center justify-center gap-2 ${
            networkStatus === 'weak'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200'
              : 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200'
          }`}
        >
          {networkStatus === 'weak' ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{networkStatus === 'weak' ? t.network_weak : t.network_offline}</span>
          <button
            onClick={() => setNetworkStatus('online')}
            className="underline font-semibold ml-2 hover:opacity-80 cursor-pointer"
          >
            Reconnect
          </button>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          {/* Logo & Brand matching the exact uploaded Dastnay logo */}
          <motion.div
            className="flex items-center cursor-pointer shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sm:hidden">
              <DastnayLogo size="xs" variant="tile" rounded="lg" />
            </div>
            <div className="hidden sm:block">
              <DastnayLogo size="md" />
            </div>
          </motion.div>

          {/* Role Switcher Navigation - Ultra compact on mobile */}
          <div className="flex items-center p-0.5 sm:p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700/80 shrink-0">
            {roles.map((r) => {
              const active = role === r.key;
              return (
                <motion.button
                  key={r.key}
                  id={`role-btn-${r.key}`}
                  onClick={() => setRole(r.key)}
                  whileTap={{ scale: 0.93 }}
                  title={r.label}
                  className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? `${r.color} text-white shadow-xs`
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-700/50'
                  }`}
                >
                  {r.icon}
                  <span className="hidden md:inline">{r.label}</span>
                  <span className="hidden sm:inline md:hidden">{r.label.split(' ')[0]}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right Controls - Sleek & non-wrapping */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Live Real-Time Date & Clock widget */}
            <div className="hidden lg:flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl px-2.5 py-1.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 select-none">
              <Clock className="w-3.5 h-3.5 text-[#9A2D22] dark:text-[#E5A324] animate-pulse" />
              <div className="flex items-center gap-1.5 text-[11px] font-semibold font-mono tracking-tight leading-none">
                <span className="text-stone-500 dark:text-stone-400">{formattedDateStr}</span>
                <span className="text-stone-300 dark:text-stone-600">•</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{formattedTimeStr}</span>
              </div>
            </div>

            {/* Branch Selector for Manager & Kitchen */}
            {(role === 'manager' || role === 'kitchen') && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <Store className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={currentBranchId}
                  onChange={(e) => {
                    setCurrentBranchId(e.target.value);
                    const b = branches.find((br) => br.id === e.target.value);
                    if (b) setCurrentRestaurantId(b.restaurantId);
                  }}
                  className="bg-transparent text-stone-800 dark:text-stone-200 font-medium outline-none cursor-pointer text-xs"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Table Session Active Pill for Customer */}
            {role === 'customer' && currentTableSession && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-800 dark:text-amber-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A324] animate-pulse"></span>
                <span>{currentTableSession.tableNumber}</span>
              </motion.div>
            )}

            {/* Language Toggle */}
            <motion.button
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'ur_roman' : 'en')}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
              title="Toggle Language / Zuban Badlein"
            >
              <Globe className="w-3.5 h-3.5 text-[#9A2D22] dark:text-[#E5A324]" />
              <span>{language === 'en' ? 'EN' : 'اردو'}</span>
            </motion.button>

            {/* Dark / Light Mode Toggle */}
            <motion.button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              whileTap={{ scale: 0.88, rotate: 45 }}
              whileHover={{ scale: 1.08 }}
              className="p-1.5 sm:p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-700" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FEE248]" />}
            </motion.button>

            {/* Network simulator toggle */}
            <motion.button
              id="network-toggle-btn"
              onClick={() => {
                const next = networkStatus === 'online' ? 'weak' : networkStatus === 'weak' ? 'offline' : 'online';
                setNetworkStatus(next);
              }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hidden lg:flex"
              title={`Network simulation: ${networkStatus}`}
            >
              {networkStatus === 'online' ? (
                <Wifi className="w-4 h-4 text-emerald-600" />
              ) : networkStatus === 'weak' ? (
                <Wifi className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-500" />
              )}
            </motion.button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <motion.button
                id="notif-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                whileTap={{ scale: 0.92 }}
                className="relative p-1.5 sm:p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9A2D22] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotifs}
                  </span>
                )}
              </motion.button>

              {/* Notification Drawer with Animation */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-72 sm:w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-4 z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[#9A2D22] dark:text-[#FEE248]">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">Live Alerts</span>
                      </div>
                      <span className="app-pill">{notifications.length} alerts</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 py-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-stone-500 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`py-2.5 px-2 rounded-xl cursor-pointer transition-colors ${
                              n.read ? 'opacity-70' : 'bg-amber-50/40 dark:bg-amber-950/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-stone-400 whitespace-nowrap">{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button for Customer Mode - Icon only on mobile as requested, full label on desktop */}
            {role === 'customer' && onOpenCart && (
              <motion.button
                id="cart-drawer-btn"
                onClick={onOpenCart}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
                title="View My Cart"
                className="relative flex items-center justify-center p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#9A2D22] hover:bg-[#83241A] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 min-w-[34px] sm:min-w-fit"
              >
                <ShoppingBag className="w-4 h-4 text-[#FEE248]" />
                <span className="hidden sm:inline ml-1.5">{t.cart}</span>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 sm:static sm:top-auto sm:right-auto sm:ml-1.5 bg-[#FEE248] text-stone-900 w-4 h-4 sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.2 rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

