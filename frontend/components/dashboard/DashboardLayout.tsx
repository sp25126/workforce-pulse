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
    <div className="flex min-h-screen bg-slate-50/60 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-800">
      {/* 1. Desktop Sidebar - Anchored strictly to top-0 left-0 bottom-0 */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200/80 shadow-xs z-20">
        {/* Sidebar Header Logo */}
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm shadow-blue-500/20">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">Workforce Pulse</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href="#"
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  item.active 
                    ? 'bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100/60' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer Profile widget */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/30">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200/70 flex items-center justify-center font-bold text-xs text-slate-700 shadow-inner">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">Audit Admin</p>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate">Pulse Reporting</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-200 shadow-2xl h-full flex flex-col z-50 animate-in slide-in-from-left-full duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-base">Workforce Pulse</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
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
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                      item.active 
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-100/60' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/30">
              <div className="flex items-center space-x-3 px-2 py-1.5">
                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center font-bold text-xs text-slate-700">
                  AD
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Audit Admin</p>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Pulse Reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Nav Header Bar */}
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="sticky top-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-xs">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 text-sm">Workforce Pulse</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors duration-200 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* 4. Page Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
