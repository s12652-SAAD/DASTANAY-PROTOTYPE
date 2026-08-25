import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Restaurant, Branch, MenuItem } from '../../types';
import {
  Search,
  MapPin,
  Star,
  Users,
  ArrowRight,
  Flame,
  Clock,
  Tag,
  Plus,
  Check,
  Percent,
  Sparkles,
  ShieldCheck,
  Utensils,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DastnayLogo } from '../common/DastnayLogo';

interface RestaurantDiscoveryProps {
  onSelectRestaurant: (restaurant: Restaurant, branch: Branch) => void;
  onQuickAddItem?: (item: MenuItem) => void;
}

export const RestaurantDiscovery: React.FC<RestaurantDiscoveryProps> = ({
  onSelectRestaurant,
  onQuickAddItem,
}) => {
  const {
    restaurants,
    branches,
    tables,
    menuItems,
    promotions,
    language,
    currentBranchId,
    addToCart,
    cart,
  } = useDastanay();
  const t = dictionary[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedPromo, setCopiedPromo] = useState<string | null>(null);

  // Pakistani Food Categories with realistic visual icons
  const foodCategories = [
    { id: 'All', label: 'All Cuisines', labelUrdu: 'تمام کھانے', icon: '🍽️' },
    { id: 'Pakistani BBQ & Grills', label: 'BBQ & Grills', labelUrdu: 'باربی کیو', icon: '🍢' },
    { id: 'Karahi & Handi', label: 'Karahi & Handi', labelUrdu: 'کڑاہی و ہانڈی', icon: '🥘' },
    { id: 'Biryani & Rice', label: 'Biryani & Rice', labelUrdu: 'بریانی و چاول', icon: '🍚' },
    { id: 'Gourmet Burgers', label: 'Fast Food & Burgers', labelUrdu: 'برگرز و فاسٹ فوڈ', icon: '🍔' },
    { id: 'Appetizers & Fries', label: 'Appetizers & Fries', labelUrdu: 'فرائز و اسنیکس', icon: '🍟' },
    { id: 'Tandoor & Breads', label: 'Naan & Tandoor', labelUrdu: 'نان و روٹی', icon: '🫓' },
    { id: 'Desserts & Sweets', label: 'Mithai & Desserts', labelUrdu: 'میٹھے و ڈیزرٹس', icon: '🍨' },
    { id: 'Beverages & Chai', label: 'Karak Chai & Drinks', labelUrdu: 'کڑک چائے و شربت', icon: '☕' },
  ];

  const cities = ['All', 'Karachi', 'Lahore', 'Islamabad'];

  const filteredRestaurants = restaurants.filter((rest) => {
    if (!rest.isApproved || rest.isSuspended) return false;

    const matchesSearch =
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      rest.cuisine.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      menuItems.some(
        (m) => m.restaurantId === rest.id && m.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    const restBranches = branches.filter((b) => b.restaurantId === rest.id);
    const matchesCity =
      selectedCity === 'All' || restBranches.some((b) => b.city === selectedCity);

    return matchesSearch && matchesCategory && matchesCity;
  });

  // Top popular dishes across the platform for quick ordering
  const popularDishes = menuItems.filter((m) => m.isPopular).slice(0, 6);

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedPromo(code);
    setTimeout(() => setCopiedPromo(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Commercial Top Search & Quick Action Bar */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A2D22] dark:text-[#E5A324] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                Pakistan's Culinary Network
              </span>
              <span className="text-xs text-stone-500">• 100% Halal Verified</span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {language === 'en' ? 'What are you craving today?' : 'آج آپ کا کیا کھانے کا موڈ ہے؟'}
            </h1>
          </div>

          {/* Search Input Box */}
          <div className="w-full md:w-96">
            <div className="relative flex items-center bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 focus-within:border-[#9A2D22] dark:focus-within:border-[#E5A324] transition-colors">
              <Search className="w-4 h-4 text-stone-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800/80 mt-3 text-xs overflow-x-auto no-scrollbar">
          <span className="text-stone-600 dark:text-stone-400 font-semibold text-[11px] shrink-0">
            Popular:
          </span>
          {['Dum Biryani', 'Mutton Karahi', 'Reshmi Kabab', 'Zinger Burger', 'Malai Boti', 'Karak Chai'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* 2. Pakistani Food Categories Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Explore by Category</span>
            <span className="text-xs font-normal text-stone-600 dark:text-stone-400 font-urdu">
              (کھانوں کی اقسام)
            </span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">Select a category to filter</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-2.5">
          {foodCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-2.5 sm:p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#9A2D22] text-white border-[#9A2D22] shadow-xs'
                    : 'bg-white dark:bg-[#18181B] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1">{cat.icon}</span>
                <span className="text-[11px] font-bold leading-tight block truncate w-full">
                  {cat.label}
                </span>
                <span
                  className={`text-[9px] block mt-0.5 truncate w-full ${
                    isSelected ? 'text-amber-200' : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {cat.labelUrdu}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Promotional Vouchers & Deals Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#9A2D22]" />
            <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              Active Vouchers & Deals
            </h2>
          </div>
          <span className="text-xs text-[#9A2D22] dark:text-[#E5A324] font-bold">
            Instant Checkout Discount
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-dashed border-amber-400 dark:border-amber-600 flex flex-col justify-between space-y-2.5 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[#9A2D22] dark:text-[#FEE248] text-[10px] font-extrabold uppercase">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `Rs. ${promo.discountValue} FLAT`}
                  </span>
                  <span className="text-[10px] text-stone-600 dark:text-stone-400">
                    Min Rs. {promo.minOrderValue}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-stone-900 dark:text-stone-100 leading-snug">
                  {promo.title}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1">{promo.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="font-mono font-bold text-xs text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
                  {promo.code}
                </div>
                <button
                  onClick={() => handleCopyPromo(promo.code)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#9A2D22] dark:text-[#FEE248] hover:underline cursor-pointer"
                >
                  {copiedPromo === promo.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filter by City & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#9A2D22]" /> City:
          </span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                selectedCity === city
                  ? 'bg-[#9A2D22] text-white'
                  : 'bg-white dark:bg-[#18181B] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500">
          Showing <span className="font-bold text-stone-900 dark:text-stone-100">{filteredRestaurants.length}</span> restaurant brands
        </div>
      </div>

      {/* 5. Main Commercial Restaurant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRestaurants.map((rest) => {
          const restBranches = branches.filter((b) => b.restaurantId === rest.id);
          const defaultBranch =
            restBranches.find((b) => b.id === currentBranchId) || restBranches[0] || branches[0];
          const availableCount = tables.filter((t) => t.status === 'available').length;

          return (
            <div
              key={rest.id}
              className="food-card overflow-hidden flex flex-col group hover:border-[#9A2D22]/60 dark:hover:border-[#E5A324]/60"
            >
              {/* Cover Photo */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src={rest.coverImage}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-stone-900/95 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-2xs text-stone-900 dark:text-stone-100">
                  <Star className="w-3.5 h-3.5 fill-[#E5A324] text-[#E5A324]" />
                  <span>{rest.rating}</span>
                  <span className="text-stone-400 font-normal text-[10px]">({rest.reviewCount})</span>
                </div>

                {/* Halal & Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-700/90 text-white text-[10px] font-bold">
                    Halal Certified
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      defaultBranch.isOpen ? 'bg-stone-900/80 text-emerald-300' : 'bg-rose-900/80 text-rose-200'
                    }`}
                  >
                    {defaultBranch.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                {/* Restaurant Name & Tagline */}
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight drop-shadow-xs">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-stone-200 line-clamp-1">{rest.tagline}</p>
                </div>
              </div>

              {/* Card Details & CTAs */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-2.5">
                  {/* Cuisines & Price tier */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#9A2D22] dark:text-[#E5A324] truncate max-w-[200px]">
                      {rest.cuisine.join(' • ')}
                    </span>
                    <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                      {rest.priceRange}
                    </span>
                  </div>

                  {/* Branch & Area */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                    <MapPin className="w-3.5 h-3.5 text-[#9A2D22] shrink-0" />
                    <span className="truncate">
                      {defaultBranch.name} • {defaultBranch.area}, {defaultBranch.city}
                    </span>
                  </div>

                  {/* Delivery & Live Tables Status */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-center">
                      <span className="text-[10px] text-stone-500 block">Delivery Time</span>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#9A2D22]" /> 25-35 mins
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-center">
                      <span className="text-[10px] text-stone-500 block">Dine-In Tables</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" /> {availableCount} Tables Free
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => onSelectRestaurant(rest, defaultBranch)}
                    className="w-full py-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Book Table
                  </button>
                  <button
                    onClick={() => onSelectRestaurant(rest, defaultBranch)}
                    className="w-full py-2 rounded-lg bg-[#9A2D22] hover:bg-[#83241A] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>Order Food</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Popular Pakistani Signature Dishes Strip */}
      <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#9A2D22]" />
              <span>Trending Best Sellers Across Pakistan</span>
            </h2>
            <p className="text-xs text-stone-500">Most ordered dishes this week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {popularDishes.map((dish) => {
            const inCart = cart.find((c) => c.item.id === dish.id);
            const cartQty = inCart ? inCart.quantity : 0;

            return (
              <div
                key={dish.id}
                className="food-card p-3 flex gap-3 items-center justify-between"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-20 h-20 rounded-lg object-cover shrink-0 bg-stone-100 dark:bg-stone-800"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                    {dish.name}
                  </h4>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 font-urdu truncate">
                    {dish.nameUrdu}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#9A2D22] dark:text-[#FEE248]">
                      Rs. {dish.basePrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-400">• {dish.prepTimeMinutes}m</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {cartQty > 0 ? (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-2 py-1 rounded-lg">
                      <span className="text-xs font-extrabold text-[#9A2D22] dark:text-[#FEE248]">
                        {cartQty} in cart
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(dish, 1)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#9A2D22] hover:bg-[#83241A] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Commercial Trust & Payment Partner Badges */}
      <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#9A2D22] dark:text-[#E5A324] shrink-0" />
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-100 block">
              Official Pakistani Restaurant Commerce Platform
            </span>
            <span className="text-[11px]">
              FBR & SRB sales tax compliant receipts • Direct kitchen dispatch
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500">
          <span className="px-2 py-1 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700">
            JazzCash
          </span>
          <span className="px-2 py-1 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700">
            Easypaisa
          </span>
          <span className="px-2 py-1 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700">
            Raast QR
          </span>
          <span className="px-2 py-1 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700">
            Visa / Master
          </span>
        </div>
      </div>
    </div>
  );
};
