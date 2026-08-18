import React from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import {
  Sparkles,
  Gift,
  History,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Award,
  CreditCard,
  User,
  Calendar,
} from 'lucide-react';
import { Order } from '../../types';

interface LoyaltyDashboardProps {
  onReorder: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ onReorder, onTrackOrder }) => {
  const { loyalty, loyaltyHistory, orders, reservations, language } = useDastanay();
  const t = dictionary[language];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Customer Profile & Loyalty Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier Card */}
        <div className="md:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-zinc-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Dastanay Dine Club
                </span>
              </div>
              <h2 className="text-2xl font-extrabold">{loyalty.tier} Member</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-mono font-extrabold text-xl">
              PK
            </div>
          </div>

          <div className="pt-8 pb-4">
            <span className="text-xs text-amber-200 block">Available Points Balance</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-4xl sm:text-5xl font-black text-white">
                {loyalty.pointsBalance.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-amber-200">pts</span>
            </div>
            <p className="text-[11px] text-amber-100/80 mt-1">
              Worth <span className="font-bold">Rs. {((loyalty.pointsBalance / 100) * 50).toFixed(0)}</span> in checkout discounts (100 pts = Rs. 50 off)
            </p>
          </div>

          <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-amber-100">
            <span>Total Points Earned: {loyalty.totalEarned}</span>
            <span>Redeemed: {loyalty.totalRedeemed}</span>
          </div>
        </div>

        {/* Customer Account Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                HA
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Hamza Ali</h3>
                <span className="text-xs text-zinc-500">+92 300 8291029</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Verification:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OTP Verified
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">City / Region:</span>
                <span className="font-medium">Karachi, PK</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
            <span className="font-bold block">Earn 10% back on every order:</span>
            <span>Every Rs. 10 spent awards 1 Dastanay loyalty point automatically upon payment.</span>
          </div>
        </div>
      </div>

      {/* Points Activity History & Past Orders Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Orders with 1-Click Reorder */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">My Orders History</h3>
            </div>
            <span className="text-xs text-zinc-500">{orders.length} orders</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block">
                      {ord.id}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {ord.createdAt} • {ord.tableNumber}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                      ord.status === 'completed' || ord.status === 'served'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="font-mono font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                    Rs. {ord.total.toFixed(0)} ({ord.paymentMethod.toUpperCase()})
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onTrackOrder(ord.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 font-bold cursor-pointer"
                    >
                      Track
                    </button>
                    <button
                      onClick={() => onReorder(ord)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Re-order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Points Transactions */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Points Activity Ledger</h3>
            </div>
            <span className="text-xs text-zinc-500">{loyaltyHistory.length} logs</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {loyaltyHistory.map((lh) => (
              <div key={lh.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    {lh.description}
                  </span>
                  <span className="text-[10px] text-zinc-400">{lh.timestamp}</span>
                </div>

                <span
                  className={`font-mono font-extrabold text-sm ${
                    lh.type === 'earn'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {lh.type === 'earn' ? `+${lh.points} pts` : `-${lh.points} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
