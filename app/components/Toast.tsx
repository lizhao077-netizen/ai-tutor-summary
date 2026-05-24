"use client";

import { useEffect } from "react";

interface Props {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onClose, duration = 2500 }: Props) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className="px-5 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg whitespace-nowrap">
        {message}
      </div>
    </div>
  );
}
