import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Restaurant, RestaurantStatus } from '../../types';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  BarChart3,
  DollarSign,
  FileText,
  Search,
  Sparkles,
  Award,
  Power,
  Store,
  Layers,
} from 'lucide-react';
import { DastnayLogo } from '../common/DastnayLogo';

export const AdminPortal: React.FC = () => {
  const {
    restaurants,
    branches,
    orders,
    reservations,
    updateRestaurantStatus,
    registerRestaurant,
    auditLogs,
    language,
  } = useDastanay();
  const t = dictionary[language];

  const [activeTab, setActiveTab] = useState<'restaurants' | 'analytics' | 'commissions' | 'audit'>('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);

  // New Restaurant Form
  const [name, setName] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('Pakistani BBQ, Traditional Karahi');
  const [description, setDescription] = useState('');
  const [ntn, setNtn] = useState('7819203-4');
  const [phone, setPhone] = useState('+92 321 0000000');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80');

  // Platform Metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const platformCommissionEarned = totalGMV * 0.05; // 5% take-rate

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    registerRestaurant({
      name,
      description: description || 'Premier culinary dining brand in Pakistan.',
      cuisineTypes: cuisineTypes.split(',').map((c) => c.trim()),
      logo,
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      ntn,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@dastanay.pk`,
      city: 'Karachi',
    });
    setShowAddRestaurantModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="app-container py-6 space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-stone-950 text-white rounded-3xl p-6 border border-stone-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <DastnayLogo variant="tile" size="lg" rounded="2xl" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-100">
                dastnay Platform Super Admin
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#364FAB]/30 text-[#E8ECFB] border border-[#364FAB]/50">
                HQ Governance
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Nationwide Multi-Tenant Governance • Karachi, Lahore, Islamabad, Rawalpindi
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddRestaurantModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#364FAB] hover:bg-[#2D428F] text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Restaurant Brand</span>
        </button>
      </div>

      {/* KPI Platform Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-[#687078] block">Total Platform GMV</span>
          <span className="font-mono text-2xl font-black text-[#202124] dark:text-stone-100 mt-1 block">
            Rs. {totalGMV.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">Across all merchant orders</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-[#687078] block">Platform Commission (5%)</span>
          <span className="font-mono text-2xl font-black text-[#364FAB] dark:text-[#E8ECFB] mt-1 block">
            Rs. {platformCommissionEarned.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#687078]">Net platform take-rate</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-[#687078] block">Active Brands</span>
          <span className="font-mono text-2xl font-black text-[#202124] dark:text-stone-100 mt-1 block">
            {restaurants.filter((r) => r.status === 'active').length} / {restaurants.length}
          </span>
          <span className="text-[10px] text-[#687078]">Approved enterprises</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-[#687078] block">Total Active Branches</span>
          <span className="font-mono text-2xl font-black text-[#202124] dark:text-stone-100 mt-1 block">
            {branches.length}
          </span>
          <span className="text-[10px] text-[#687078]">Live POS & KDS endpoints</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'restaurants', label: 'Restaurant Directory & Verification', icon: <Building2 className="w-4 h-4" /> },
          { id: 'commissions', label: 'Commission & Payout Engine', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'analytics', label: 'Nationwide Metrics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'audit', label: 'Platform Audit Trail', icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#364FAB] text-white shadow-xs'
                : 'text-[#687078] hover:bg-[#F3F5FD] dark:hover:bg-stone-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. RESTAURANTS DIRECTORY */}
      {activeTab === 'restaurants' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Registered Restaurant Brands
              </h3>
              <p className="text-xs text-zinc-500">
                Approve, reject, or suspend restaurants across Pakistan.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search brand or NTN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {restaurants
              .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || (r.ntn && r.ntn.includes(searchQuery)))
              .map((r) => {
                const restBranches = branches.filter((b) => b.restaurantId === r.id);
                return (
                  <div key={r.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={r.logo}
                        alt={r.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                            {r.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === 'active' || r.isApproved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : r.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {r.status || (r.isApproved ? 'active' : 'pending')}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[11px]">
                          NTN: {r.ntn || '7819203-4'} • {(r.cuisineTypes || r.cuisine || []).join(', ')} • {restBranches.length} Branches
                        </p>
                        <p className="text-zinc-400 text-[10px]">
                          Contact: {r.phone || '+92 300 0000000'} • {r.email || `${r.slug}@dastanay.pk`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status === 'pending' && (
                        <button
                          onClick={() => updateRestaurantStatus(r.id, 'active')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Approve Brand
                        </button>
                      )}

                      {r.status === 'active' ? (
                        <button
                          onClick={() => updateRestaurantStatus(r.id, 'suspended', 'Tax Compliance Audit Pending')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 cursor-pointer"
                        >
                          Suspend Brand
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRestaurantStatus(r.id, 'active')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Re-activate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 2. COMMISSIONS & PAYOUTS */}
      {activeTab === 'commissions' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Platform Take-Rate & Merchant Payout Settlements
            </h3>
            <p className="text-xs text-zinc-500">
              Automated 5% GMV deduction and settlement schedule via 1LINK & State Bank Raast.
            </p>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {restaurants.map((r) => {
              const brandOrders = orders.filter((o) => o.restaurantId === r.id);
              const brandSales = brandOrders.reduce((s, o) => s + o.total, 0);
              const commission = brandSales * 0.05;
              const netPayout = brandSales - commission;

              return (
                <div key={r.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                      {r.name}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Total Sales: Rs. {brandSales.toLocaleString()} • Fee Rate: 5.0%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      Commission: Rs. {commission.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Net Payout: Rs. {netPayout.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. NATIONWIDE METRICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">City-Wise Sales Volume</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Karachi (Do Darya, Clifton, Gulshan):</span>
                <span className="font-mono font-bold">Rs. 820,000 (58%)</span>
              </div>
              <div className="flex justify-between">
                <span>Lahore (Gulberg, MM Alam, DHA):</span>
                <span className="font-mono font-bold">Rs. 430,000 (30%)</span>
              </div>
              <div className="flex justify-between">
                <span>Islamabad / Rawalpindi (F-7, Bahria):</span>
                <span className="font-mono font-bold">Rs. 170,000 (12%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Top Cuisine Demands in PK</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Pakistani BBQ & Charcoal Grills:</span>
                <span className="font-bold text-emerald-600">46% of total volume</span>
              </div>
              <div className="flex justify-between">
                <span>Mutton & Chicken Karahi:</span>
                <span className="font-bold text-emerald-600">32% of total volume</span>
              </div>
              <div className="flex justify-between">
                <span>Gourmet Burgers & Fast Food:</span>
                <span className="font-bold text-emerald-600">14% of total volume</span>
              </div>
              <div className="flex justify-between">
                <span>Specialty Coffee & Desserts:</span>
                <span className="font-bold text-emerald-600">8% of total volume</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              HQ Governance Audit Logs
            </h3>
            <p className="text-xs text-zinc-500">
              Immutable records of brand approvals, suspensions, and commission revisions.
            </p>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                    [{log.action}] {log.userName}
                  </span>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    {log.entity}: {log.newValue}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboard Restaurant Modal */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <h3 className="font-bold text-base">Onboard New Restaurant Enterprise</h3>
            <form onSubmit={handleCreateRestaurant} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Salt'n Pepper Village"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Cuisine Types (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Pakistani BBQ, Traditional Karahi, Desserts"
                  value={cuisineTypes}
                  onChange={(e) => setCuisineTypes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Federal FBR NTN</label>
                  <input
                    type="text"
                    value={ntn}
                    onChange={(e) => setNtn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRestaurantModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Onboard Merchant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
