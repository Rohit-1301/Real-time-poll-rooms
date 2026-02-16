import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3`}>
        <span className="text-2xl">
          {type === 'success' ? '✓' : '✕'}
        </span>
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}
