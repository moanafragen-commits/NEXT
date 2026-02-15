import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function GroupChatBubble({ message, sender }) {
  const isCurrentUser = sender.isCurrentUser;
  const time = new Date(message.created_date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isCurrentUser && (
        <img
          src={sender.avatar}
          alt={sender.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-5"
        />
      )}
      <div className={`max-w-[75%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs text-emerald-400/80 mb-1 ml-1 font-medium">{sender.name}</span>
        )}
        <div className={`rounded-2xl px-4 py-2.5 ${
          isCurrentUser
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-[#262626] text-gray-100 rounded-bl-md'
        }`}>
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Bild"
              className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url, '_blank')}
            />
          )}
          <ReactMarkdown className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content}
          </ReactMarkdown>
        </div>
        <span className="text-[10px] text-gray-500 mt-0.5 mx-1">{time}</span>
      </div>
    </motion.div>
  );
}