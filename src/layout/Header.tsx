import React from 'react';
import { ChevronLeft, Bell, Menu } from 'lucide-react';

export default function Header() {
  return (
    <div className="w-full bg-surface-card flex gap-3 px-4 py-3 items-center border-b border-border">
      <ChevronLeft className="shrink-0" />
      <div className="w-full text-title">AI 채팅</div>
      <Bell size={22} className="shrink-0" />
      <Menu size={22} className="shrink-0" />
    </div>
  );
}
