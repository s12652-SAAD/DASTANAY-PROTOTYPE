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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveMenuViewProps {
  onOpenCart: () => void;
}

export const LiveMenuView: React.FC<LiveMenuViewProps> = ({ onOpenCart }) => {
  const {
    menuItems,
    inventory,
    currentBranchId,
    addToCart,
    currentRestaurantId,
    language,
    currentTableSession,
  } = useDastanay();
  const t = dictionary[language];

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

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold"
          >
            <Check className="w-4 h-4" />
            <span>{addedToast}</span>
            <button
              onClick={onOpenCart}
              className="ml-2 px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-[11px] font-bold hover:bg-emerald-50 cursor-pointer transition-colors"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Session Banner if active */}
      {currentTableSession ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              {currentTableSession.tableNumber.replace('Table ', 'T')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  {currentTableSession.tableNumber} Active
                </span>
                <span className="app-pill bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300">
                  Direct Kitchen Ordering
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono">Session: {currentTableSession.sessionId}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={onOpenCart}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Review Cart & Order
          </motion.button>
        </motion.div>
      ) : (
        <div className="app-card p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Browsing menu in preview mode. Check in or scan QR at your table to place kitchen orders.</span>
          </div>
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categories in clean pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search dishes or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-600 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredItems.map((item) => {
            // Check branch inventory stock
            const inv = inventory.find(
              (i) => i.menuItemId === item.id && i.branchId === currentBranchId
            );
            const stockQty = inv ? inv.stockQuantity : 10;
            const isBranchAvailable = inv ? inv.isAvailableAtBranch && stockQty > 0 : true;
            const isLowStock = stockQty > 0 && stockQty <= (item.lowStockThreshold || 5);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={item.id}
                className={`app-card p-4 transition-all flex flex-col sm:flex-row gap-4 justify-between group ${
                  !isBranchAvailable
                    ? 'opacity-60 bg-stone-50 dark:bg-stone-900/40'
                    : 'hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm'
                }`}
              >
                <div className="flex-1 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                          {item.name}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-serif">
                          {item.nameUrdu}
                        </p>
                      </div>

                      {/* Stock Badges */}
                      {!isBranchAvailable ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {t.out_of_stock}
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Only {stockQty} Left
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Metadata & Price */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="font-mono font-black text-base text-stone-900 dark:text-stone-100">
                        Rs. {item.basePrice.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        {item.prepTimeMinutes}m
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      whileHover={{ scale: 1.04 }}
                      disabled={!isBranchAvailable}
                      onClick={() => handleOpenCustomizer(item)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </motion.button>
                  </div>
                </div>

                {/* Item Thumbnail */}
                <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {item.isPopular && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      MUST TRY
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="absolute bottom-1.5 right-1.5 bg-rose-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      🌶️ SPICY
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Item Customizer Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative h-40 bg-stone-900 shrink-0">
                <img
                  src={activeItem.image}
                  alt={activeItem.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-extrabold text-white drop-shadow">{activeItem.name}</h3>
                  <p className="text-xs text-emerald-200 font-serif drop-shadow">{activeItem.nameUrdu}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Variations (e.g. Half / Full) */}
                {activeItem.variations && activeItem.variations.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider block text-[11px]">
                      Portion / Serving Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activeItem.variations.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedVariation?.id === v.id
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 font-bold text-emerald-900 dark:text-emerald-200'
                              : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>{v.name}</span>
                            {v.priceModifier > 0 && <span>+Rs. {v.priceModifier}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {activeItem.addons && activeItem.addons.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider block text-[11px]">
                      Customize Add-ons
                    </label>
                    <div className="space-y-1.5">
                      {activeItem.addons.map((a) => {
                        const isSelected = selectedAddons.some((add) => add.id === a.id);
                        return (
                          <div
                            key={a.id}
                            onClick={() => handleToggleAddon(a)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-400'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <span className="font-semibold">{a.name}</span>
                            </div>
                            <span className="font-bold font-mono">+Rs. {a.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cooking Instructions */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider block text-[11px]">
                    Special Cooking Instructions / Allergies
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, extra lemon, crispier naan..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Quantity Counter */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                  <span className="font-extrabold text-sm">Quantity</span>
                  <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-stone-600 dark:text-stone-300 hover:text-emerald-600 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </motion.button>
                    <span className="font-black text-sm w-4 text-center">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-stone-600 dark:text-stone-300 hover:text-emerald-600 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] text-stone-500 block font-semibold">Calculated Total</span>
                  <span className="font-mono font-black text-lg text-emerald-700 dark:text-emerald-400">
                    Rs. {calculateCustomizerTotal().toLocaleString()}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleAddToCartSubmit}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
