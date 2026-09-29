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
  fetchAdminSettings, saveAdminSettings, uploadAdminPhoto, fetchAdminCategories, fetchAdminProducts, AdminProduct
} from '@/lib/admin-api';
import { Category, HeroSlide, heroSlideLink } from '@/lib/api';

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    tag: 'Trending • Pan-India Favorite',
    title: 'Bespoke Acrylic Fridge Magnets',
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
    subtitle: 'Handcrafted fun caricatures on crystal-clear acrylic with smooth polished edges and natural wood base.',
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
  // Two hero styles, each with its own slides: "slider" = classic split-card slider,
  // "banner" = full-width image slider. The list and editor below work on the selected style.
  const [heroMode, setHeroMode] = useState<'slider' | 'banner'>('slider');
  const [classicSlides, setClassicSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [bannerSlides, setBannerSlides] = useState<HeroSlide[]>([]);
  const isBanner = heroMode === 'banner';
  const slides = isBanner ? bannerSlides : classicSlides;
  const setSlides = isBanner ? setBannerSlides : setClassicSlides;
  // Link pickers in the slide editor
  const [linkCategories, setLinkCategories] = useState<Category[]>([]);
  const [linkProducts, setLinkProducts] = useState<AdminProduct[]>([]);
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
  const [slideLinkType, setSlideLinkType] = useState<'category' | 'product' | 'custom'>('custom');
  const [slideCategorySlug, setSlideCategorySlug] = useState('');
  const [slideProductSlug, setSlideProductSlug] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [slideMobileImage, setSlideMobileImage] = useState('');
  const [slideTextAlign, setSlideTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [slideTextColor, setSlideTextColor] = useState<'light' | 'dark'>('light');
  const [slideOverlay, setSlideOverlay] = useState(true);
  const [slideSecondaryText, setSlideSecondaryText] = useState('');
  const [slideSecondaryLink, setSlideSecondaryLink] = useState('');
  const [uploadingMobileImage, setUploadingMobileImage] = useState(false);

  // Store Configuration Settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('0');
  const [shippingFee, setShippingFee] = useState('0');
  const [supportPhone, setSupportPhone] = useState('+91 99999 88888');
  const [supportEmail, setSupportEmail] = useState('hello@ebanzo.com');
  const [storeGst, setStoreGst] = useState('07AAAAA0000A1Z5');

  // Customization pricing rules (used by Fridge Magnet sets & Dual-Side printing)
  const [magnetSet6Multiplier, setMagnetSet6Multiplier] = useState('1.4');
  const [magnetSet8Multiplier, setMagnetSet8Multiplier] = useState('1.8');
  const [dualSideSurcharge, setDualSideSurcharge] = useState('49');
  const [galleryFrameCounts, setGalleryFrameCounts] = useState('2,3,4,5,6,8');
  const [galleryBaseFrames, setGalleryBaseFrames] = useState('4');
  const [galleryPerFramePrice, setGalleryPerFramePrice] = useState('99');

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
              setClassicSlides(parsed);
            }
          } catch (e) {
            console.warn('Could not parse hero_slides from backend:', e);
          }
        }
        if (s.hero_banner_slides) {
          try {
            const parsed = typeof s.hero_banner_slides === 'string' ? JSON.parse(s.hero_banner_slides) : s.hero_banner_slides;
            if (Array.isArray(parsed)) setBannerSlides(parsed);
          } catch (e) {
            console.warn('Could not parse hero_banner_slides from backend:', e);
          }
        }
        setHeroMode(s.hero_mode === 'banner' ? 'banner' : 'slider');
        if (s.hero_slider_autoplay !== undefined) {
          setHeroAutoplay(s.hero_slider_autoplay === 'true' || s.hero_slider_autoplay === true);
        }
        if (s.hero_slider_interval) {
          setHeroInterval(String(s.hero_slider_interval));
        }
        if (s.free_shipping_threshold !== undefined) setFreeShippingThreshold(String(s.free_shipping_threshold));
        if (s.shipping_fee !== undefined) setShippingFee(String(s.shipping_fee));
        if (s.magnet_set6_multiplier) setMagnetSet6Multiplier(String(s.magnet_set6_multiplier));
        if (s.magnet_set8_multiplier) setMagnetSet8Multiplier(String(s.magnet_set8_multiplier));
        if (s.dual_side_surcharge !== undefined) setDualSideSurcharge(String(s.dual_side_surcharge));
        if (s.mini_gallery_frame_counts) setGalleryFrameCounts(String(s.mini_gallery_frame_counts));
        if (s.mini_gallery_base_frames) setGalleryBaseFrames(String(s.mini_gallery_base_frames));
        if (s.mini_gallery_per_frame_price !== undefined) setGalleryPerFramePrice(String(s.mini_gallery_per_frame_price));
        if (s.support_phone) setSupportPhone(s.support_phone);
        if (s.support_email) setSupportEmail(s.support_email);
        if (s.store_gst) setStoreGst(s.store_gst);
      }
      setLoadingSettings(false);
    });

    // Categories & products for the slide link pickers
    fetchAdminCategories().then(setLinkCategories).catch(() => {});
    fetchAdminProducts().then(setLinkProducts).catch(() => {});

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
      setSlideLinkType(s.link_type || 'custom');
      setSlideCategorySlug(s.category_slug || '');
      setSlideProductSlug(s.product_slug || '');
      setSlideMobileImage(s.mobile_image || '');
      setSlideTextAlign(s.text_align || 'left');
      setSlideTextColor(s.text_color || 'light');
      setSlideOverlay(s.overlay ?? true);
      setSlideSecondaryText(s.secondary_button_text || '');
      setSlideSecondaryLink(s.secondary_button_link || '');
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
      setSlideLinkType('category');
      setSlideCategorySlug('');
      setSlideProductSlug('');
      setSlideMobileImage('');
      setSlideTextAlign('left');
      setSlideTextColor('light');
      setSlideOverlay(true);
      setSlideSecondaryText('');
      setSlideSecondaryLink('');
      if (isBanner) {
        setSlideTag('');
        setSlideBadge('');
        setSlidePrice('');
        setSlideButtonText('Shop Now');
      }
    }
    setProductSearch('');
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

    if (slideLinkType === 'category' && !slideCategorySlug) {
      alert('Please choose the category this slide links to.');
      return;
    }
    if (slideLinkType === 'product' && !slideProductSlug) {
      alert('Please choose the product this slide links to.');
      return;
    }

    const linkFields: HeroSlide = {
      title: '', subtitle: '', image: '',
      link_type: slideLinkType,
      category_slug: slideLinkType === 'category' ? slideCategorySlug : undefined,
      product_slug: slideLinkType === 'product' ? slideProductSlug : undefined,
      link: slideLink,
    };
    const resolvedLink = heroSlideLink(linkFields);

    const updatedSlide: HeroSlide = {
      title: slideTitle,
      subtitle: slideSubtitle,
      tag: slideTag,
      badge: slideBadge,
      price: slidePrice,
      price_text: slidePrice,
      image: slideImage,
      categoryLink: resolvedLink,
      link: resolvedLink,
      link_type: linkFields.link_type,
      category_slug: linkFields.category_slug,
      product_slug: linkFields.product_slug,
      button_text: slideButtonText,
      gradient: slideGradient,
      secondary_button_text: slideSecondaryText.trim() || undefined,
      secondary_button_link: slideSecondaryText.trim() ? slideSecondaryLink.trim() || '/shop' : undefined,
      ...(isBanner
        ? { mobile_image: slideMobileImage || undefined, text_align: slideTextAlign, text_color: slideTextColor, overlay: slideOverlay }
        : {}),
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
    if (!isBanner && slides.length <= 1) {
      alert('You must have at least one hero slide.');
      return;
    }
    if (confirm(`Are you sure you want to delete slide "${slides[index]?.title || `#${index + 1}`}"?`)) {
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
        hero_mode: heroMode,
        hero_slider_autoplay: heroAutoplay ? 'true' : 'false',
        hero_slider_interval: heroInterval,
        hero_slides: JSON.stringify(classicSlides),
        hero_banner_slides: JSON.stringify(bannerSlides),
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
        magnet_set6_multiplier: magnetSet6Multiplier,
        magnet_set8_multiplier: magnetSet8Multiplier,
        dual_side_surcharge: dualSideSurcharge,
        mini_gallery_frame_counts: galleryFrameCounts,
        mini_gallery_base_frames: galleryBaseFrames,
        mini_gallery_per_frame_price: galleryPerFramePrice,
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
          {/* Hero style: which hero the homepage shows */}
          <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary-400" />
              <span>Hero Style</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 mb-4">
              Pick the hero shown on the homepage. Each style keeps its own slides — switch to edit them, then save.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { id: 'slider', name: 'Classic Split Slider', desc: 'Text on the left, product photo card on the right.', count: classicSlides.length },
                { id: 'banner', name: 'Full-Width Image Slider', desc: 'Edge-to-edge banner images with text, buttons and an optional product card.', count: bannerSlides.length },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHeroMode(opt.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    heroMode === opt.id ? 'border-primary-500 bg-primary-950/40 ring-1 ring-primary-500/50' : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                  }`}
                >
                  {/* Mini layout sketch */}
                  <div className="mb-3 flex h-16 overflow-hidden rounded-lg border border-stone-700 bg-stone-800">
                    {opt.id === 'slider' ? (
                      <div className="flex w-full items-center gap-2 p-2">
                        <div className="flex-1 space-y-1">
                          <div className="h-2 w-3/4 rounded bg-stone-500" />
                          <div className="h-1.5 w-1/2 rounded bg-stone-600" />
                          <div className="h-2.5 w-1/3 rounded-full bg-primary-500" />
                        </div>
                        <div className="h-12 w-12 rounded-md bg-stone-600" />
                      </div>
                    ) : (
                      <div className="relative w-full bg-gradient-to-br from-stone-500 to-stone-700">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 space-y-1">
                          <div className="h-2 w-16 rounded bg-white/80" />
                          <div className="h-2.5 w-10 rounded-full bg-primary-500" />
                        </div>
                        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                          <span className="h-1 w-3 rounded-full bg-white" />
                          <span className="h-1 w-1 rounded-full bg-white/60" />
                          <span className="h-1 w-1 rounded-full bg-white/60" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                    {heroMode === opt.id && (
                      <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">Selected</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-400">{opt.desc}</p>
                  <p className="mt-1 text-[10px] font-bold text-stone-500">{opt.count} slide{opt.count === 1 ? '' : 's'}</p>
                </button>
              ))}
            </div>
            {isBanner && bannerSlides.length === 0 && (
              <p className="mt-3 rounded-xl bg-amber-950/60 px-3 py-2 text-[11px] font-semibold text-amber-200">
                Add at least one slide — until then the homepage keeps showing the classic slider.
              </p>
            )}
          </div>

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
              {isBanner ? 'Full-Width Image Slider' : 'Classic Split Slider'} — Slides ({slides.length})
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
                  <div className={`relative h-20 sm:h-24 rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden flex-shrink-0 flex items-center justify-center ${isBanner ? 'w-36 sm:w-44' : 'w-20 sm:w-24'}`}>
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
                      {s.title || <span className="text-stone-500 italic">Image only (no text)</span>}
                    </h4>
                    <p className="text-xs text-stone-400 line-clamp-1">
                      {s.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-500 font-medium">
                      <span className="text-primary-300 font-bold">{s.price_text || s.price || 'Special Edition'}</span>
                      <span>•</span>
                      <span className="truncate max-w-[220px]">
                        {s.link_type === 'product'
                          ? `Product: ${linkProducts.find((p) => p.slug === s.product_slug)?.title || s.product_slug}`
                          : s.link_type === 'category'
                          ? `Category: ${linkCategories.find((c) => c.slug === s.category_slug)?.name || s.category_slug}`
                          : <span className="font-mono">{s.categoryLink || s.link || '/shop'}</span>}
                      </span>
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
              <p className="mt-1 text-[10px] text-stone-500">0 = ignored (shipping fee below decides everything)</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">0 = 100% free shipping on every order, regardless of cart minimum</p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-stone-800">
              <h4 className="font-bold text-white text-xs mb-0.5">Customization Pricing Rules</h4>
              <p className="text-[10px] text-stone-500 mb-3">Controls surcharge for Fridge Magnet packs and Dual-Side printing across the whole site — no code changes needed to adjust these.</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Fridge Magnet — Set of 6 Price Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={magnetSet6Multiplier}
                onChange={(e) => setMagnetSet6Multiplier(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">e.g. 1.4 = Set of 6 costs 1.4× the base (Set of 4) price</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Fridge Magnet — Set of 8 Price Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={magnetSet8Multiplier}
                onChange={(e) => setMagnetSet8Multiplier(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">e.g. 1.8 = Set of 8 costs 1.8× the base (Set of 4) price</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Dual-Side Print Surcharge (₹)</label>
              <input
                type="number"
                value={dualSideSurcharge}
                onChange={(e) => setDualSideSurcharge(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">Added to Car Stand / Car Hanging / Keychain price when a customer picks Dual-Side printing</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Mini Gallery — Frame Count Options</label>
              <input
                type="text"
                value={galleryFrameCounts}
                onChange={(e) => setGalleryFrameCounts(e.target.value)}
                placeholder="2,3,4,5,6,8"
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">Comma-separated choices customers see, e.g. 3,4,5,6 (1–12)</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Mini Gallery — Frames Included in Product Price</label>
              <input
                type="number"
                min="1"
                value={galleryBaseFrames}
                onChange={(e) => setGalleryBaseFrames(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">e.g. 4 = the product&apos;s listed price is for 4 frames</p>
            </div>

            <div>
              <label className="block font-bold text-stone-300 mb-1">Mini Gallery — Price per Extra Frame (₹)</label>
              <input
                type="number"
                min="0"
                value={galleryPerFramePrice}
                onChange={(e) => setGalleryPerFramePrice(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-white"
              />
              <p className="mt-1 text-[10px] text-stone-500">Added for each frame above the included count, and taken off for each frame below it</p>
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
                <p className="text-xs text-stone-400">
                  {isBanner ? 'Full-Width Image Slider' : 'Classic Split Slider'} — image, texts and what the slide links to
                </p>
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
                        {isBanner
                          ? 'Wide banner — recommended 1920×840 (desktop). Keep the main subject away from the text side.'
                          : 'Supports JPG, PNG, WebP (Recommended: 1200x800 or high-res square)'}
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

              {isBanner && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-300">Mobile Image (optional, portrait 1080×1350)</label>
                  <div className="flex items-center gap-3">
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
                      {slideMobileImage ? (
                        <img src={slideMobileImage} alt="Mobile preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-stone-600"><ImageIcon className="h-5 w-5" /></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-stone-800 px-3 py-2 font-bold text-white hover:bg-stone-700">
                        <Upload className="h-4 w-4" />
                        <span>{uploadingMobileImage ? 'Uploading…' : 'Upload Mobile Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingMobileImage}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setUploadingMobileImage(true);
                            try {
                              setSlideMobileImage(await uploadAdminPhoto(f));
                            } catch (err) {
                              alert('Upload failed: ' + (err instanceof Error ? err.message : 'Server error'));
                            } finally {
                              setUploadingMobileImage(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={slideMobileImage}
                        onChange={(e) => setSlideMobileImage(e.target.value)}
                        placeholder="Empty = the desktop image is cropped for phones"
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-300 mb-1">
                    Main Headline / Title {isBanner ? <span className="font-normal text-stone-500">(optional — leave all texts empty for an image-only banner)</span> : '*'}
                  </label>
                  <input
                    type="text"
                    required={!isBanner}
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

                {/* What the slide links to */}
                <div className="sm:col-span-2 rounded-2xl border border-stone-800 bg-stone-950/60 p-3 space-y-3">
                  <label className="block font-bold text-stone-300">Slide Links To</label>
                  <div className="flex gap-1 rounded-xl bg-stone-900 p-1">
                    {([
                      { id: 'category', label: 'Category' },
                      { id: 'product', label: 'Product' },
                      { id: 'custom', label: 'Custom URL' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSlideLinkType(t.id)}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          slideLinkType === t.id ? 'bg-primary-600 text-white' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {slideLinkType === 'category' && (
                    <select
                      value={slideCategorySlug}
                      onChange={(e) => setSlideCategorySlug(e.target.value)}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                    >
                      <option value="">Choose a category…</option>
                      {linkCategories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.parent_id ? `— ${c.name}` : c.name} ({c.product_count ?? 0} products)
                        </option>
                      ))}
                    </select>
                  )}

                  {slideLinkType === 'product' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products…"
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                      />
                      <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-stone-800 p-1">
                        {linkProducts
                          .filter((p) => p.title.toLowerCase().includes(productSearch.trim().toLowerCase()))
                          .slice(0, 50)
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSlideProductSlug(p.slug)}
                              className={`flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors ${
                                slideProductSlug === p.slug ? 'bg-primary-600/30 ring-1 ring-primary-500' : 'hover:bg-stone-800'
                              }`}
                            >
                              <img src={p.image_url} alt="" className="h-8 w-8 flex-shrink-0 rounded-md bg-stone-800 object-contain" />
                              <span className="flex-1 truncate text-xs text-white">{p.title}</span>
                              <span className="text-[11px] font-bold text-stone-400">₹{Number(p.price)}</span>
                              {slideProductSlug === p.slug && <CheckCircle2 className="h-4 w-4 text-primary-400" />}
                            </button>
                          ))}
                      </div>
                      <p className="text-[10px] text-stone-500">
                        {isBanner
                          ? 'The banner shows a card with this product’s photo, price and a Customize button.'
                          : 'The slide’s buttons open this product.'}
                      </p>
                    </div>
                  )}

                  {slideLinkType === 'custom' && (
                    <input
                      type="text"
                      value={slideLink}
                      onChange={(e) => setSlideLink(e.target.value)}
                      placeholder="e.g. /shop?featured=1 or /pages/offers"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Second Button Text (optional)</label>
                  <input
                    type="text"
                    value={slideSecondaryText}
                    onChange={(e) => setSlideSecondaryText(e.target.value)}
                    placeholder="e.g. Explore Catalog"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Second Button Link</label>
                  <input
                    type="text"
                    value={slideSecondaryLink}
                    onChange={(e) => setSlideSecondaryLink(e.target.value)}
                    placeholder="/shop"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                {isBanner && (
                  <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block font-bold text-stone-300 mb-1">Text Position</label>
                      <select
                        value={slideTextAlign}
                        onChange={(e) => setSlideTextAlign(e.target.value as 'left' | 'center' | 'right')}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-stone-300 mb-1">Text Color</label>
                      <select
                        value={slideTextColor}
                        onChange={(e) => setSlideTextColor(e.target.value as 'light' | 'dark')}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-white"
                      >
                        <option value="light">White (for dark photos)</option>
                        <option value="dark">Dark (for light photos)</option>
                      </select>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 self-end">
                      <input type="checkbox" checked={slideOverlay} onChange={(e) => setSlideOverlay(e.target.checked)} className="accent-primary-600" />
                      <span className="text-stone-300">Shade behind text</span>
                    </label>
                  </div>
                )}
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
