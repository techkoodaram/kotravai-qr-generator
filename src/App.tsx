import React, { useState, useRef, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  QrCode,
  Download,
  ArrowLeft,
  ShieldCheck,
  Package,
  MapPin,
  Info,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Globe,
  ChevronDown,
  Check,
  Truck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface LogisticsEvent {
  id: string;
  status: string;
  location: string;
  date: string;
}

interface ExternalIngredient {
  id: string;
  name: string;
  origin: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  origin: string;
  detailedOrigin: string;
  countryCode: string;
  producedDate: string;
  description: string;
  imageUrl: string;
  ingredientIds: string[];
  externalIngredients: ExternalIngredient[];
  logistics: LogisticsEvent[];
}

// --- Initial Dummy Data ---

const INITIAL_CATEGORIES = ['Food', 'Textiles', 'Spices', 'Handicrafts'];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Puliyankudi Acid Lime',
    category: 'Food',
    origin: 'India',
    detailedOrigin: 'Lemon City, Puliyankudi',
    countryCode: 'IN',
    producedDate: '2026-02-10',
    description: 'World-famous acid limes from the heart of Puliyankudi, known for high juice content and aroma.',
    imageUrl: 'https://images.unsplash.com/photo-1590505680514-633045625ff1?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext1', name: 'Natural Fertilizer', origin: 'Regional Cattle Farm' }
    ],
    logistics: [
      { id: 'l1', status: 'Harvested', location: 'Puliyankudi Farm', date: '2026-02-10' },
      { id: 'l2', status: 'Sorting', location: 'Puliyankudi Market', date: '2026-02-11' },
      { id: 'l3', status: 'Certified', location: 'Aathi Regional Lab', date: '2026-02-12' }
    ]
  },
  {
    id: '2',
    name: 'Courtallam Wild Honey',
    category: 'Food',
    origin: 'India',
    detailedOrigin: 'Main Falls Region, Courtallam',
    countryCode: 'IN',
    producedDate: '2026-01-20',
    description: 'Pure forest honey collected from the medicinal trees of Western Ghats near Courtallam falls.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext2', name: 'Wild Bee Pollen', origin: 'Western Ghats' }
    ],
    logistics: [
      { id: 'l4', status: 'Collected', location: 'Courtallam Forest', date: '2026-01-20' },
      { id: 'l5', status: 'Quality Assured', location: 'Tenkasi Center', date: '2026-01-25' }
    ]
  },
  {
    id: '3',
    name: 'Tenkasi Palm Jaggery',
    category: 'Food',
    origin: 'India',
    detailedOrigin: 'Tirunelveli-Tenkasi Belt',
    countryCode: 'IN',
    producedDate: '2026-02-05',
    description: 'Traditional Karuppatti made from palm nectar, rich in minerals and free from chemicals.',
    imageUrl: 'https://images.unsplash.com/photo-1610450531505-1a86851b474e?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext3', name: 'Palm Nectar', origin: 'Tenkasi Groves' }
    ],
    logistics: [
      { id: 'l6', status: 'Extraction', location: 'Tenkasi Village', date: '2026-02-05' },
      { id: 'l7', status: 'Traditional Boiling', location: 'Local Unit', date: '2026-02-06' }
    ]
  },
  {
    id: '4',
    name: 'Courtallam Herbal Spice Mix',
    category: 'Spices',
    origin: 'India',
    detailedOrigin: 'Shenkottai Hills',
    countryCode: 'IN',
    producedDate: '2026-02-15',
    description: 'A blend of spices grown in the mineral-rich soil of Shenkottai and Courtallam hills.',
    imageUrl: 'https://images.unsplash.com/photo-1532336414038-cf19210281b7?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext4', name: 'Black Pepper', origin: 'Shenkottai' },
      { id: 'ext5', name: 'Cardamom', origin: 'Achankovil Range' }
    ],
    logistics: [
      { id: 'l8', status: 'Harvested', location: 'Hill Estate', date: '2026-02-15' },
      { id: 'l9', status: 'Processing', location: 'Shenkottai Unit', date: '2026-02-18' }
    ]
  },
  {
    id: '5',
    name: 'Sankarankovil Silk Saree',
    category: 'Textiles',
    origin: 'India',
    detailedOrigin: 'Sankarankovil Weaving Cluster',
    countryCode: 'IN',
    producedDate: '2026-01-10',
    description: 'Authentic hand-woven silk saree from the heritage weaving clusters of Sankarankovil.',
    imageUrl: 'https://images.unsplash.com/photo-1610030469618-d06900ba458a?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext6', name: 'Pure Silk Yarn', origin: 'Kanchipuram' },
      { id: 'ext7', name: 'Zari', origin: 'Surat' }
    ],
    logistics: [
      { id: 'l10', status: 'Weaving Started', location: 'Sankarankovil Loom', date: '2025-12-15' },
      { id: 'l11', status: 'Finished', location: 'Master Weaver Unit', date: '2026-01-10' }
    ]
  },
  {
    id: '6',
    name: 'Handmade Copper Vessel',
    category: 'Handicrafts',
    origin: 'India',
    detailedOrigin: 'Tenkasi Artisans Lab',
    countryCode: 'IN',
    producedDate: '2026-01-01',
    description: 'Traditional copper vessel handcrafted by Tenkasi artisans, known for health benefits.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext8', name: 'Pure Copper', origin: 'Jhunjhunu' }
    ],
    logistics: [
      { id: 'l12', status: 'Forging', location: 'Tenkasi Workshop', date: '2026-01-01' }
    ]
  }
];

// --- Components ---

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-stone-200/70 shadow-sm"
        : "bg-white border-b border-stone-100"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 group">
            <span className="text-2xl font-bold text-green-800 tracking-tight transition-transform group-hover:scale-105">ஆதி</span>
            <span className="w-px h-5 bg-stone-200" />
            <span className="text-sm font-semibold text-stone-700 uppercase tracking-[0.15em]">Aathi</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-stone-500 hover:text-green-800 hover:bg-green-50 rounded-xl font-medium transition-all text-sm">Home</Link>
            <a href="/#features" className="px-4 py-2 text-stone-500 hover:text-green-800 hover:bg-green-50 rounded-xl font-medium transition-all text-sm">Features</a>
            <a href="/#pricing" className="px-4 py-2 text-stone-500 hover:text-green-800 hover:bg-green-50 rounded-xl font-medium transition-all text-sm">Pricing</a>
            <Link to="/admin" className="ml-3 btn-brand px-5 py-2.5 text-sm flex items-center gap-2">
              <Sparkles size={15} />
              Console
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2.5 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden animate-in fade-in slide-up border-t border-stone-100 bg-white/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 hover:bg-green-50 hover:text-green-800 font-medium transition-all">Home</Link>
            <a href="/#features" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 hover:bg-green-50 hover:text-green-800 font-medium transition-all">Features</a>
            <a href="/#pricing" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 hover:bg-green-50 hover:text-green-800 font-medium transition-all">Pricing</a>
            <Link to="/admin" onClick={() => setOpen(false)} className="mt-2 btn-brand px-5 py-3 text-center flex items-center justify-center gap-2">
              <Sparkles size={16} />
              Open Console
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const AdminPanel = ({
  products,
  setProducts,
  categories,
  setCategories
}: {
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  categories: string[],
  setCategories: React.Dispatch<React.SetStateAction<string[]>>
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: categories[0] || 'Food',
    origin: 'India',
    detailedOrigin: '',
    countryCode: 'IN',
    producedDate: new Date().toISOString().split('T')[0],
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1590505680514-633045625ff1?auto=format&fit=crop&q=80&w=800',
    ingredientIds: [],
    externalIngredients: [],
    logistics: []
  });

  const [tempLogistics, setTempLogistics] = useState<Omit<LogisticsEvent, 'id'>>({
    status: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [tempExternal, setTempExternal] = useState<Omit<ExternalIngredient, 'id'>>({
    name: '',
    origin: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProducts([newProduct, ...products]);
    setCurrentView('list');
    setFormData({
      name: '',
      category: categories[0] || 'Food',
      origin: 'India',
      detailedOrigin: '',
      countryCode: 'IN',
      producedDate: new Date().toISOString().split('T')[0],
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1590505680514-633045625ff1?auto=format&fit=crop&q=80&w=800',
      ingredientIds: [],
      externalIngredients: [],
      logistics: []
    });
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, category: newCategory });
      setNewCategory('');
    }
  };

  const addLogisticsEvent = () => {
    if (tempLogistics.status && tempLogistics.location) {
      setFormData({
        ...formData,
        logistics: [...formData.logistics, { ...tempLogistics, id: Math.random().toString(36).substr(2, 9) }]
      });
      setTempLogistics({ status: '', location: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const addExternalIngredient = () => {
    if (tempExternal.name && tempExternal.origin) {
      setFormData({
        ...formData,
        externalIngredients: [...formData.externalIngredients, { ...tempExternal, id: Math.random().toString(36).substr(2, 9) }]
      });
      setTempExternal({ name: '', origin: '' });
    }
  };

  const downloadQR = async () => {
    if (qrRef.current === null) return;
    const dataUrl = await toPng(qrRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = `aathi-tag-${selectedProduct?.id}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (currentView === 'create') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-300">
        <button
          onClick={() => setCurrentView('list')}
          className="flex items-center gap-2 text-stone-500 hover:text-green-800 transition-colors mb-6 font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Product List
        </button>

        <div className="bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-xl">
          <div className="px-8 py-10 border-b border-stone-100 bg-stone-50/50">
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Create New Digital Passport</h1>
            <p className="text-stone-500 mt-2">Enter the details to generate a verifiable product lineage.</p>
          </div>

          <form onSubmit={handleCreate} className="p-8 sm:p-12 space-y-10">
            {/* Image Preview & URL */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Product Representation</label>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 rounded-3xl object-cover shadow-inner border border-stone-100"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="url"
                    placeholder="Image URL (Unsplash or direct link)"
                    className="w-full px-4 py-3.5 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all text-sm"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  <p className="text-[10px] text-stone-400 font-medium">Use high-quality square images for the best passport display.</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Product Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all font-semibold"
                  placeholder="e.g. Traditional Palm Jaggery"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Category</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all font-medium appearance-none bg-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      className="w-24 px-3 py-4 rounded-2xl border border-stone-200 text-sm"
                      placeholder="Add New..."
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="p-4 bg-stone-100 rounded-2xl hover:bg-stone-200 text-stone-600 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Origin & Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest flex items-center gap-2">
                  Country Code <span className="normal-case font-normal text-stone-400 font-mono">(ISO)</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={2}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all uppercase font-mono tracking-widest"
                  placeholder="IN"
                  value={formData.countryCode}
                  onChange={e => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Detailed Origin</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all font-medium"
                  placeholder="e.g. Market Street, Puliyankudi"
                  value={formData.detailedOrigin}
                  onChange={e => setFormData({ ...formData, detailedOrigin: e.target.value, origin: e.target.value.split(',').pop()?.trim() || '' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Produced Date</label>
                <input
                  required
                  type="date"
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-green-800/10 focus:border-green-800 transition-all font-medium"
                  value={formData.producedDate}
                  onChange={e => setFormData({ ...formData, producedDate: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Public Story</label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all text-sm leading-relaxed"
                  placeholder="How was this made? What makes it special?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Logistics History */}
            <div className="space-y-5 pt-8 border-t border-stone-100">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <Truck size={20} className="text-green-800" />
                Logistics Journey
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 p-6 rounded-3xl border border-stone-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Status</label>
                  <input
                    type="text"
                    placeholder="e.g. Harvested"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-green-800/20"
                    value={tempLogistics.status}
                    onChange={e => setTempLogistics({ ...tempLogistics, status: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Location</label>
                  <input
                    type="text"
                    placeholder="Physical Place"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-green-800/20"
                    value={tempLogistics.location}
                    onChange={e => setTempLogistics({ ...tempLogistics, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Event Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm"
                    value={tempLogistics.date}
                    onChange={e => setTempLogistics({ ...tempLogistics, date: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={addLogisticsEvent}
                  className="self-end h-11 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Event
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {formData.logistics.map((ev, i) => (
                  <div key={ev.id} className="flex justify-between items-center px-5 py-4 bg-white rounded-2xl border border-stone-100 shadow-sm animate-in slide-in-from-left-2 duration-300">
                    <div className="flex gap-4 items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-[10px] flex items-center justify-center font-bold">{i + 1}</div>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{ev.status}</p>
                        <p className="text-xs text-stone-400">{ev.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-stone-300 uppercase">{ev.date}</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logistics: formData.logistics.filter(l => l.id !== ev.id) })}
                        className="text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lineage */}
            <div className="space-y-5 pt-8 border-t border-stone-100">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <QrCode size={20} className="text-green-800" />
                Lineage & Sourcing
              </h3>

              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">Internal Components (Link Existing Passports)</label>
                <div className="flex flex-wrap gap-2.5 p-5 bg-stone-50 border border-stone-200 rounded-3xl min-h-[60px]">
                  {products.length > 0 ? products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const exists = formData.ingredientIds.includes(p.id);
                        setFormData({
                          ...formData,
                          ingredientIds: exists
                            ? formData.ingredientIds.filter(id => id !== p.id)
                            : [...formData.ingredientIds, p.id]
                        });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shadow-sm",
                        formData.ingredientIds.includes(p.id)
                          ? "bg-green-800 text-white border-green-800"
                          : "bg-white text-stone-600 border-stone-100 hover:border-stone-300"
                      )}
                    >
                      {formData.ingredientIds.includes(p.id) ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />}
                      {p.name}
                    </button>
                  )) : <p className="text-xs text-stone-400 italic">No products available to link yet.</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">External Ingredients</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    className="px-4 py-3 rounded-xl border border-stone-200 text-sm font-medium"
                    value={tempExternal.name}
                    onChange={e => setTempExternal({ ...tempExternal, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Vendor/Origin"
                    className="px-4 py-3 rounded-xl border border-stone-200 text-sm font-medium"
                    value={tempExternal.origin}
                    onChange={e => setTempExternal({ ...tempExternal, origin: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={addExternalIngredient}
                    className="bg-stone-200 text-stone-800 rounded-xl py-3 text-sm font-bold hover:bg-stone-300 transition-all"
                  >
                    Add Raw Material
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.externalIngredients.map(ext => (
                    <div key={ext.id} className="px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 flex items-center gap-2.5">
                      <span>{ext.name}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span className="text-stone-400 normal-case">{ext.origin}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, externalIngredients: formData.externalIngredients.filter(e => e.id !== ext.id) })}
                        className="ml-1 text-stone-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10">
              <button type="submit" className="w-full bg-green-800 text-white py-5 rounded-[1.5rem] text-lg font-bold hover:bg-green-900 transition-all shadow-xl shadow-green-900/20 active:scale-[0.98]">
                Launch Product Passport
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Admin Console</h1>
          <p className="text-stone-500 mt-1 max-w-sm">Global visibility and management for your verifiable supply chain.</p>
        </div>
        <button
          onClick={() => setCurrentView('create')}
          className="btn-brand px-6 py-4 flex items-center justify-center gap-2 self-start sm:self-auto min-w-[200px]"
        >
          <Plus size={20} />
          Create New Product
        </button>
      </div>

      {/* Mobile: card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-[2rem] border border-stone-200 p-6 shadow-sm card-hover">
            <div className="flex items-start gap-4 mb-4">
              <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-[1.25rem] object-cover flex-shrink-0 shadow-inner" referrerPolicy="no-referrer" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-stone-900 leading-tight text-lg">{product.name}</p>
                <p className="text-[10px] text-stone-400 font-mono mt-1 tracking-widest">#{product.id.toUpperCase()}</p>
                <div className="mt-2 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg w-fit">
                  {product.category}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-stone-500 text-[13px] mb-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
              <img src={`https://flagcdn.com/w20/${product.countryCode.toLowerCase()}.png`} alt={product.countryCode} className="w-4.5 h-auto rounded-sm" />
              <span className="truncate font-medium">{product.detailedOrigin}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">
                {new Date(product.producedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="flex gap-1.5">
                <Link to={`/p/${product.id}`} className="p-3 text-stone-400 hover:text-green-800 hover:bg-green-50 rounded-2xl transition-all" title="View Passport">
                  <ExternalLink size={18} />
                </Link>
                <button onClick={() => { setSelectedProduct(product); setShowQRModal(true); }} className="p-3 text-stone-400 hover:text-green-800 hover:bg-green-50 rounded-2xl transition-all" title="Generate QR">
                  <QrCode size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-20 text-center bg-stone-50 border-2 border-dashed border-stone-200 rounded-[2.5rem]">
            <p className="text-stone-400 font-medium">No products found. Start by creating one!</p>
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50/70 border-b border-stone-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Product Detail</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Provenance</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Date</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-green-50/20 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-2xl object-cover shadow-inner" referrerPolicy="no-referrer" />
                    <div>
                      <div className="font-extrabold text-stone-900 text-base">{product.name}</div>
                      <div className="text-[10px] text-stone-300 font-mono mt-1 tracking-widest">#{product.id.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded-full uppercase tracking-wide border border-green-100/50">{product.category}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-1 px-1.5 bg-stone-50 rounded-lg border border-stone-100 shadow-sm">
                      <img src={`https://flagcdn.com/w20/${product.countryCode.toLowerCase()}.png`} alt={product.countryCode} className="w-4 h-auto rounded-xs" />
                    </div>
                    <span className="text-stone-600 text-[13px] font-medium">{product.detailedOrigin}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-stone-500 text-xs font-semibold">
                    {new Date(product.producedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Link to={`/p/${product.id}`} className="p-3 text-stone-500 hover:text-green-800 hover:bg-green-50 rounded-2xl transition-all" title="View Passport">
                      <ExternalLink size={20} />
                    </Link>
                    <button onClick={() => { setSelectedProduct(product); setShowQRModal(true); }} className="p-3 text-stone-500 hover:text-green-800 hover:bg-green-50 rounded-2xl transition-all" title="Generate QR">
                      <QrCode size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-32 text-center">
            <div className="p-6 bg-stone-50 w-fit mx-auto rounded-full mb-4">
              <Package size={40} className="text-stone-200" />
            </div>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No product passorts ready for inspection.</p>
          </div>
        )}
      </div>

      {/* QR Modal (Keep as modal since it is a small focused action) */}
      {showQRModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-10 flex flex-col items-center">
              <div ref={qrRef} className="bg-white p-8 border border-stone-200 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl font-bold text-green-800 tracking-tight">ஆதி</span>
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-[0.2em] opacity-40">Aathi</span>
                </div>
                <div className="bg-white p-2 rounded-2xl">
                  <QRCodeSVG
                    value={`${window.location.origin}/p/${selectedProduct.id}`}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone-300 font-black mb-1">Passport Link</p>
                  <p className="text-xs font-mono font-bold text-stone-800 px-3 py-1 bg-stone-50 rounded-lg">#{selectedProduct.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="mt-10 w-full space-y-3">
                <button
                  onClick={downloadQR}
                  className="w-full bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-900 transition-all shadow-lg shadow-green-900/20 active:scale-95"
                >
                  <Download size={20} />
                  Download NFC Label
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-stone-100 text-stone-500 py-4 rounded-2xl font-bold hover:bg-stone-200 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConsumerPassport = ({ products }: { products: Product[] }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Verified Product Passport`;
    }
    return () => {
      document.title = "Aathi | Digital Product Passport";
    };
  }, [product]);

  const ingredients = useMemo(() =>
    product?.ingredientIds.map(ingId => products.find(p => p.id === ingId)).filter(Boolean) as Product[],
    [product, products]
  );

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-stone-50">
        <div className="bg-stone-100 p-6 rounded-full mb-6">
          <Package size={48} className="text-stone-400" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Passport Not Found</h1>
        <p className="text-stone-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-green-800 font-bold flex items-center gap-2 hover:text-green-900 transition-colors">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-20"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} />
              Verified Origin
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
              {product.category}
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 text-white/80">
            <img
              src={`https://flagcdn.com/w40/${product.countryCode.toLowerCase()}.png`}
              alt={product.countryCode}
              className="w-6 h-auto rounded-sm shadow-sm"
            />
            <span className="font-medium">{product.detailedOrigin}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 space-y-10">

          {/* Produced Date & Passport ID */}
          <div className="flex items-center justify-between p-5 bg-stone-50 rounded-3xl border border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-800 text-white rounded-2xl">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Produced Date</p>
                <p className="text-stone-800 font-bold">{new Date(product.producedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Passport ID</p>
              <p className="text-xs font-mono text-stone-600">#{product.id.toUpperCase()}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Info size={24} className="text-green-800" />
              The Story Behind It
            </h3>
            <p className="text-stone-600 leading-relaxed text-lg italic">
              "{product.description}"
            </p>
          </div>

          {/* Logistics Timeline */}
          {product.logistics.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-stone-100">
              <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <MapPin size={24} className="text-green-800" />
                Logistics Journey
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-green-100">
                {product.logistics.map((ev) => (
                  <div key={ev.id} className="relative pl-10">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-green-800 z-10 shadow-sm" />
                    <div>
                      <p className="text-base font-bold text-stone-900 leading-none mb-1">{ev.status}</p>
                      <p className="text-sm text-stone-500 mb-2">{ev.location}</p>
                      <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineage / Supply Chain */}
          <div className="space-y-6 pt-6 border-t border-stone-100">
            <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <QrCode size={24} className="text-green-800" />
              Ingredient Lineage
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Internal Ingredients */}
              {ingredients.map((ing) => (
                <Link
                  key={ing.id}
                  to={`/p/${ing.id}`}
                  className="flex items-center gap-4 group p-4 bg-stone-50 rounded-3xl border border-stone-100 hover:border-green-800/30 hover:bg-green-50 transition-all"
                >
                  <img
                    src={ing.imageUrl}
                    alt={ing.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={`https://flagcdn.com/w20/${ing.countryCode.toLowerCase()}.png`}
                        alt={ing.countryCode}
                        className="w-4 h-auto rounded-sm"
                      />
                      <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">{ing.detailedOrigin}</p>
                    </div>
                    <p className="font-bold text-stone-900 text-lg">{ing.name}</p>
                  </div>
                  <ChevronRight size={20} className="text-stone-300 group-hover:text-green-800 transition-all" />
                </Link>
              ))}

              {/* External Ingredients */}
              {product.externalIngredients?.map((ext) => (
                <div
                  key={ext.id}
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-3xl border border-stone-100 opacity-80"
                >
                  <div className="w-16 h-16 rounded-2xl bg-stone-200 flex items-center justify-center text-stone-400">
                    <Package size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">{ext.origin}</p>
                    <p className="font-bold text-stone-800 text-lg">{ext.name}</p>
                  </div>
                  <div className="px-3 py-1 bg-stone-200 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    External
                  </div>
                </div>
              ))}

              {ingredients.length === 0 && (!product.externalIngredients || product.externalIngredients.length === 0) && (
                <div className="p-8 bg-stone-50 rounded-3xl border border-dashed border-stone-200 text-center">
                  <p className="text-stone-500 italic">This product is sourced directly from nature with no further ingredient lineage.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="mt-16 text-center space-y-3 opacity-50">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-green-800 tracking-tight">ஆதி</span>
            <span className="text-sm font-medium text-stone-800 uppercase tracking-widest">Aathi</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Verified Digital Product Passport</p>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const pricingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-28 md:pt-28 md:pb-40 bg-[#F5F5F4]">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-green-400/10 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 text-green-800 text-xs sm:text-sm font-bold tracking-wide animate-in fade-in slide-in-from-top-4 duration-700">
              <ShieldCheck size={14} />
              TRUSTED BY 500+ SUSTAINABLE BRANDS
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold text-stone-900 tracking-tight leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700">
              The OS for{' '}
              <span className="text-green-800">Radical</span>
              {' '}Transparency.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-stone-500 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Aathi is the Digital Product Passport platform that turns your supply chain into your greatest marketing asset.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link
                to="/admin"
                className="btn-brand px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Start Your Passport
              </Link>
              <button
                onClick={() => scrollTo(pricingRef)}
                className="bg-white text-stone-800 border border-stone-200 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                View Pricing
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Products Tracked', value: '15K+' },
              { label: 'Artisans Onboarded', value: '1,200+' },
              { label: 'Localities', value: '45+' },
              { label: 'QR Scans', value: '250K+' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-stone-200/60 p-4 sm:p-5 text-center shadow-sm">
                <p className="text-2xl sm:text-3xl font-extrabold text-green-800">{stat.value}</p>
                <p className="text-xs text-stone-500 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">Platform</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">Everything you need for DPP compliance</h2>
            <p className="text-lg text-stone-500 max-w-xl mx-auto">Built for the future of the circular economy.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: "Immutable Lineage",
                desc: "Track every ingredient and component with a verifiable, tamper-proof chain of custody.",
                icon: <QrCode size={28} />,
                color: "from-green-50 to-emerald-50",
                iconBg: "bg-green-800",
              },
              {
                title: "Logistics Timeline",
                desc: "Visualize the full physical journey of your products from factory to the consumer's hands.",
                icon: <Truck size={28} />,
                color: "from-blue-50 to-indigo-50",
                iconBg: "bg-blue-700",
              },
              {
                title: "Verified Origin",
                desc: "Showcase the exact location and manufacturing date of every single batch.",
                icon: <Globe size={28} />,
                color: "from-amber-50 to-orange-50",
                iconBg: "bg-amber-600",
              },
              {
                title: "QR Code Labels",
                desc: "Generate print-ready QR codes instantly. Each scan reveals the full passport.",
                icon: <QrCode size={28} />,
                color: "from-rose-50 to-pink-50",
                iconBg: "bg-rose-600",
              },
              {
                title: "Trusted by Consumers",
                desc: "Give shoppers confidence with a beautiful, informative public-facing product page.",
                icon: <ShieldCheck size={28} />,
                color: "from-purple-50 to-violet-50",
                iconBg: "bg-purple-700",
              },
              {
                title: "Ingredient Map",
                desc: "Link internal products together to build a complete, navigable supply web.",
                icon: <MapPin size={28} />,
                color: "from-teal-50 to-cyan-50",
                iconBg: "bg-teal-700",
              },
            ].map((f, i) => (
              <div key={i} className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${f.color} border border-stone-100 card-hover group cursor-default`}>
                <div className={`mb-5 p-3.5 ${f.iconBg} text-white rounded-2xl w-fit shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-20 md:py-28 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-stone-500">Scale your transparency as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
            {[
              {
                name: "Starter",
                price: "₹0",
                desc: "For local artisans and micro-makers.",
                features: ["Up to 5 Products", "Basic Lineage", "QR Code Generation", "Standard Support"],
                cta: "Get Started",
                highlight: false
              },
              {
                name: "Growth",
                price: "₹3,999",
                desc: "For regional sustainable brands.",
                features: ["Up to 50 Products", "Advanced Logistics", "Custom Branding", "Priority Support", "API Access"],
                cta: "Start Free Trial",
                highlight: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For global supply chains.",
                features: ["Unlimited Products", "Full API Integration", "Dedicated Success Manager", "Custom DPP Templates"],
                cta: "Contact Sales",
                highlight: false
              }
            ].map((plan, i) => (
              <div key={i} className={cn(
                "p-8 rounded-[2rem] border flex flex-col transition-all",
                plan.highlight
                  ? "bg-green-800 text-white border-green-700 shadow-2xl shadow-green-900/30 md:scale-105 z-10"
                  : "bg-white text-stone-900 border-stone-200 shadow-sm card-hover"
              )}>
                {plan.highlight && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 w-fit">
                    <Sparkles size={10} /> Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.price !== "Custom" && <span className={cn("text-base opacity-60", plan.highlight ? "" : "text-stone-400")}>/mo</span>}
                </div>
                <p className={cn("mb-6 text-sm leading-relaxed", plan.highlight ? "text-green-100" : "text-stone-500")}>
                  {plan.desc}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm font-medium">
                      <span className={cn("flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                        plan.highlight ? "bg-green-600" : "bg-green-100"
                      )}>
                        <Check size={12} className={plan.highlight ? "text-white" : "text-green-800"} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-3.5 rounded-full font-bold text-base transition-all active:scale-95",
                  plan.highlight
                    ? "bg-white text-green-800 hover:bg-green-50 shadow-md"
                    : "btn-brand"
                )}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8 border-b border-white/10 pb-10 mb-10">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-400 tracking-tight">ஆதி</span>
              <span className="w-px h-5 bg-white/20" />
              <span className="text-base font-semibold uppercase tracking-[0.2em] text-white/80">Aathi</span>
            </div>
            <div className="flex gap-6 sm:gap-10 text-stone-400 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <p className="text-center text-stone-500 text-sm">
            © 2026 Aathi Digital Product Passport. All rights reserved. Built for a circular future.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    document.title = "Aathi | Digital Product Passport";
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F5F4] font-sans text-stone-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPanel
            products={products}
            setProducts={setProducts}
            categories={categories}
            setCategories={setCategories}
          />} />
          <Route path="/p/:id" element={<ConsumerPassport products={products} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
