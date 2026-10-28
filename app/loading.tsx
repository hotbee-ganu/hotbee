import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-hotbee-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-hotbee-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-semibold tracking-wider uppercase text-hotbee-500 animate-pulse">
        HOTBEE • Loading...
      </p>
    </div>
  );
}
