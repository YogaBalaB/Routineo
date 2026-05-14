import { motion, AnimatePresence } from "motion/react";
import { Trash2, X } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

interface BulkToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  itemName?: string;
}

export default function BulkToolbar({ 
  selectedCount, 
  onDelete, 
  onClear,
  itemName = "items"
}: BulkToolbarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[500] w-[90%] max-w-2xl"
        >
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#7C3AED] text-white px-3 py-1 rounded-full text-sm font-bold">
                {selectedCount} Selected
              </div>
              <span className="text-slate-500 font-medium hidden sm:inline">
                {selectedCount} {selectedCount === 1 ? itemName : `${itemName}s`} selected for action
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <PrimaryButton 
                label={`Delete Selected`} 
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 px-4 py-2 text-sm"
              />
              <button 
                onClick={onClear}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                title="Clear selection"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
