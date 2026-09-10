import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Upload, Image as ImageIcon, Check, RefreshCw, X } from 'lucide-react';
import defaultLogo from '@/src/assets/logo.png';
import defaultHero from '@/src/assets/hero-image.png';

interface AssetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLogoUrl: string | null;
  customHeroUrl: string | null;
  onSaveAssets: (logo: string | null, hero: string | null) => void;
}

export const AssetCustomizerModal: React.FC<AssetCustomizerModalProps> = ({
  isOpen,
  onClose,
  customLogoUrl,
  customHeroUrl,
  onSaveAssets,
}) => {
  const [logoInput, setLogoInput] = useState(customLogoUrl || '');
  const [heroInput, setHeroInput] = useState(customHeroUrl || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'hero'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          setLogoInput(result);
        } else {
          setHeroInput(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveAssets(logoInput.trim() || null, heroInput.trim() || null);
    onClose();
  };

  const handleReset = () => {
    setLogoInput('');
    setHeroInput('');
    onSaveAssets(null, null);
  };

  return (
    <div
      id="asset-customizer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-lg overflow-hidden border-slate-200 bg-white shadow-2xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">
              লোগো ও হিরো ইমেজ কাস্টমাইজেশন
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              আপনার নিজস্ব ব্র্যান্ড লোগো এবং প্রধান ছবি আপলোড করুন
            </p>
          </div>
          <button
            id="close-asset-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Logo Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-600" />
              আপনার ব্র্যান্ড লোগো (Brand Logo)
            </label>
            <div className="flex items-center gap-3">
              <div className="h-14 min-w-14 max-w-[160px] rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                <img
                  src={logoInput || defaultLogo}
                  alt="Logo Preview"
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  id="logo-upload-input"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload-input')?.click()}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  ডিভাইস থেকে লোগো আপলোড করুন
                </Button>
                <input
                  type="url"
                  placeholder="অথবা লোগোর ইমেজ URL পেস্ট করুন..."
                  value={logoInput.startsWith('data:') ? '' : logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Hero Image Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-600" />
              প্রধান ব্যানার/হিরো ছবি (Hero Image)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-14 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                <img
                  src={heroInput || defaultHero}
                  alt="Hero Preview"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  id="hero-upload-input"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('hero-upload-input')?.click()}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  ডিভাইস থেকে হিরো ইমেজ আপলোড করুন
                </Button>
                <input
                  type="url"
                  placeholder="অথবা হিরো ইমেজের URL পেস্ট করুন..."
                  value={heroInput.startsWith('data:') ? '' : heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-cyan-50/70 border border-cyan-200/60 rounded-xl text-[12px] text-cyan-900 leading-relaxed">
            💡 <strong>টিপস:</strong> আপনি যে ফাইলটি আপলোড করবেন তা ব্রাউজারের মেমরিতে সংরক্ষিত থাকবে এবং ওয়েবসাইটে সাথে সাথে দেখতে পাবেন।
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              ডিফল্টে ফেরত যান
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                সংরক্ষণ করুন
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
