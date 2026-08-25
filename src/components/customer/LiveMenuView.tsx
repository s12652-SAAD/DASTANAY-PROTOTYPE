import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { MenuItem, MenuItemAddon, MenuItemVariation } from '../../types';
import {
  Search,
  Plus,
  Clock,
  Check,
  AlertCircle,
  X,
  Minus,
  ShoppingBag,
  ArrowRight,
  Flame,
  Utensils,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Star,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DastnayLogo } from '../common/DastnayLogo';

interface LiveMenuViewProps {
  onOpenCart: () => void;
}

export const LiveMenuView: React.FC<LiveMenuViewProps> = ({ onOpenCart }) => {
  const {
    menuItems,
    inventory,
    restaurants,
    branches,
    currentBranchId,
    addToCart,
    currentRestaurantId,
    language,
    currentTableSession,
    cart,
  } = useDastanay();
  const t = dictionary[language];

  const currentRestaurant =
    restaurants.find((r) => r.id === currentRestaurantId) || restaurants[0];
  const currentBranch =
    branches.find((b) => b.id === currentBranchId) || branches[0];

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Customization Modal State
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<MenuItemVariation | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<string>('');

  // Filter items for current restaurant
  const restMenuItems = menuItems.filter(
    (item) => item.restaurantId === currentRestaurantId && item.isAvailableGlobal
  );

  const categories = ['All', ...Array.from(new Set(restMenuItems.map((i) => i.category)))];

  const filteredItems = restMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameUrdu.includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCustomizer = (item: MenuItem) => {
    // If item has no addons or variations, add directly or open modal
    if ((!item.variations || item.variations.length === 0) && (!item.addons || item.addons.length === 0)) {
      addToCart({
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.id,
        name: item.name,
        basePrice: item.basePrice,
        quantity: 1,
        itemTotal: item.basePrice,
      });
      setAddedToast(`Added 1x ${item.name} to cart`);
      setTimeout(() => setAddedToast(''), 2500);
      return;
    }

    setActiveItem(item);
    setSelectedVariation(item.variations?.[0]);
    setSelectedAddons([]);
    setSpecialInstructions('');
    setQuantity(1);
  };

  const handleToggleAddon = (addon: MenuItemAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const calculateCustomizerTotal = () => {
    if (!activeItem) return 0;
    const base = activeItem.basePrice + (selectedVariation?.priceModifier || 0);
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return (base + addonsTotal) * quantity;
  };

  const handleAddToCartSubmit = () => {
    if (!activeItem) return;

    const basePriceWithVar = activeItem.basePrice + (selectedVariation?.priceModifier || 0);
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePriceWithVar + addonsTotal;

    addToCart({
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: activeItem.id,
      name: activeItem.name,
      basePrice: activeItem.basePrice,
      selectedVariation,
      selectedAddons,
      quantity,
      specialInstructions: specialInstructions.trim() || undefined,
      itemTotal: unitPrice * quantity,
    });

    setAddedToast(`Added ${quantity}x ${activeItem.name} to cart`);
    setTimeout(() => setAddedToast(''), 2500);

    setActiveItem(null);
  };

  const cartTotalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotalAmount = cart.reduce((s, i) => s + i.itemTotal, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 bg-[#9A2D22] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-[#FEE248]" />
            <span>{addedToast}</span>
            <button
              onClick={onOpenCart}
              className="ml-2 px-2.5 py-1 bg-[#FEE248] text-stone-900 rounded-md text-[11px] font-extrabold hover:bg-yellow-300 cursor-pointer"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Practical Commercial Restaurant Header */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
              <img
                src={currentRestaurant.logo}
                alt={currentRestaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  {currentRestaurant.name}
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  Halal
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                  <Star className="w-3.5 h-3.5 fill-[#E5A324] text-[#E5A324]" />
                  {currentRestaurant.rating} ({currentRestaurant.reviewCount} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9A2D22]" />
                  {currentBranch.name}, {currentBranch.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Avg Prep: 15-25 mins
                </span>
              </div>
            </div>
          </div>

          {/* Active Table Session status */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {currentTableSession ? (
              <div className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-xs font-bold text-amber-900 dark:text-[#FEE248]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5A324] animate-pulse"></span>
                  <span>{currentTableSession.tableNumber} Active Session</span>
                </div>
                <button
                  onClick={onOpenCart}
                  className="underline text-[11px] font-semibold hover:opacity-80 cursor-pointer"
                >
                  Order
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300">
                <Utensils className="w-3.5 h-3.5 text-[#9A2D22]" />
                <span>Dine-in & Takeaway Live Menu</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sticky Category Bar & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Horizontal category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === 'All'
                  ? restMenuItems.length
                  : restMenuItems.filter((i) => i.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#9A2D22] text-white'
                      : 'bg-white dark:bg-[#18181B] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search within menu */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dishes in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#18181B] text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
            />
          </div>
        </div>
      </div>

      {/* 3. Food Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const inv = inventory.find(
            (i) => i.menuItemId === item.id && i.branchId === currentBranchId
          );
          const stockQty = inv ? inv.stockQuantity : 10;
          const isBranchAvailable = inv ? inv.isAvailableAtBranch && stockQty > 0 : true;
          const isLowStock = stockQty > 0 && stockQty <= (item.lowStockThreshold || 5);

          const inCart = cart.find((c) => c.menuItemId === item.id);
          const inCartCount = inCart ? inCart.quantity : 0;

          return (
            <div
              key={item.id}
              className={`food-card p-3.5 flex flex-col sm:flex-row gap-3.5 justify-between ${
                !isBranchAvailable ? 'opacity-60 bg-stone-50 dark:bg-stone-900/40' : ''
              }`}
            >
              {/* Dish Info */}
              <div className="flex-1 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#9A2D22] dark:text-[#E5A324] font-urdu">
                        {item.nameUrdu}
                      </p>
                    </div>

                    {!isBranchAvailable ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {stockQty} Left
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price & Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                      Rs. {item.basePrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-400">• {item.prepTimeMinutes}m</span>
                  </div>

                  <button
                    disabled={!isBranchAvailable}
                    onClick={() => handleOpenCustomizer(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#9A2D22] hover:bg-[#83241A] disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FEE248]" />
                    <span>{inCartCount > 0 ? `${inCartCount} Added` : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* Photo */}
              <div className="relative w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {item.isPopular && (
                  <span className="absolute top-1 left-1 bg-[#E5A324] text-stone-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                    Popular
                  </span>
                )}
                {item.isSpicy && (
                  <span className="absolute bottom-1 right-1 bg-[#9A2D22] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                    🌶️ Spicy
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Item Customization Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-[#18181B] text-stone-900 dark:text-stone-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Customize {activeItem.name}
                  </h3>
                  <p className="text-xs text-[#9A2D22] dark:text-[#E5A324] font-urdu">
                    {activeItem.nameUrdu}
                  </p>
                </div>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Variations (e.g. Half / Full) */}
                {activeItem.variations && activeItem.variations.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-bold text-stone-800 dark:text-stone-200 text-xs block">
                      Portion / Serving Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activeItem.variations.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                            selectedVariation?.id === v.id
                              ? 'border-[#9A2D22] bg-amber-50 dark:bg-amber-950/50 font-bold text-[#9A2D22] dark:text-[#FEE248]'
                              : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{v.name}</span>
                            {v.priceModifier > 0 && (
                              <span className="font-mono text-[11px]">+Rs. {v.priceModifier}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {activeItem.addons && activeItem.addons.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-bold text-stone-800 dark:text-stone-200 text-xs block">
                      Choose Add-ons
                    </label>
                    <div className="space-y-1.5">
                      {activeItem.addons.map((a) => {
                        const isSelected = selectedAddons.some((add) => add.id === a.id);
                        return (
                          <div
                            key={a.id}
                            onClick={() => handleToggleAddon(a)}
                            className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-[#9A2D22] bg-amber-50 dark:bg-amber-950/50 text-[#9A2D22] dark:text-[#FEE248]'
                                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-[#9A2D22] border-[#9A2D22] text-white'
                                    : 'border-stone-400'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <span className="font-medium">{a.name}</span>
                            </div>
                            <span className="font-bold font-mono">+Rs. {a.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-800 dark:text-stone-200 text-xs block">
                    Special Cooking Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Less spice, extra raita, crispier..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:border-[#9A2D22]"
                  />
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-xs">Quantity</span>
                  <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-stone-600 dark:text-stone-300 hover:text-[#9A2D22] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-xs w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-stone-600 dark:text-stone-300 hover:text-[#9A2D22] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] text-stone-500 block">Total</span>
                  <span className="font-mono font-bold text-sm text-[#9A2D22] dark:text-[#FEE248]">
                    Rs. {calculateCustomizerTotal().toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleAddToCartSubmit}
                  className="px-4 py-2 rounded-lg bg-[#9A2D22] hover:bg-[#83241A] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Mobile Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="sm:hidden fixed bottom-4 inset-x-3 z-40">
          <button
            onClick={onOpenCart}
            className="w-full bg-[#9A2D22] text-white p-3 rounded-xl shadow-xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#FEE248]" />
              <div className="text-left text-xs">
                <span className="font-bold">{cartTotalItems} items</span>
                <span className="mx-1">•</span>
                <span className="font-mono font-bold">Rs. {cartTotalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#FEE248] text-stone-900 px-2.5 py-1 rounded-md font-bold text-xs">
              <span>View Cart</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
