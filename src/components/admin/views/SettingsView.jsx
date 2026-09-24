"use client";

import { useState, useEffect } from 'react';
import { Settings, DollarSign, Shield, Database, Save, Check, RefreshCw, AlertCircle } from 'lucide-react';

export default function SettingsView({ onTriggerAlert }) {
  const [settings, setSettings] = useState({
    adsEnabled: true,
    premiumGating: true,
    adSensePublisherId: 'ca-pub-4372092895969608',
    adSlots: {
      headerBanner: '1234567890',
      inArticle: '2345678901',
      sidebar: '3456789012',
    },
    maintenanceMode: false,
    systemNotice: '',
    autoSyncSyllabus: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load settings');
      setSettings(json.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save settings');
      onTriggerAlert && onTriggerAlert('Platform settings saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs">
        Loading platform settings & advertising configurations...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Advertising & AdSense */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Google AdSense Integration
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="adsEnabled"
                checked={settings.adsEnabled}
                onChange={(e) => setSettings({ ...settings, adsEnabled: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
              />
              <label htmlFor="adsEnabled" className="text-xs font-mono font-bold text-emerald-400 cursor-pointer">
                Enable Ads Across Platform
              </label>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">AdSense Publisher ID</label>
              <input
                type="text"
                value={settings.adSensePublisherId}
                onChange={(e) => setSettings({ ...settings, adSensePublisherId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono font-semibold">Header Banner Slot</label>
                <input
                  type="text"
                  value={settings.adSlots?.headerBanner || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    adSlots: { ...settings.adSlots, headerBanner: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono font-semibold">In-Article Slot</label>
                <input
                  type="text"
                  value={settings.adSlots?.inArticle || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    adSlots: { ...settings.adSlots, inArticle: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono font-semibold">Sidebar Slot</label>
                <input
                  type="text"
                  value={settings.adSlots?.sidebar || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    adSlots: { ...settings.adSlots, sidebar: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Governance & Access Toggles */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Platform Governance & Access Controls
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div>
                <p className="font-semibold text-slate-200">Premium Content Gating</p>
                <p className="text-[11px] text-slate-400">Gate detailed model answers and full judgments behind pro login</p>
              </div>
              <input
                type="checkbox"
                checked={settings.premiumGating}
                onChange={(e) => setSettings({ ...settings, premiumGating: e.target.checked })}
                className="rounded bg-slate-900 border-slate-750 text-amber-500 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div>
                <p className="font-semibold text-slate-200">Auto-Sync University Syllabi</p>
                <p className="text-[11px] text-slate-400">Regularly verify official Gujarat university syllabus revisions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSyncSyllabus}
                onChange={(e) => setSettings({ ...settings, autoSyncSyllabus: e.target.checked })}
                className="rounded bg-slate-900 border-slate-750 text-amber-500 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div>
                <p className="font-semibold text-slate-200">Maintenance Mode</p>
                <p className="text-[11px] text-slate-400">Display maintenance page to non-administrator users</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="rounded bg-slate-900 border-slate-750 text-red-500 focus:ring-0"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-slate-400 font-mono font-semibold">Global System Announcement Banner</label>
              <input
                type="text"
                placeholder="e.g. Welcome Law Students: BNS 2023 vs IPC 1860 comparative notes are now live!"
                value={settings.systemNotice}
                onChange={(e) => setSettings({ ...settings, systemNotice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Database Health Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Database Architecture Status
          </h3>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 font-mono space-y-1">
            <p className="text-emerald-400">● Provider: SQLite (Local) • Production Ready for PostgreSQL</p>
            <p className="text-slate-400">● ORM: Prisma 5.22 • 29 Validated Relational Entities</p>
            <p className="text-slate-400">● Cascade Constraints: Enabled on University/Course/Subject/Unit</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
