import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Restaurant, Branch } from '../../types';
import { Search, MapPin, Star, Users, ArrowRight, Flame, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

interface RestaurantDiscoveryProps {
  onSelectRestaurant: (restaurant: Restaurant, branch: Branch) => void;
}

export const RestaurantDiscovery: React.FC<RestaurantDiscoveryProps> = ({ onSelectRestaurant }) => {
  const { restaurants, branches, tables, language } = useDastanay();
  const t = dictionary[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');

  const cities = ['All', 'Karachi', 'Lahore', 'Islamabad'];
  const cuisines = ['All', 'Pakistani BBQ', 'Karahi & Handi', 'Gourmet Burgers', 'Café'];

  const filteredRestaurants = restaurants.filter((rest) => {
    if (!rest.isApproved || rest.isSuspended) return false;

    // Search query matching
    const matchesSearch =
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    // Cuisine filter
    const matchesCuisine =
      selectedCuisine === 'All' || rest.cuisine.includes(selectedCuisine);

    // City filter (via branches)
    const restBranches = branches.filter((b) => b.restaurantId === rest.id);
    const matchesCity =
      selectedCity === 'All' || restBranches.some((b) => b.city === selectedCity);

    return matchesSearch && matchesCuisine && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* Hero & Quick Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Search & Dining Hub Card (Col span 2) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 app-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white via-stone-50 to-emerald-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/20"
        >
          <div className="space-y-2.5 z-10">
            <div className="flex items-center gap-2">
              <span className="app-pill bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <Flame className="w-3 h-3 text-amber-500" />
                Live Table Engine
              </span>
              <span className="app-pill bg-emerald-100/60 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300">
                Direct Kitchen Dispatch
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-50">
              {language === 'en' ? 'Reserve a Table. Order Live. Dine.' : 'Table Book Karein. Live Order Dein.'}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl">
              {language === 'en'
                ? 'Contactless table pre-booking, live cooking status updates, and digital payment settlements across Pakistan.'
                : 'Karachi, Lahore aur Islamabad me be-shumar mashhoor khano ke liye fori table booking aur order service.'}
            </p>
          </div>

          {/* Search Input */}
          <div className="pt-4 z-10">
            <div className="relative flex items-center bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs focus-within:border-emerald-600">
              <Search className="w-4 h-4 text-stone-400 ml-3.5 shrink-0" />
              <input
                type="text"
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 bg-transparent outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 text-xs text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <div className="mr-2 px-2.5 py-1 bg-stone-100 dark:bg-stone-700 rounded-lg text-[10px] font-bold text-stone-500 dark:text-stone-300">
                  Search
                </div>
              )}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
            <Utensils className="w-44 h-44 text-emerald-700" />
          </div>
        </motion.div>

        {/* Key Insights Card (Col span 1) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="app-card p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">Top Rated Picks</h2>
              <p className="text-[11px] text-stone-500">Curated Pakistani Flavors</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 my-3">
            <span className="app-pill">Shinwari Handi</span>
            <span className="app-pill">Charcoal Malai Boti</span>
            <span className="app-pill">Roghandi Naan</span>
            <span className="app-pill">Kashmiri Chai</span>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-2.5">
            <span>Verified Customer Reviews</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">4.8+ Avg</span>
          </div>
        </motion.div>

        {/* Promotion Card (Col span 1) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-700 rounded-2xl shadow-sm p-5 flex flex-col justify-between text-white"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-300" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
              Loyalty 2x
            </span>
          </div>

          <div className="my-2.5 space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base">Earn Dine Points</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Order via table QR and get 1 pt per Rs. 10 spent. Instant discount on checkout.
            </p>
          </div>

          <div className="w-full bg-white/10 rounded-xl p-2 flex items-center justify-between text-xs font-semibold">
            <span>Redemption Value:</span>
            <span className="font-bold text-amber-300">100 pts = Rs. 50</span>
          </div>
        </motion.div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* City Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> City:
          </span>
          {cities.map((city) => (
            <motion.button
              key={city}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {city}
            </motion.button>
          ))}
        </div>

        {/* Cuisine Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {cuisines.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCuisine === c
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Restaurant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRestaurants.map((rest, index) => {
          const restBranches = branches.filter((b) => b.restaurantId === rest.id);
          const defaultBranch = restBranches[0] || branches[0];
          const branchTables = tables;
          const availableCount = branchTables.filter((t) => t.status === 'available').length;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              key={rest.id}
              className="app-card overflow-hidden flex flex-col group hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all"
            >
              {/* Cover Image & Rating Badge */}
              <div className="relative h-44 overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src={rest.coverImage}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-stone-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rest.rating}</span>
                  <span className="text-stone-400 font-normal">({rest.reviewCount})</span>
                </div>

                {/* Open/Closed Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-xs ${
                      defaultBranch.isOpen
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-rose-600/90 text-white'
                    }`}
                  >
                    {defaultBranch.isOpen ? t.status_open : t.status_closed}
                  </span>
                </div>

                {/* Bottom title inside cover */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-extrabold text-white tracking-tight">{rest.name}</h3>
                  <p className="text-xs text-stone-200 line-clamp-1">{rest.tagline}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Cuisines & Price */}
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {rest.cuisine.join(' • ')}
                    </span>
                    <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                      {rest.priceRange}
                    </span>
                  </div>

                  {/* Branch selector & Location */}
                  <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{defaultBranch.name}</span>
                      <p className="text-[11px] text-stone-500">{defaultBranch.area}, {defaultBranch.city}</p>
                    </div>
                  </div>

                  {/* Table Availability Alert */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-stone-500" />
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {language === 'en' ? 'Live Table Status:' : 'Khali Tables:'}
                      </span>
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                        availableCount > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {availableCount > 0 ? `${availableCount} Tables Free` : 'Fully Booked'}
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectRestaurant(rest, defaultBranch)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white dark:text-stone-900 hover:text-white dark:hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer group-hover:bg-emerald-700 group-hover:text-white"
                >
                  <span>{language === 'en' ? 'View Menu & Reserve' : 'Menu Dekhein aur Table Book Karein'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
