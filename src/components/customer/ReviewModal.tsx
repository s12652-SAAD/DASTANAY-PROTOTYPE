import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { Star, X, Check, Heart } from 'lucide-react';

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
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-zinc-300 hover:text-amber-400 cursor-pointer transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base">Rate Your Dining Experience</h3>
            <p className="text-xs text-zinc-500">Order #{orderId} • {order?.tableNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-base">Shukriya! Thank you for your feedback.</h4>
            <p className="text-xs text-zinc-500">Your review helps our kitchen and staff maintain high culinary standards.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <StarPicker label="1. Food Taste & Quality" value={foodRating} onChange={setFoodRating} />
              <StarPicker label="2. Speed & Hospitality" value={serviceRating} onChange={setServiceRating} />
              <StarPicker label="3. Waiter / Staff Behavior" value={staffRating} onChange={setStaffRating} />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                Written Comments & Suggestions
              </label>
              <textarea
                rows={3}
                placeholder="What did you love about the food, ambiance, or service? (e.g. Mutton Karahi was flavorful, fast service...)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Submit Verified Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
