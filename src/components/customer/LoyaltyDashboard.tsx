import React from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import {
  Sparkles,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { Order } from '../../types';
import { motion } from 'motion/react';
import { DastnayLogo } from '../common/DastnayLogo';

interface LoyaltyDashboardProps {
  onReorder: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ onReorder, onTrackOrder }) => {
  const { loyalty, loyaltyHistory, orders, language } = useDastanay();
  const t = dictionary[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      {/* Customer Profile & Loyalty Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier Card */}
        <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#22336F] via-[#2D428F] to-[#364FAB] text-white p-6 sm:p-7 shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#E8ECFB]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8ECFB]">
                  dastnay Dine Club
                </span>
              </div>
              <h2 className="text-2xl font-extrabold">{loyalty.tier} Member</h2>
            </div>
            <div className="w-11 h-11 shrink-0">
              <DastnayLogo variant="tile" size="sm" rounded="xl" />
            </div>
          </div>

          <div className="pt-6 pb-3">
            <span className="text-xs text-[#E8ECFB]/90 block">Available Points Balance</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-4xl sm:text-5xl font-black text-white">
                {loyalty.pointsBalance.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-[#E8ECFB]">pts</span>
            </div>
            <p className="text-[11px] text-[#E8ECFB]/80 mt-1">
              Worth <span className="font-bold">Rs. {((loyalty.pointsBalance / 100) * 50).toFixed(0)}</span> in checkout discounts (100 pts = Rs. 50 off)
            </p>
          </div>

          <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-[#E8ECFB]/90">
            <span>Total Points Earned: {loyalty.totalEarned}</span>
            <span>Redeemed: {loyalty.totalRedeemed}</span>
          </div>
        </div>

        {/* Customer Account Info */}
        <div className="app-card p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#E8ECFB] dark:bg-[#22336F]/60 text-[#364FAB] dark:text-[#E8ECFB] flex items-center justify-center font-bold text-base">
                HA
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#202124] dark:text-stone-100">Hamza Ali</h3>
                <span className="text-xs text-[#687078]">+92 300 8291029</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#687078]">Account Verification:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OTP Verified
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#687078]">City / Region:</span>
                <span className="font-medium text-[#202124] dark:text-stone-200">Karachi, PK</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F3F5FD] dark:bg-[#22336F]/30 border border-[#E8ECFB] dark:border-[#364FAB]/30 text-[11px] text-[#22336F] dark:text-[#E8ECFB]">
            <span className="font-bold block">Earn 10% back on every order:</span>
            <span>Every Rs. 10 spent awards 1 Dastnay point automatically upon payment.</span>
          </div>
        </div>
      </div>

      {/* Points Activity History & Past Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Past Orders with 1-Click Reorder */}
        <div className="app-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#364FAB] dark:text-[#E8ECFB]" />
              <h3 className="font-bold text-sm text-[#202124] dark:text-stone-100">My Orders History</h3>
            </div>
            <span className="text-xs text-[#687078]">{orders.length} orders</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700 text-xs space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-[#202124] dark:text-stone-100 block">
                      {ord.id}
                    </span>
                    <span className="text-[11px] text-[#687078]">
                      {ord.createdAt} • {ord.tableNumber}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                      ord.status === 'completed' || ord.status === 'served'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 dark:text-stone-400">
                  {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
                  <span className="font-mono font-extrabold text-xs text-[#202124] dark:text-stone-100">
                    Rs. {ord.total.toFixed(0)} ({ord.paymentMethod.toUpperCase()})
                  </span>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onTrackOrder(ord.id)}
                      className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 font-bold cursor-pointer transition-colors"
                    >
                      Track
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onReorder(ord)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#364FAB] hover:bg-[#2D428F] text-white font-bold cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-[#E8ECFB]" />
                      <span>Re-order</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Points Transactions */}
        <div className="app-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#364FAB] dark:text-[#E8ECFB]" />
              <h3 className="font-bold text-sm text-[#202124] dark:text-stone-100">Points Activity Ledger</h3>
            </div>
            <span className="text-xs text-[#687078]">{loyaltyHistory.length} logs</span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {loyaltyHistory.map((lh) => (
              <div key={lh.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#202124] dark:text-stone-100 block">
                    {lh.description}
                  </span>
                  <span className="text-[10px] text-stone-400">{lh.timestamp}</span>
                </div>

                <span
                  className={`font-mono font-extrabold text-sm ${
                    lh.type === 'earn'
                      ? 'text-[#364FAB] dark:text-[#E8ECFB]'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {lh.type === 'earn' ? `+${lh.points} pts` : `-${lh.points} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

