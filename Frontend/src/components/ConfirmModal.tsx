import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  isLoading
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl z-[1000] border border-slate-100"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-dark-navy">{title}</h3>
                <p className="text-slate-500 text-sm">{message}</p>
              </div>
              <div className="flex flex-col w-full gap-3 pt-4">
                <PrimaryButton 
                  label={confirmLabel} 
                  onClick={onConfirm} 
                  isLoading={isLoading}
                  className="bg-red-500 hover:bg-red-600 active:bg-red-700 w-full"
                />
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-8 py-3 rounded-lg border border-[#D1D5DB] text-[#6B7280] font-medium hover:border-[#9CA3AF] transition-colors text-sm w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
