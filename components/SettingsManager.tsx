'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { SiteSettings } from '@/lib/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/settings';
import { Save, Settings2, Loader2, ImageIcon } from 'lucide-react';

interface SettingsForm {
  company_name: string;
  tagline: string;
  logo_url: string;
  support_phone: string;
  whatsapp_number: string;
  primary_email: string;
  office_address: string;
  rc_number: string;
  currency_symbol: string;
  currency_code: string;
  vat_percent: string;
  social_twitter: string;
  social_instagram: string;
  social_facebook: string;
  social_linkedin: string;
  social_whatsapp: string;
}

function settingsToForm(s: SiteSettings): SettingsForm {
  return {
    company_name: s.company_name,
    tagline: s.tagline,
    logo_url: s.logo_url,
    support_phone: s.support_phone,
    whatsapp_number: s.whatsapp_number,
    primary_email: s.primary_email,
    office_address: s.office_address,
    rc_number: s.rc_number,
    currency_symbol: s.currency_symbol,
    currency_code: s.currency_code,
    vat_percent: String(s.vat_percent),
    social_twitter: s.socials?.twitter ?? '',
    social_instagram: s.socials?.instagram ?? '',
    social_facebook: s.socials?.facebook ?? '',
    social_linkedin: s.socials?.linkedin ?? '',
    social_whatsapp: s.socials?.whatsapp ?? '',
  };
}

const EMPTY_FORM: SettingsForm = settingsToForm(DEFAULT_SITE_SETTINGS);

const inputClass =
  'w-full border border-[#14212b]/20 bg-[#f5f5f1] px-3 py-2 text-sm text-[#14212b] focus:outline-none focus:ring-1 focus:ring-[#14212b] placeholder:text-[#14212b]/40';
const labelClass = 'block text-[11px] font-bold uppercase tracking-[0.14em] text-[#14212b]/70 mb-1';
const sectionHeadClass =
  'text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c] pb-2 border-b border-[#14212b]/10 mb-4';

export function SettingsManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest<SiteSettings>('/api/admin/settings.php');
        setForm(settingsToForm(data));
      } catch {
        onNotify('Could not load settings — showing defaults.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleChange(key: keyof SettingsForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/api/admin/settings.php', 'PUT', form);
      onNotify('Store settings saved successfully.');
    } catch (err: any) {
      onNotify('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 border border-[#14212b]/10 bg-[#e8e8e1]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            White-Label Configuration
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Store Settings
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-[#14212b]/40" />
          <span className="text-xs font-bold text-[#14212b]/60">Brand & Contact</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* Company Information */}
        <div>
          <p className={sectionHeadClass}>Company Information</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                className={inputClass}
                value={form.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="ShopIt"
              />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input
                className={inputClass}
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Your marketplace tagline"
              />
            </div>
            <div>
              <label className={labelClass}>RC / CAC Registration Number</label>
              <input
                className={inputClass}
                value={form.rc_number}
                onChange={(e) => handleChange('rc_number', e.target.value)}
                placeholder="RC: 1894203"
              />
            </div>
            <div>
              <label className={labelClass}>Office Address</label>
              <input
                className={inputClass}
                value={form.office_address}
                onChange={(e) => handleChange('office_address', e.target.value)}
                placeholder="Street, City, State, Country"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Logo URL</label>
              <input
                className={inputClass}
                value={form.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="/favicon.png or https://..."
              />
              {form.logo_url && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="h-10 w-auto border border-[#14212b]/15 object-contain bg-white p-1"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-[11px] text-[#14212b]/50">Logo preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Currency */}
        <div>
          <p className={sectionHeadClass}>Currency & Tax</p>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Currency Symbol</label>
              <input
                className={inputClass}
                value={form.currency_symbol}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                placeholder="₦"
              />
            </div>
            <div>
              <label className={labelClass}>Currency Code</label>
              <input
                className={inputClass}
                value={form.currency_code}
                onChange={(e) => handleChange('currency_code', e.target.value)}
                placeholder="NGN"
              />
            </div>
            <div>
              <label className={labelClass}>VAT / Tax (%)</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.vat_percent}
                onChange={(e) => handleChange('vat_percent', e.target.value)}
                placeholder="7.5"
              />
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div>
          <p className={sectionHeadClass}>Contact & Support</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Primary Email</label>
              <input
                className={inputClass}
                type="email"
                value={form.primary_email}
                onChange={(e) => handleChange('primary_email', e.target.value)}
                placeholder="support@yourstore.com"
              />
            </div>
            <div>
              <label className={labelClass}>Support Phone</label>
              <input
                className={inputClass}
                value={form.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number (intl format)</label>
              <input
                className={inputClass}
                value={form.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+2348000000000"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <p className={sectionHeadClass}>Social Links</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input
                className={inputClass}
                value={form.social_twitter}
                onChange={(e) => handleChange('social_twitter', e.target.value)}
                placeholder="https://x.com/yourhandle"
              />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                className={inputClass}
                value={form.social_instagram}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div>
              <label className={labelClass}>Facebook</label>
              <input
                className={inputClass}
                value={form.social_facebook}
                onChange={(e) => handleChange('social_facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                className={inputClass}
                value={form.social_linkedin}
                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourco"
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Chat Link</label>
              <input
                className={inputClass}
                value={form.social_whatsapp}
                onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                placeholder="https://wa.me/234800000000"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t border-[#14212b]/10 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#14212b] text-[#e0ee56] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] hover:bg-[#14212b]/90 cursor-pointer transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
