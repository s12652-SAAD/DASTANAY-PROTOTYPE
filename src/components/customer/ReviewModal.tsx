import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { Star, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewModalProps {
  orderId: string | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ orderId, onClose }) => {
  const { orders, submitReview } = useDastanay();
  const [foodRating, setFoodRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [staffRating, setStaffRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!orderId) return null;
  const order = orders.find((o) => o.id === orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(orderId, foodRating, serviceRating, staffRating, comment);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onClose();
    }, 1500);
  };

  const StarPicker = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
      <span className="font-bold text-xs text-stone-800 dark:text-stone-200">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-stone-300 hover:text-amber-400 cursor-pointer transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="app-card max-w-md w-full overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">Rate Your Dining Experience</h3>
            <p className="text-xs text-stone-500">Order #{orderId} • {order?.tableNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-[#E8ECFB] dark:bg-[#22336F]/60 text-[#364FAB] dark:text-[#E8ECFB] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-base text-[#202124] dark:text-stone-100">Shukriya! Thank you for your feedback.</h4>
            <p className="text-xs text-[#687078]">Your review helps our kitchen and staff maintain high culinary standards.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <StarPicker label="1. Food Taste & Quality" value={foodRating} onChange={setFoodRating} />
              <StarPicker label="2. Speed & Hospitality" value={serviceRating} onChange={setServiceRating} />
              <StarPicker label="3. Waiter / Staff Behavior" value={staffRating} onChange={setStaffRating} />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-[#202124] dark:text-stone-300 block">
                Written Comments & Suggestions
              </label>
              <textarea
                rows={3}
                placeholder="What did you love about the food, ambiance, or service? (e.g. Mutton Karahi was flavorful, fast service...)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#F7F8FA] dark:bg-stone-800 text-[#202124] dark:text-stone-100 outline-none focus:ring-1 focus:ring-[#364FAB]"
                required
              ></textarea>
            </div>

            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#364FAB] hover:bg-[#2D428F] text-white font-extrabold text-xs shadow-sm cursor-pointer transition-colors"
              >
                Submit Verified Review
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

