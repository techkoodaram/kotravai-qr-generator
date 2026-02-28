import React, { useState, useRef, useMemo } from 'react';
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
  Search,
  X,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind classes
 */
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

const INITIAL_CATEGORIES = ['Food', 'Grocery', 'Furniture', 'Electronics'];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Honey',
    category: 'Food',
    origin: 'India',
    detailedOrigin: 'Western Ghats, Tenkasi',
    countryCode: 'IN',
    producedDate: '2026-01-15',
    description: 'Pure, raw honey harvested from the wild bees of the Western Ghats.',
    imageUrl: 'https://picsum.photos/seed/honey/800/600',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext1', name: 'Wild Bee Pollen', origin: 'Western Ghats' }
    ],
    logistics: [
      { id: 'l1', status: 'Harvested', location: 'Tenkasi Forest', date: '2026-01-15' },
      { id: 'l2', status: 'Quality Check', location: 'Puliyankudi Lab', date: '2026-01-18' },
      { id: 'l3', status: 'Packed', location: 'Aathi Facility', date: '2026-01-20' }
    ]
  },
  {
    id: '2',
    name: 'Glass Jar',
    category: 'Grocery',
    origin: 'India',
    detailedOrigin: 'Industrial Estate, Gujarat',
    countryCode: 'IN',
    producedDate: '2025-12-10',
    description: 'High-quality, recyclable glass jar manufactured in Gujarat.',
    imageUrl: 'https://picsum.photos/seed/glass/800/600',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext2', name: 'Silica Sand', origin: 'Rajasthan' },
      { id: 'ext3', name: 'Soda Ash', origin: 'Gujarat' }
    ],
    logistics: [
      { id: 'l4', status: 'Manufactured', location: 'Gujarat Factory', date: '2025-12-10' },
      { id: 'l5', status: 'Shipped', location: 'Mundra Port', date: '2025-12-15' }
    ]
  },
  {
    id: '3',
    name: 'Aathi Signature Jam',
    category: 'Food',
    origin: 'India',
    detailedOrigin: 'Puliyankudi, Tamil Nadu',
    countryCode: 'IN',
    producedDate: '2026-02-01',
    description: 'Our signature jam made with organic honey and premium fruits.',
    imageUrl: 'https://picsum.photos/seed/jam/800/600',
    ingredientIds: ['1', '2'],
    externalIngredients: [
      { id: 'ext4', name: 'Organic Cane Sugar', origin: 'Maharashtra' },
      { id: 'ext5', name: 'Natural Pectin', origin: 'Himachal Pradesh' }
    ],
    logistics: [
      { id: 'l6', status: 'Produced', location: 'Puliyankudi Kitchen', date: '2026-02-01' },
      { id: 'l7', status: 'Left Factory', location: 'Puliyankudi', date: '2026-02-05' },
      { id: 'l8', status: 'Reached Shop', location: 'Chennai Store', date: '2026-02-10' }
    ]
  },
  {
    id: '4',
    name: 'Oak Wood',
    category: 'Furniture',
    origin: 'India',
    detailedOrigin: 'Managed Forest, Tamil Nadu',
    countryCode: 'IN',
    producedDate: '2025-11-20',
    description: 'Sustainably sourced oak wood from managed forests.',
    imageUrl: 'https://picsum.photos/seed/oak/800/600',
    ingredientIds: [],
    externalIngredients: [],
    logistics: [
      { id: 'l9', status: 'Sourced', location: 'Nilgiris', date: '2025-11-20' }
    ]
  },
  {
    id: '5',
    name: 'Minimalist Chair',
    category: 'Furniture',
    origin: 'India',
    detailedOrigin: 'Craft Workshop, Tenkasi',
    countryCode: 'IN',
    producedDate: '2026-01-05',
    description: 'Handcrafted minimalist chair designed for comfort and durability.',
    imageUrl: 'https://picsum.photos/seed/chair/800/600',
    ingredientIds: ['4'],
    externalIngredients: [
      { id: 'ext6', name: 'Natural Varnish', origin: 'Kerala' },
      { id: 'ext7', name: 'Steel Screws', origin: 'Salem' }
    ],
    logistics: [
      { id: 'l10', status: 'Assembled', location: 'Tenkasi Workshop', date: '2026-01-05' }
    ]
  },
  {
    id: '6',
    name: 'Lithium Cell',
    category: 'Electronics',
    origin: 'Taiwan',
    detailedOrigin: 'Hsinchu Science Park',
    countryCode: 'TW',
    producedDate: '2025-10-15',
    description: 'High-capacity lithium-ion cell for portable electronics.',
    imageUrl: 'https://picsum.photos/seed/battery/800/600',
    ingredientIds: [],
    externalIngredients: [
      { id: 'ext8', name: 'Lithium Carbonate', origin: 'Chile' },
      { id: 'ext9', name: 'Cobalt Oxide', origin: 'Congo' }
    ],
    logistics: [
      { id: 'l11', status: 'Manufactured', location: 'Hsinchu', date: '2025-10-15' }
    ]
  },
  {
    id: '7',
    name: 'Power Bank',
    category: 'Electronics',
    origin: 'India',
    detailedOrigin: 'Electronic City, Bangalore',
    countryCode: 'IN',
    producedDate: '2026-01-20',
    description: 'Fast-charging power bank with verified component sourcing.',
    imageUrl: 'https://picsum.photos/seed/powerbank/800/600',
    ingredientIds: ['6'],
    externalIngredients: [
      { id: 'ext10', name: 'Recycled Plastic Shell', origin: 'Pune' },
      { id: 'ext11', name: 'Copper Wiring', origin: 'Gujarat' }
    ],
    logistics: [
      { id: 'l12', status: 'Assembled', location: 'Bangalore Factory', date: '2026-01-20' }
    ]
  },
];

// --- Components ---

const Navbar = () => (
  <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-green-800 tracking-tight group-hover:scale-110 transition-transform">ஆதி</span>
          <span className="text-xl font-light text-stone-300">|</span>
          <span className="text-lg font-medium text-stone-800 uppercase tracking-widest text-sm">Aathi</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-stone-500 hover:text-green-800 font-semibold transition-colors">Home</Link>
          <a href="/#features" className="text-stone-500 hover:text-green-800 font-semibold transition-colors">Features</a>
          <a href="/#pricing" className="text-stone-500 hover:text-green-800 font-semibold transition-colors">Pricing</a>
          <Link to="/admin" className="bg-green-800 text-white px-5 py-2 rounded-full font-bold hover:bg-green-900 transition-all shadow-lg shadow-green-800/20">
            Console
          </Link>
        </div>
        <div className="md:hidden">
          <Link to="/admin" className="p-2 text-green-800">
            <Package size={24} />
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || 'Food',
    origin: '',
    detailedOrigin: '',
    countryCode: 'IN',
    producedDate: '',
    description: '',
    imageUrl: '',
    ingredientIds: [] as string[],
    externalIngredients: [] as ExternalIngredient[],
    logistics: [] as LogisticsEvent[]
  });

  const [tempLogistics, setTempLogistics] = useState({
    status: '',
    location: '',
    date: ''
  });

  const [tempExternal, setTempExternal] = useState({
    name: '',
    origin: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/800/600`
    };
    setProducts([...products, newProduct]);
    setIsModalOpen(false);
    setFormData({ 
      name: '', 
      category: categories[0], 
      origin: '', 
      detailedOrigin: '', 
      countryCode: 'IN', 
      producedDate: '', 
      description: '', 
      imageUrl: '', 
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
    if (tempLogistics.status && tempLogistics.location && tempLogistics.date) {
      setFormData({
        ...formData,
        logistics: [
          ...formData.logistics,
          { ...tempLogistics, id: Math.random().toString(36).substr(2, 9) }
        ]
      });
      setTempLogistics({ status: '', location: '', date: '' });
    }
  };

  const addExternalIngredient = () => {
    if (tempExternal.name && tempExternal.origin) {
      setFormData({
        ...formData,
        externalIngredients: [
          ...formData.externalIngredients,
          { ...tempExternal, id: Math.random().toString(36).substr(2, 9) }
        ]
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Product Management</h1>
          <p className="text-stone-500">Create and manage your Digital Product Passports</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-800 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-900 transition-all shadow-lg shadow-green-800/20"
        >
          <Plus size={20} />
          Create Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-stone-700">Product</th>
              <th className="px-6 py-4 font-semibold text-stone-700">Category</th>
              <th className="px-6 py-4 font-semibold text-stone-700">Origin</th>
              <th className="px-6 py-4 font-semibold text-stone-700">Produced</th>
              <th className="px-6 py-4 font-semibold text-stone-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <div className="font-medium text-stone-900">{product.name}</div>
                      <div className="text-xs text-stone-400 font-mono">#{product.id.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-600">{product.category}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://flagcdn.com/w20/${product.countryCode.toLowerCase()}.png`} 
                      alt={product.countryCode}
                      className="w-5 h-auto rounded-sm"
                    />
                    <span className="text-stone-600">{product.detailedOrigin}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-600">{product.producedDate}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      to={`/p/${product.id}`}
                      className="p-2 text-stone-400 hover:text-green-800 transition-colors"
                      title="View Passport"
                    >
                      <ExternalLink size={18} />
                    </Link>
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowQRModal(true);
                      }}
                      className="p-2 text-stone-400 hover:text-green-800 transition-colors"
                      title="Generate QR"
                    >
                      <QrCode size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-2xl font-bold text-stone-900">New Product Passport</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all"
                    placeholder="e.g. Signature Jam"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Category</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        className="w-24 px-3 py-3 rounded-xl border border-stone-200 text-sm"
                        placeholder="New..."
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={addCategory}
                        className="p-3 bg-stone-100 rounded-xl hover:bg-stone-200 text-stone-600"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Origin & Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Country Code (ISO)</label>
                  <input 
                    required
                    type="text" 
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all uppercase"
                    placeholder="IN"
                    value={formData.countryCode}
                    onChange={e => setFormData({...formData, countryCode: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-stone-700">Detailed Origin (Exact Location)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all"
                    placeholder="e.g. Puliyankudi, Tenkasi"
                    value={formData.detailedOrigin}
                    onChange={e => setFormData({...formData, detailedOrigin: e.target.value, origin: e.target.value.split(',').pop()?.trim() || ''})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Produced/Manufacturing Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all"
                    value={formData.producedDate}
                    onChange={e => setFormData({...formData, producedDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Description</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all"
                    placeholder="Tell the story of this product..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Logistics History */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-900">Logistics History</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input 
                    type="text" 
                    placeholder="Status (e.g. Left Factory)" 
                    className="px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    value={tempLogistics.status}
                    onChange={e => setTempLogistics({...tempLogistics, status: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    className="px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    value={tempLogistics.location}
                    onChange={e => setTempLogistics({...tempLogistics, location: e.target.value})}
                  />
                  <input 
                    type="date" 
                    className="px-3 py-2 rounded-lg border border-stone-200 text-sm"
                    value={tempLogistics.date}
                    onChange={e => setTempLogistics({...tempLogistics, date: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={addLogisticsEvent}
                    className="bg-stone-800 text-white rounded-lg py-2 text-sm font-bold hover:bg-black transition-all"
                  >
                    Add Event
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.logistics.map((ev, i) => (
                    <div key={ev.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="flex gap-4 items-center">
                        <span className="text-xs font-bold text-stone-400">#{i+1}</span>
                        <span className="font-semibold text-stone-800">{ev.status}</span>
                        <span className="text-stone-500 text-sm">at {ev.location}</span>
                      </div>
                      <span className="text-stone-400 text-xs">{ev.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-900">Lineage & Ingredients</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Link Internal Products</label>
                  <div className="flex flex-wrap gap-2 p-3 border border-stone-200 rounded-xl min-h-[50px]">
                    {products.map(p => (
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
                          "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                          formData.ingredientIds.includes(p.id)
                            ? "bg-green-800 text-white border-green-800"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400"
                        )}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700">Add External Ingredients (No Passport)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Ingredient Name" 
                      className="px-3 py-2 rounded-lg border border-stone-200 text-sm"
                      value={tempExternal.name}
                      onChange={e => setTempExternal({...tempExternal, name: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Origin" 
                      className="px-3 py-2 rounded-lg border border-stone-200 text-sm"
                      value={tempExternal.origin}
                      onChange={e => setTempExternal({...tempExternal, origin: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={addExternalIngredient}
                      className="bg-stone-100 text-stone-600 rounded-lg py-2 text-sm font-bold hover:bg-stone-200 transition-all"
                    >
                      Add External
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.externalIngredients.map(ext => (
                      <div key={ext.id} className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-medium text-stone-600 flex items-center gap-2">
                        {ext.name} ({ext.origin})
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, externalIngredients: formData.externalIngredients.filter(e => e.id !== ext.id)})}
                          className="hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-green-800 text-white py-4 rounded-xl font-bold hover:bg-green-900 transition-all shadow-lg shadow-green-800/20">
                  Publish Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 flex flex-col items-center">
              <div ref={qrRef} className="bg-white p-6 border border-stone-200 rounded-2xl flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-green-800 tracking-tight">ஆதி</span>
                  <span className="text-xs font-medium text-stone-800 uppercase tracking-widest">Aathi</span>
                </div>
                <QRCodeSVG 
                  value={`${window.location.origin}/p/${selectedProduct.id}`} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Product Passport ID</p>
                  <p className="text-sm font-mono text-stone-800">#{selectedProduct.id.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="mt-8 w-full space-y-3">
                <button 
                  onClick={downloadQR}
                  className="w-full bg-green-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-900 transition-all"
                >
                  <Download size={20} />
                  Download Label
                </button>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all"
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
  const ingredients = useMemo(() => 
    product?.ingredientIds.map(ingId => products.find(p => p.id === ingId)).filter(Boolean) as Product[],
    [product, products]
  );

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-stone-100 p-6 rounded-full mb-6">
          <Package size={48} className="text-stone-400" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Passport Not Found</h1>
        <p className="text-stone-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-green-800 font-bold flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Mobile Header */}
      <div className="relative h-[45vh] w-full">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-10 left-8 right-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} />
              Verified Origin
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
              {product.category}
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">{product.name}</h1>
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
      <div className="max-w-xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 space-y-10">
          
          {/* Produced Date */}
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
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Info size={22} className="text-green-800" />
              The Story
            </h3>
            <p className="text-stone-600 leading-relaxed text-lg italic">
              "{product.description}"
            </p>
          </div>

          {/* Logistics Timeline */}
          {product.logistics.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <MapPin size={22} className="text-green-800" />
                Logistics Journey
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100">
                {product.logistics.map((ev) => (
                  <div key={ev.id} className="relative pl-10">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-green-800 z-10 shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-stone-900 leading-none mb-1">{ev.status}</p>
                      <p className="text-xs text-stone-500 mb-2">{ev.location}</p>
                      <span className="inline-block px-2 py-1 bg-stone-100 text-stone-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineage / Supply Chain */}
          <div className="space-y-6 pt-6 border-t border-stone-100">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <QrCode size={22} className="text-green-800" />
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
        <div className="mt-16 text-center space-y-3 opacity-30">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-green-800 tracking-tight">ஆதி</span>
            <span className="text-sm font-medium text-stone-800 uppercase tracking-widest">Aathi</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Verified Digital Product Passport</p>
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
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-[#F5F5F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-bold tracking-wide animate-in fade-in slide-in-from-top-4 duration-700">
              <ShieldCheck size={16} />
              TRUSTED BY 500+ SUSTAINABLE BRANDS
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold text-stone-900 tracking-tight leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700">
              The OS for <span className="text-green-800">Radical</span> Transparency.
            </h1>
            <p className="text-xl md:text-2xl text-stone-500 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Aathi is the Digital Product Passport (DPP) platform that turns your supply chain into your greatest marketing asset.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link 
                to="/admin" 
                className="bg-green-800 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-green-900 transition-all shadow-2xl shadow-green-800/30 hover:scale-105 active:scale-95"
              >
                Start Your Passport
              </Link>
              <button 
                onClick={() => scrollTo(pricingRef)}
                className="bg-white text-stone-900 border border-stone-200 px-10 py-5 rounded-full font-bold text-xl hover:bg-stone-50 transition-all active:scale-95"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-green-800 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-green-600 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">Everything you need for DPP compliance</h2>
            <p className="text-xl text-stone-500">Built for the future of the circular economy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Immutable Lineage",
                desc: "Track every ingredient and component with a verifiable chain of custody.",
                icon: <QrCode className="text-green-800" size={32} />
              },
              {
                title: "Logistics Timeline",
                desc: "Visualize the physical journey of your products from factory to shelf.",
                icon: <MapPin className="text-green-800" size={32} />
              },
              {
                title: "Verified Origin",
                desc: "Showcase the exact location and manufacturing date of every batch.",
                icon: <ShieldCheck className="text-green-800" size={32} />
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:border-green-800/20 transition-all group">
                <div className="mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-stone-500">Scale your transparency as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$0",
                desc: "For small artisans and makers.",
                features: ["Up to 5 Products", "Basic Lineage", "QR Code Generation", "Standard Support"],
                cta: "Get Started",
                highlight: false
              },
              {
                name: "Growth",
                price: "$49",
                desc: "For growing sustainable brands.",
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
                "p-10 rounded-[2.5rem] border transition-all flex flex-col",
                plan.highlight 
                  ? "bg-green-800 text-white border-green-800 shadow-2xl shadow-green-800/30 scale-105 z-10" 
                  : "bg-white text-stone-900 border-stone-200"
              )}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-lg opacity-60">/mo</span>}
                </div>
                <p className={cn("mb-8 leading-relaxed", plan.highlight ? "text-green-100" : "text-stone-500")}>
                  {plan.desc}
                </p>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium">
                      <ShieldCheck size={18} className={plan.highlight ? "text-green-300" : "text-green-800"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95",
                  plan.highlight 
                    ? "bg-white text-green-800 hover:bg-stone-100" 
                    : "bg-green-800 text-white hover:bg-green-900"
                )}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-white/10 pb-12 mb-12">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-green-500 tracking-tight">ஆதி</span>
              <span className="text-xl font-medium uppercase tracking-widest">Aathi</span>
            </div>
            <div className="flex gap-10 text-stone-400 font-medium">
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
