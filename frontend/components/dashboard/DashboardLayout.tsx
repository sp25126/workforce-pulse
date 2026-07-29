'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, Activity, Menu, X } from 'lucide-react';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<any>;
  active: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation: SidebarItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Activity Audit', icon: Activity, active: false },
    { name: 'Team Insights', icon: Users, active: false },
    { name: 'Settings', icon: Settings, active: false }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 shadow-sm z-20">
        {/* Sidebar Header Logo */}
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">Workforce Pulse</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href="#"
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Audit Admin</p>
              <p className="text-[10px] text-slate-400 font-semibold">Pulse reporting</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Nav Header Bar */}
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="sticky top-0 z-20 md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-800">Workforce Pulse</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* 3. Mobile Navigation Drawer (Overlay) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer container */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 shadow-xl h-full animate-slide-in">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-800">Workforce Pulse</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={index}
                      href="#"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        item.active 
                          ? 'bg-blue-50 text-blue-700 shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 shrink-0">
                <div className="flex items-center space-x-3 px-2 py-1">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                    AD
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Audit Admin</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Pulse reporting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Page Main Content Container */}
        <main className="flex-1 p-6 sm:p-8 md:p-10 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
