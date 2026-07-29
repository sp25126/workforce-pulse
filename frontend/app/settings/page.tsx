'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AISettingsPanel from '@/components/settings/AISettingsPanel';
import { Settings, Shield, Sliders } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Page Title Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <Settings className="h-6 w-6 text-blue-600" />
              <span>Workspace Settings</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Configure system defaults, AI provider credentials, and audit parameters.
            </p>
          </div>
        </div>

        {/* AI Provider Settings Section */}
        <AISettingsPanel />
      </div>
    </DashboardLayout>
  );
}
