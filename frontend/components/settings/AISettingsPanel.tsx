'use client';

import React, { useState, useEffect } from 'react';
import { 
  fetchAISettings, 
  updateAISettings, 
  resetAISettings, 
  AISettings 
} from '@/lib/settings-api';
import { 
  Key, 
  ShieldCheck, 
  Cpu, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Globe,
  Sparkles
} from 'lucide-react';

const PROVIDER_OPTIONS = [
  { slug: 'groq', name: 'Groq Cloud', defaultModel: 'llama-3.3-70b-versatile', defaultUrl: 'https://api.groq.com/openai/v1' },
  { slug: 'openrouter', name: 'OpenRouter API', defaultModel: 'google/gemma-4-31b-it:free', defaultUrl: 'https://openrouter.ai/api/v1' },
  { slug: 'openai', name: 'OpenAI (Official)', defaultModel: 'gpt-4o-mini', defaultUrl: 'https://api.openai.com/v1' },
  { slug: 'google', name: 'Google Gemini', defaultModel: 'gemini-2.0-flash-exp', defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  { slug: 'anthropic', name: 'Anthropic Claude', defaultModel: 'claude-3-5-haiku-20241022', defaultUrl: 'https://api.anthropic.com/v1' },
  { slug: 'custom', name: 'Custom (OpenAI-Compatible)', defaultModel: 'custom-model', defaultUrl: 'http://localhost:11434/v1' }
];

const PRESET_MODELS: Record<string, string[]> = {
  groq: ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  openrouter: ['google/gemma-4-31b-it:free', 'meta-llama/llama-3.3-70b-instruct:free', 'openai/gpt-4o-mini', 'deepseek/deepseek-chat'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  google: ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  anthropic: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'],
  custom: []
};

export default function AISettingsPanel() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [useByok, setUseByok] = useState<boolean>(false);
  const [provider, setProvider] = useState<string>('groq');
  const [model, setModel] = useState<string>('llama-3.3-70b-versatile');
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAISettings();
      setSettings(data);
      setUseByok(data.useByok);
      setProvider(data.provider || 'groq');
      setModel(data.model || 'llama-3.3-70b-versatile');
      setBaseUrl(data.baseUrl || '');
      setApiKey(''); // Clear raw key state
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const selectedObj = PROVIDER_OPTIONS.find(p => p.slug === newProvider);
    if (selectedObj) {
      setModel(selectedObj.defaultModel);
      setBaseUrl(newProvider === 'custom' ? selectedObj.defaultUrl : '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await updateAISettings({
        use_byok: useByok,
        provider: provider,
        model: model,
        api_key: apiKey.trim() || undefined,
        base_url: baseUrl.trim() || undefined
      });

      setSettings(updated);
      setApiKey(''); // Clear input after save
      setSuccessMsg('AI Provider settings updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const reset = await resetAISettings();
      setSettings(reset);
      setUseByok(reset.useByok);
      setProvider(reset.provider);
      setModel(reset.model);
      setBaseUrl('');
      setApiKey('');
      setSuccessMsg('Reverted AI Provider settings to platform defaults.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset settings');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm animate-pulse space-y-4 max-w-3xl">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="h-4 w-96 bg-slate-100 rounded"></div>
        <div className="h-10 w-full bg-slate-100 rounded-xl mt-6"></div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 space-y-6 max-w-3xl">
      {/* Header & Mode Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Cpu className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Provider Settings</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Choose platform-provided credentials by default or bring your own API key (BYOK).
          </p>
        </div>

        {/* Active Mode Status Badge */}
        <div className="shrink-0">
          {!useByok ? (
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Using Platform Key</span>
            </span>
          ) : settings?.status === 'active' ? (
            <span className="inline-flex items-center space-x-1.5 bg-purple-50 border border-purple-200/70 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Using Your Key (BYOK)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 bg-rose-50 border border-rose-200/70 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
              <span>BYOK Key Required</span>
            </span>
          )}
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs font-semibold text-emerald-900 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs font-semibold text-rose-900 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Use my own API key (BYOK)</span>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Override default platform credentials with your custom provider account.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={useByok} 
              onChange={(e) => setUseByok(e.target.checked)} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Conditional BYOK Configuration Inputs */}
        <div className={`space-y-5 transition-all duration-300 ${!useByok ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Provider Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
            >
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt.slug} value={opt.slug}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Model Selection / Custom Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Target Model</label>
            <div className="space-y-2">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. llama-3.3-70b-versatile or gpt-4o-mini"
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              
              {PRESET_MODELS[provider] && PRESET_MODELS[provider].length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase mr-1">Presets:</span>
                  {PRESET_MODELS[provider].map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setModel(preset)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        model === preset 
                          ? 'bg-purple-100 border-purple-300 text-purple-800' 
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">API Key</label>
              {settings?.status === 'active' && !apiKey && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Key Encrypted & Saved
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings?.status === 'active' ? "•••••••••••••••• (Leave blank to keep existing encrypted key)" : "Enter your provider API key"}
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] font-medium text-slate-400 leading-normal">
              Keys are encrypted at rest using server-side AES-256 Fernet. Plaintext keys are never returned to the browser.
            </p>
          </div>

          {/* Base URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1 uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>Base URL (Optional)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. https://api.groq.com/openai/v1 or custom host"
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting || saving}
            className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset to Platform Default</span>
          </button>

          <button
            type="submit"
            disabled={saving || resetting}
            className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 border border-purple-700/30 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Cpu className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
