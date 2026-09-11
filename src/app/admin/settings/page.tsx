'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, Users, ShieldCheck, Plus, 
  Edit, Key, CheckCircle2, RefreshCw, X, Lock, Mail, User,
  Sparkles, Image as ImageIcon, Upload, Trash2, ArrowUp, ArrowDown,
  Eye, ExternalLink, Play, Pause, Save, Layout, Palette
} from 'lucide-react';
import { 
  fetchAdminUsers, saveAdminUser, AdminUser,
  fetchAdminSettings, saveAdminSettings, uploadAdminPhoto
} from '@/lib/admin-api';
import { HeroSlide } from '@/lib/api';

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    tag: 'Trending • Pan-India Favorite',
    title: 'Laser Cut Acrylic Fridge Magnets',
    subtitle: 'From wavy artistic contours to floral and geometric shapes. Printed with Japanese fade-resistant UV ink technology.',
    price: 'Special Combo from ₹199',
    price_text: 'Special Combo from ₹199',
    image: '/banners/hero_fridge_magnets.jpg',
    categoryLink: '/shop?category=fridge-magnet',
    link: '/shop?category=fridge-magnet',
    badge: 'Best Seller',
    button_text: 'Customize Magnet',
    gradient: 'from-amber-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Artisan Caricature Keepsakes',
    title: 'Custom Carrycature Portrait Stands',
    subtitle: 'Handcrafted fun caricatures on crystal-clear acrylic with laser-cut edges and natural wood base.',
    price: 'Starting at ₹449',
    price_text: 'Starting at ₹449',
    image: '/banners/hero_carrycature.jpg',
    categoryLink: '/shop?category=carrycature',
    link: '/shop?category=carrycature',
    badge: 'Popular',
    button_text: 'Create Portrait',
    gradient: 'from-rose-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Car Interior Accessories',
    title: 'Custom Rearview Car Hanging & Dash Stands',
    subtitle: 'Heat-resistant, UV-stabilized acrylic charms with silky tassels and solid pedestals for your vehicle.',
    price: 'Starting at ₹299',
    price_text: 'Starting at ₹299',
    image: '/banners/hero_car_hanging.jpg',
    categoryLink: '/shop?category=car-hanging',
    link: '/shop?category=car-hanging',
    badge: 'New Launch',
    button_text: 'Personalize Charm',
    gradient: 'from-blue-500/20 via-primary-500/10 to-transparent'
  },
  {
    tag: 'Artisan Desktop Art',
    title: 'Geometric Mini Gallery & Diamond Photostands',
    subtitle: 'Modular hexagonal acrylic panels and crystal-clear photo blocks that turn your favorite snapshots into museum-grade art.',
    price: 'From ₹359',
    price_text: 'From ₹359',
    image: '/banners/hero_photostand.jpg',
    categoryLink: '/shop?category=photostand',
    link: '/shop?category=photostand',
    badge: 'Premium',
    button_text: 'Shop Gallery Blocks',
    gradient: 'from-emerald-500/20 via-primary-500/10 to-transparent'
  }
];

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'hero' ? 'hero' : 'hero';
  
  const [activeTab, setActiveTab] = useState<'hero' | 'fulfillment' | 'users'>(initialTab as any);

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // User Form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'superadmin' | 'admin' | 'operator'>('admin');
  const [password, setPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // Global Settings State
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Hero Slider Settings
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [heroAutoplay, setHeroAutoplay] = useState(true);
  const [heroInterval, setHeroInterval] = useState('5000');
  
  // Slide Edit / Create Modal
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Slide Form Fields
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideTag, setSlideTag] = useState('');
  const [slideBadge, setSlideBadge] = useState('');
  const [slidePrice, setSlidePrice] = useState('');
  const [slideImage, setSlideImage] = useState('');
  const [slideLink, setSlideLink] = useState('/shop');
  const [slideButtonText, setSlideButtonText] = useState('Customize Now');
  const [slideGradient, setSlideGradient] = useState('from-primary-500/20 via-primary-500/10 to-transparent');

  // Store Configuration Settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('499');
  const [shippingFee, setShippingFee] = useState('49');
  const [supportPhone, setSupportPhone] = useState('+91 99999 88888');
  const [supportEmail, setSupportEmail] = useState('hello@ebanzo.com');
  const [storeGst, setStoreGst] = useState('07AAAAA0000A1Z5');

  // Load Settings & Users on mount
  useEffect(() => {
    // 1. Load Admin Settings
    setLoadingSettings(true);
    fetchAdminSettings().then((s) => {
      if (s) {
        if (s.hero_slides) {
          try {
            const parsed = typeof s.hero_slides === 'string' ? JSON.parse(s.hero_slides) : s.hero_slides;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
            }
          } catch (e) {
            console.warn('Could not parse hero_slides from backend:', e);
          }
        }
        if (s.hero_slider_autoplay !== undefined) {
          setHeroAutoplay(s.hero_slider_autoplay === 'true' || s.hero_slider_autoplay === true);
        }
        if (s.hero_slider_interval) {
          setHeroInterval(String(s.hero_slider_interval));
        }
        if (s.free_shipping_threshold) setFreeShippingThreshold(String(s.free_shipping_threshold));
        if (s.shipping_fee) setShippingFee(String(s.shipping_fee));
        if (s.support_phone) setSupportPhone(s.support_phone);
        if (s.support_email) setSupportEmail(s.support_email);
        if (s.store_gst) setStoreGst(s.store_gst);
      }
      setLoadingSettings(false);
    });

    // 2. Load Users
    setLoadingUsers(true);
    fetchAdminUsers().then((res) => {
      setUsers(res);
      setLoadingUsers(false);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // ----------------------------------------------------
  // HERO SLIDE ACTIONS
  // ----------------------------------------------------

  const openSlideModal = (index?: number) => {
    if (index !== undefined && index >= 0 && index < slides.length) {
      const s = slides[index];
      setEditingSlideIndex(index);
      setSlideTitle(s.title || '');
      setSlideSubtitle(s.subtitle || '');
      setSlideTag(s.tag || 'Trending • Pan-India Favorite');
      setSlideBadge(s.badge || 'Featured');
      setSlidePrice(s.price_text || s.price || '');
      setSlideImage(s.image || '');
      setSlideLink(s.categoryLink || s.link || '/shop');
      setSlideButtonText(s.button_text || 'Customize Now');
      setSlideGradient(s.gradient || 'from-primary-500/20 via-primary-500/10 to-transparent');
    } else {
      setEditingSlideIndex(null);
      setSlideTitle('');
      setSlideSubtitle('');
      setSlideTag('New Collection');
      setSlideBadge('Special Offer');
      setSlidePrice('Starting at ₹299');
      setSlideImage('');
      setSlideLink('/shop');
      setSlideButtonText('Customize Now');
      setSlideGradient('from-primary-500/20 via-primary-500/10 to-transparent');
    }
    setSlideModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadAdminPhoto(file);
      setSlideImage(uploadedUrl);
      showToast('Image uploaded successfully to server!');
    } catch (err: any) {
      alert('Upload failed: ' + (err?.message || 'Server error'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImage) {
      alert('Please upload or provide an image URL for the slide.');
      return;
    }

    const updatedSlide: HeroSlide = {
      title: slideTitle,
      subtitle: slideSubtitle,
      tag: slideTag,
      badge: slideBadge,
      price: slidePrice,
      price_text: slidePrice,
      image: slideImage,
      categoryLink: slideLink,
      link: slideLink,
      button_text: slideButtonText,
      gradient: slideGradient,
    };

    if (editingSlideIndex !== null) {
      const newSlides = [...slides];
      newSlides[editingSlideIndex] = updatedSlide;
      setSlides(newSlides);
      showToast('Slide updated in list. Click "Save Hero Settings" to commit changes.');
    } else {
      setSlides([...slides, updatedSlide]);
      showToast('New slide added to list. Click "Save Hero Settings" to commit changes.');
    }

    setSlideModalOpen(false);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert('You must have at least one hero slide.');
      return;
    }
    if (confirm(`Are you sure you want to delete slide "${slides[index]?.title}"?`)) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      showToast('Slide removed. Click "Save Hero Settings" to commit changes.');
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    setSlides(newSlides);
  };

  // Save All Hero Settings to Database
  const handleSaveAllHeroSettings = async () => {
    setSavingSettings(true);
    try {
      await saveAdminSettings({
        hero_mode: 'slider',
        hero_slider_autoplay: heroAutoplay ? 'true' : 'false',
        hero_slider_interval: heroInterval,
        hero_slides: JSON.stringify(slides),
      });
      showToast('Hero slider banners & configuration saved live!');
    } catch (err) {
      alert('Failed to save settings: ' + err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Save Storefront Fulfillment Settings
  const handleSaveStoreConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveAdminSettings({
        free_shipping_threshold: freeShippingThreshold,
        shipping_fee: shippingFee,
        support_phone: supportPhone,
        support_email: supportEmail,
        store_gst: storeGst,
      });
      showToast('Store fulfillment parameters saved!');
    } catch (err) {
      alert('Failed to save fulfillment settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Admin User Actions
  const openUserModal = (u?: AdminUser) => {
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setUsername(u.username);
      setRole(u.role);
      setPassword('');
    } else {
      setEditingUser(null);
      setName('');
      setUsername('');
      setRole('admin');
      setPassword('');
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    const payload = { name, username, role, password: password || undefined };
    await saveAdminUser(payload, editingUser?.id);
    setSavingUser(false);
    setUserModalOpen(false);
    showToast(editingUser ? 'User credentials updated!' : 'New administrator created!');
    fetchAdminUsers().then((res) => setUsers(res));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Storefront Customization & Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Studio Settings & Hero Slider Manager
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage homepage promotional slider banners, store shipping rates, and administrator accounts
          </p>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-950/90 border border-emerald-500/40 p-4 text-xs font-bold text-emerald-200 flex items-center gap-2.5 shadow-xl animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'hero'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-950/40'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Hero Banners & Slider ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fulfillment')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'fulfillment'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-950/40'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Store Fulfillment & Helplines</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-950/40'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Admin Team & Roles ({users.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: HERO SLIDER & BANNERS MANAGEMENT */}
      {/* ==================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Slider Global Control Card */}
          <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  <span>Homepage Slider Parameters</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Configure slider autoplay, speed intervals, and upload promotional banners
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openSlideModal()}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 shadow-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Slide</span>
                </button>

                <button
                  onClick={handleSaveAllHeroSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Live Changes'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Auto-play Slides</span>
                  <span className="text-[11px] text-stone-400 block">Rotate slides automatically</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heroAutoplay}
                    onChange={(e) => setHeroAutoplay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
                <label className="font-bold text-white block mb-1">Slide Rotation Duration</label>
                <select
                  value={heroInterval}
                  onChange={(e) => setHeroInterval(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-1.5 text-xs text-white"
                >
                  <option value="3000">3 Seconds (Fast)</option>
                  <option value="4000">4 Seconds</option>
                  <option value="5000">5 Seconds (Recommended)</option>
                  <option value="7000">7 Seconds</option>
                  <option value="10000">10 Seconds (Relaxed)</option>
                </select>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Active Slides Count</span>
                  <span className="text-[11px] text-stone-400 block">{slides.length} slides currently active</span>
                </div>
                <span className="text-xl font-black text-primary-400">{slides.length}</span>
              </div>
            </div>
          </div>

          {/* Slide Cards List */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-stone-300 uppercase tracking-wider">
              Active Slides ({slides.length}) — Drag / Reorder & Edit
            </h3>

            {slides.map((s, idx) => (
              <div 
                key={idx}
                className="rounded-3xl border border-stone-800 bg-stone-950 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-stone-700 hover:shadow-xl"
              >
                {/* Left Preview & Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Order Index & Reorder Controls */}
                  <div className="flex flex-col items-center gap-1 text-stone-500">
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-stone-800 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-black text-primary-400">#{idx + 1}</span>
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === slides.length - 1}
                      className="p-1 rounded hover:bg-stone-800 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/frames/fridge-magnet/1_nos_a.png';
                      }}
                    />
                    {s.badge && (
                      <span className="absolute top-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-extrabold text-primary-300 border border-white/10">
                        {s.badge}
                      </span>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider truncate">
                        {s.tag || 'Slide Tag'}
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-base text-white truncate">
                      {s.title}
                    </h4>
                    <p className="text-xs text-stone-400 line-clamp-1">
                      {s.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-500 font-medium">
                      <span className="text-primary-300 font-bold">{s.price_text || s.price || 'Special Edition'}</span>
                      <span>•</span>
                      <span className="truncate max-w-[180px] font-mono">{s.categoryLink || s.link || '/shop'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => openSlideModal(idx)}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs font-bold text-stone-200 hover:bg-stone-800 hover:text-white transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Slide</span>
                  </button>

                  <button
                    onClick={() => handleDeleteSlide(idx)}
                    className="p-2 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition-colors"
                    title="Delete slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Reminder */}
          <div className="rounded-2xl border border-primary-500/30 bg-primary-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary-400 flex-shrink-0" />
              <p className="text-xs text-primary-200 font-medium">
                Changes made to slides or order will appear on the homepage once saved.
              </p>
            </div>
            <button
              onClick={handleSaveAllHeroSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-500 shadow-md transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Save className="h-4 w-4" />
              <span>{savingSettings ? 'Saving...' : 'Save All Hero Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: STORE FULFILLMENT & HELPLINES */}
      {/* ==================================================== */}
      {activeTab === 'fulfillment' && (
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-5 animate-fadeIn">
          <div className="pb-3 border-b border-stone-800">
            <h3 className="font-bold text-base text-white">Storefront Fulfillment Parameters</h3>
            <p className="text-xs text-stone-400">Shipping thresholds, taxes, and customer helpline configurations</p>
          </div>

          <form onSubmit={handleSaveStoreConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-300 mb-1">Free Shipping Cart Minimum (₹)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Support Helpline WhatsApp / Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-300 mb-1">Studio GST Number</label>
              <input
                type="text"
                value={storeGst}
                onChange={(e) => setStoreGst(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="rounded-xl bg-primary-600 px-6 py-2.5 font-bold text-white hover:bg-primary-500 shadow-md transition-colors"
              >
                {savingSettings ? 'Saving...' : 'Save Store Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: ADMIN ACCOUNTS & ROLES */}
      {/* ==================================================== */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div>
              <h3 className="font-bold text-base text-white">Administrator Accounts</h3>
              <p className="text-xs text-stone-400">Authorized operator logins with role-based access</p>
            </div>

            <button
              onClick={() => openUserModal()}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-500 shadow-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Admin User</span>
            </button>
          </div>

          {loadingUsers ? (
            <div className="flex h-32 items-center justify-center">
              <RefreshCw className="h-6 w-6 text-primary-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                  <tr>
                    <th className="pb-3">Admin Name</th>
                    <th className="pb-3">Login Username / Email</th>
                    <th className="pb-3">Role Permission</th>
                    <th className="pb-3">Created Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary-950/80 border border-primary-500/30 flex items-center justify-center font-bold text-primary-300 text-xs">
                            {u.name ? u.name[0].toUpperCase() : 'A'}
                          </div>
                          <span className="font-bold text-white">{u.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 font-mono text-stone-300">
                        {u.username}
                      </td>

                      <td className="py-3.5">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === 'superadmin'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                            : u.role === 'admin'
                            ? 'bg-primary-950/60 text-primary-300 border border-primary-500/30'
                            : 'bg-stone-900 text-stone-400 border border-stone-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 text-stone-400 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Initial Seed'}
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => openUserModal(u)}
                          className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                          title="Edit user & password"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT HERO SLIDE */}
      {/* ==================================================== */}
      {slideModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingSlideIndex !== null ? `Edit Slide #${editingSlideIndex + 1}` : 'Add New Hero Slide'}
                </h3>
                <p className="text-xs text-stone-400">Upload banner image and configure texts and links</p>
              </div>
              <button
                onClick={() => setSlideModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlideForm} className="space-y-4 py-4 text-xs">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-300">
                  Slide Banner Image *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Preview Box */}
                  <div className="sm:col-span-4 relative aspect-video sm:aspect-square rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden flex items-center justify-center">
                    {slideImage ? (
                      <img src={slideImage} alt="Slide preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-3 text-stone-500">
                        <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No image selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <label className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 font-bold text-white hover:bg-primary-500 cursor-pointer shadow-md transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Supports JPG, PNG, WebP (Recommended: 1200x800 or high-res square)
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">
                        Or enter Image URL path directly:
                      </label>
                      <input
                        type="text"
                        value={slideImage}
                        onChange={(e) => setSlideImage(e.target.value)}
                        placeholder="https://... or /frames/fridge-magnet/1_nos_a.png"
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-300 mb-1">Main Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    placeholder="e.g. Laser Cut Fridge Magnets"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-300 mb-1">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={slideSubtitle}
                    onChange={(e) => setSlideSubtitle(e.target.value)}
                    placeholder="e.g. From wavy artistic contours to floral and geometric shapes..."
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Top Tag Text</label>
                  <input
                    type="text"
                    value={slideTag}
                    onChange={(e) => setSlideTag(e.target.value)}
                    placeholder="e.g. Trending • Pan-India Favorite"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Badge Highlight</label>
                  <input
                    type="text"
                    value={slideBadge}
                    onChange={(e) => setSlideBadge(e.target.value)}
                    placeholder="e.g. Best Seller, New Launch, 50% Off"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Price / Special Offer Text</label>
                  <input
                    type="text"
                    value={slidePrice}
                    onChange={(e) => setSlidePrice(e.target.value)}
                    placeholder="e.g. Starting at ₹199"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Primary Button Text</label>
                  <input
                    type="text"
                    value={slideButtonText}
                    onChange={(e) => setSlideButtonText(e.target.value)}
                    placeholder="e.g. Customize Now"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-300 mb-1">Target Destination URL / Link</label>
                  <input
                    type="text"
                    value={slideLink}
                    onChange={(e) => setSlideLink(e.target.value)}
                    placeholder="e.g. /shop?category=fridge-magnet or /shop"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setSlideModalOpen(false)}
                  className="rounded-xl bg-stone-800 px-4 py-2 text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-500 shadow-md"
                >
                  {editingSlideIndex !== null ? 'Update Slide' : 'Add Slide to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ADD / EDIT ADMIN USER */}
      {/* ==================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="text-lg font-black text-white">
                {editingUser ? 'Edit Administrator' : 'Create Admin User'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Username / Email *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@ebanzo.com"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Role Permission</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-semibold"
                >
                  <option value="superadmin">Superadmin (All Permissions)</option>
                  <option value="admin">Admin (Catalog, Orders, Inventory)</option>
                  <option value="operator">Operator (Print Queue & Orders Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  {editingUser ? 'New Password (Leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="rounded-xl bg-stone-800 px-4 py-2 text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="rounded-xl bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-500 disabled:opacity-60 shadow-md"
                >
                  {savingUser ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="text-stone-400 text-xs p-6">Loading studio configurations...</div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}
