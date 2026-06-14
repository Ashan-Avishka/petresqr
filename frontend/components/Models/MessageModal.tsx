// NotificationModal.tsx
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

type NotifType = "success" | "error" | "warning" | "info";

function Icon({ type }: { type: NotifType }) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    case "error":
      return <XCircle className="w-8 h-8 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    case "info":
      return <Info className="w-8 h-8 text-blue-500" />;
  }
}
interface Props {
  type: NotifType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  isOpen: boolean;
}

export function NotificationModal({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  isOpen,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="bg-gradient-to-br from-primary via-black to-black border border-gray-700 shadow-md rounded-2xl p-8 w-100 text-center relative"
            initial={{ scale: 0.88, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 16, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 22,
            }}
          >
            {/* Icon ring */}
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center border border-primary/30 bg-primary/10">
              <Icon type={type} />
            </div>

            <h3 className="text-white font-medium text-lg mb-2">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex gap-2">
              <button
                onClick={onDismiss}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/60 text-sm hover:bg-white/5 transition-colors">
                Dismiss
              </button>
              {actionLabel && (
                <button
                  onClick={onAction}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-primary via-black to-black shadow-sm shadow-primary text-sm font-medium transition-all hover:shadow-md">
                  {actionLabel}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
