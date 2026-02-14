import React from 'react';
import { motion } from 'framer-motion';

export default function UnreadBadge({ count }) {
  if (!count || count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1.5"
    >
      <span className="text-white text-xs font-bold">
        {count > 99 ? '99+' : count}
      </span>
    </motion.div>
  );
}