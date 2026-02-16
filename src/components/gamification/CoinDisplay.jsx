import React from 'react';

export default function CoinDisplay({ coins, size = 'sm' }) {
  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <span className="text-2xl">🪙</span>
        <span className="text-xl font-bold text-yellow-400">{(coins || 0).toLocaleString()}</span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-yellow-400 font-semibold text-xs">
      🪙 {(coins || 0).toLocaleString()}
    </span>
  );
}