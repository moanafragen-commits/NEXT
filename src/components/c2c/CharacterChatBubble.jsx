import React from 'react';
import { motion } from 'framer-motion';

export default function CharacterChatBubble({ message, charA, charB, index }) {
  const isCharA = message.sender_character_id === charA.id;
  const sender = isCharA ? charA : charB;
  const avatar = sender.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${sender.name}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex gap-2 ${isCharA ? 'justify-start' : 'justify-end'}`}
    >
      {isCharA && (
        <img src={avatar} alt={sender.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
      )}
      <div className={`max-w-[75%] ${isCharA ? '' : 'flex flex-col items-end'}`}>
        <span className={`text-[10px] font-medium mb-0.5 block ${isCharA ? 'text-emerald-400' : 'text-purple-400'}`}>
          {sender.name}
        </span>
        <div className={`rounded-2xl px-4 py-2.5 ${
          isCharA
            ? 'bg-[#262626] text-gray-100 rounded-bl-md'
            : 'bg-purple-600/80 text-white rounded-br-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
      {!isCharA && (
        <img src={avatar} alt={sender.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
      )}
    </motion.div>
  );
}