import { useState, useEffect } from 'react';
import { useSolvencyCalculator } from '../hooks/useSolvencyCalculator';
import { LegInput } from '../types/types';
import { Users, CheckCircle, RotateCcw, Search } from 'lucide-react';

export default function Dashboard() {
  // --- STATE ---
  const [myDCSV, setMyDCSV] = useState(0);
  const [myGSV, setMyGSV] = useState(0);
  const [viewMode, setViewMode] = useState<'top10' | 'all'>('top10');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart State: SKU -> Quantity User Wants to Buy
  const [cart, setCart] = useState<Record<string, number>>({});

  const [legs, setLegs] = useState<LegInput[]>([
    { id: 1, name: 'Leg 1 (Leader)', currentGSV: 35000, targetGSV: 40000, flexPoints: 0, flexReloadDate: '' },
    { id: 2, name: 'Leg 2 (Leader)', currentGSV: 28000, targetGSV: 30000, flexPoints: 0, flexReloadDate: '' },
    { id: 3, name: 'Leg 3 (Leader)', currentGSV: 8000, targetGSV: 10000, flexPoints: 0, flexReloadDate: '' },
    { id: 4, name: 'Brand Rep 4', currentGSV: 1500, targetGSV: 2000, flexPoints: 0, flexReloadDate: '' },
    { id: 5, name: 'Brand Rep 5', currentGSV: 1800, targetGSV: 2000, flexPoints: 0, flexReloadDate: '' },
    { id: 6, name: 'Brand Rep 6', currentGSV: 500, targetGSV: 2000, flexPoints: 0, flexReloadDate: '' },
  ]);

  // --- AUTO-SAVE / LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem('incomeProbeData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMyDCSV(parsed.myDCSV || 0);
        setMyGSV(parsed.myGSV || 0);
        setLegs(parsed.legs || legs);
        setCart(parsed.cart || {});
      } catch (e) { console.error("Load error", e); }
    }
  }, []);

  useEffect(() => {
    const data = { myDCSV, myGSV, legs, cart };
    localStorage.setItem('incomeProbeData', JSON.stringify(data));
  }, [myDCSV, myGSV, legs, cart]);

  // --- CALCULATOR ---
  const result = useSolvencyCalculator({ currentDCSV: myDCSV, currentGSV: myGSV }, legs, 8.05);

  const updateLeg = (id: number, field: keyof LegInput, value: any) => {
    setLegs(legs.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const updateCart = (sku: string, qty: number) => {
    setCart(prev => ({ ...prev, [sku]: qty }));
  };

  // --- HELPERS ---
  // Filter products by search term first (case-insensitive search on name or SKU)
  const filteredProducts = result?.productMenu 
    ? result.productMenu.filter(item => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          item.product.name.toLowerCase().includes(searchLower) ||
          item.product.sku.toLowerCase().includes(searchLower)
        );
      })
    : [];
  
  // Apply view mode limit only if no search term is active
  const displayedProducts = searchTerm.trim() 
    ? filteredProducts // Show all matching results when searching
    : (viewMode === 'top10' ? filteredProducts.slice(0, 10) : filteredProducts);

  // Calculate live cart totals (from ALL products, not just displayed)
  const cartTotalSV = result?.productMenu.reduce((sum, item) => sum + (cart[item.product.sku] || 0) * item.product.sv, 0) || 0;
  const cartTotalCost = result?.productMenu.reduce((sum, item) => sum + (cart[item.product.sku] || 0) * item.product.memberPrice, 0) || 0;
  
  // Calculate remaining gap
  const remainingGap = Math.max(0, (result?.totalGap || 0) - cartTotalSV);
  const isGapCovered = remainingGap === 0 && (result?.totalGap || 0) > 0;

  // Reset function - zeros out all values while preserving structure
  const handleReset = () => {
    // Reset personal stats
    setMyDCSV(0);
    setMyGSV(0);
    
    // Reset cart
    setCart({});
    
    // Reset legs - preserve names but zero all values
    setLegs(legs.map(leg => ({
      id: leg.id,
      name: leg.name,
      currentGSV: 0,
      targetGSV: 0,
      flexPoints: 0,
      flexReloadDate: ''
    })));
    
    // Clear localStorage
    localStorage.removeItem('incomeProbeData');
  };

  if (!result) return <div className="p-10 text-white">Loading System...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-700 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold flex items-center text-blue-400">
              <Users className="mr-3"/> Income Probe <span className="text-xs ml-2 text-slate-500 bg-slate-800 px-2 py-1 rounded">v2.1 Auto-Save Active</span>
            </h1>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Reset all data to defaults"
            >
              <RotateCcw size={16} />
              Reset All
            </button>
          </div>
          <div className={`text-right p-3 rounded-lg border ${isGapCovered ? 'bg-green-900/30 border-green-500' : 'bg-slate-800 border-slate-600'}`}>
             <div className="text-xs text-slate-400 uppercase tracking-wide">
               {isGapCovered ? 'GAP COVERED' : 'Remaining Volume Gap'}
             </div>
             <div className={`text-3xl font-bold ${isGapCovered ? 'text-green-400' : remainingGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
               {isGapCovered ? '✓' : remainingGap.toLocaleString()} <span className="text-sm text-slate-500">{!isGapCovered && 'SV'}</span>
             </div>
          </div>
        </div>
        
        {/* INPUT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: DATA ENTRY */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. PERSONAL TABLE */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-blue-300">1. Personal Requirements</h2>
              <table className="w-full text-left">
                <thead><tr className="text-xs text-slate-500 uppercase"><th className="pb-2">Metric</th><th className="pb-2 text-right">Current</th><th className="pb-2 text-right">Target</th><th className="pb-2 text-right">Gap</th></tr></thead>
                <tbody>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-2 text-sm font-medium">Direct Customer SV</td>
                    <td className="py-2 text-right"><input type="number" value={myDCSV || ''} onChange={e => setMyDCSV(Number(e.target.value))} className="bg-slate-900 w-24 p-1 rounded text-right border border-slate-600 focus:border-blue-500 outline-none"/></td>
                    <td className="py-2 text-right text-slate-400 font-mono">250</td>
                    <td className="py-2 text-right font-bold text-red-400">{Math.max(0, 250 - myDCSV) > 0 ? Math.max(0, 250 - myDCSV) : <CheckCircle size={16} className="text-green-500 inline"/>}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm font-medium">Group Volume (GSV)</td>
                    <td className="py-2 text-right"><input type="number" value={myGSV || ''} onChange={e => setMyGSV(Number(e.target.value))} className="bg-slate-900 w-24 p-1 rounded text-right border border-slate-600 focus:border-blue-500 outline-none"/></td>
                    <td className="py-2 text-right text-slate-400 font-mono">3000</td>
                    <td className="py-2 text-right font-bold text-red-400">{Math.max(0, 3000 - myGSV) > 0 ? Math.max(0, 3000 - myGSV) : <CheckCircle size={16} className="text-green-500 inline"/>}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. MATRIX TABLE */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm overflow-x-auto">
              <h2 className="text-lg font-bold mb-4 text-purple-300">2. Organization Matrix</h2>
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700">
                    <th className="pb-3 pl-2">Leader Name</th>
                    <th className="pb-3 text-right">Current</th>
                    <th className="pb-3 text-right">Target</th>
                    <th className="pb-3 text-right text-blue-300">Flex Pts</th>
                    <th className="pb-3 text-right">Reload</th>
                    <th className="pb-3 text-right pr-2">Gap</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {legs.map(leg => {
                    const gap = Math.max(0, leg.targetGSV - leg.currentGSV);
                    return (
                      <tr key={leg.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                        <td className="py-2 pl-2"><input type="text" value={leg.name} onChange={e => updateLeg(leg.id, 'name', e.target.value)} className="bg-transparent w-full focus:outline-none"/></td>
                        <td className="py-2 text-right"><input type="number" value={leg.currentGSV || ''} onChange={e => updateLeg(leg.id, 'currentGSV', Number(e.target.value))} className="bg-slate-900 w-20 p-1 rounded border border-slate-600 text-right focus:border-purple-500 outline-none"/></td>
                        <td className="py-2 text-right"><input type="number" value={leg.targetGSV || ''} onChange={e => updateLeg(leg.id, 'targetGSV', Number(e.target.value))} className="bg-slate-900 w-20 p-1 rounded border border-slate-600 text-right text-slate-400 focus:border-purple-500 outline-none"/></td>
                        <td className="py-2 text-right"><input type="number" value={leg.flexPoints || ''} onChange={e => updateLeg(leg.id, 'flexPoints', Number(e.target.value))} className="bg-slate-900 w-16 p-1 rounded border border-blue-900/50 text-right text-blue-300 focus:border-blue-500 outline-none"/></td>
                        <td className="py-2 text-right"><input type="text" placeholder="Date" value={leg.flexReloadDate || ''} onChange={e => updateLeg(leg.id, 'flexReloadDate', e.target.value)} className="bg-slate-900 w-20 p-1 rounded border border-slate-600 text-right text-xs focus:border-purple-500 outline-none"/></td>
                        <td className="py-2 text-right pr-2 font-mono font-bold">{gap > 0 ? <span className="text-red-400">-{gap.toLocaleString()}</span> : <span className="text-green-500">✔</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: STRATEGIC MENU */}
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border-l-8 shadow-lg ${result.totalGap === 0 ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
              <h3 className="text-xl font-bold">{result.totalGap === 0 ? 'QUALIFIED' : 'ACTION REQUIRED'}</h3>
              {result.totalGap > 0 && <p className="text-sm text-slate-300 mt-2">Use the menu below to build your order.</p>}
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[600px]">
              {/* SEARCH BAR */}
              <div className="p-4 border-b border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products by name or SKU..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-slate-700">
                <button onClick={() => setViewMode('top10')} className={`flex-1 py-3 text-sm font-bold ${viewMode === 'top10' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Top 10 Efficient</button>
                <button onClick={() => setViewMode('all')} className={`flex-1 py-3 text-sm font-bold ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>
                  Full Catalog
                  {viewMode === 'all' && !searchTerm.trim() && result?.productMenu && (
                    <span className="ml-2 text-xs opacity-75">({result.productMenu.length} products)</span>
                  )}
                </button>
              </div>

              {/* PRODUCT LIST */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {searchTerm.trim() && (
                  <div className="text-xs text-slate-400 text-center pb-2 border-b border-slate-700">
                    Found {displayedProducts.length} {displayedProducts.length === 1 ? 'product' : 'products'} matching "{searchTerm}"
                  </div>
                )}
                {!searchTerm.trim() && viewMode === 'all' && displayedProducts.length > 0 && (
                  <div className="text-xs text-slate-500 text-center pb-2 border-b border-slate-700">
                    Showing all {displayedProducts.length} products
                  </div>
                )}
                {displayedProducts.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    {searchTerm.trim() ? 'No products found matching your search.' : 'No products available.'}
                  </div>
                )}
                {displayedProducts.map((item, i) => (
                  <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-white w-2/3">{item.product.name}</div>
                      <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">${item.efficiency.toFixed(2)} / pt</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-2">
                      <div>SV: {item.product.sv}</div>
                      <div>Price: ${item.product.memberPrice}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center bg-slate-800 p-2 rounded">
                      <div className="text-center border-r border-slate-600 pr-2">
                        <div className="text-[10px] text-slate-500 uppercase">Needed</div>
                        <div className="font-mono text-lg text-slate-300">{item.theoreticalQty}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-blue-400 uppercase mb-1">My Qty</div>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={cart[item.product.sku] || ''}
                          onChange={(e) => updateCart(item.product.sku, Number(e.target.value))}
                          className="w-full bg-slate-700 rounded p-1 text-center font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Cost to Qualify:</span>
                      <span className="text-slate-300 font-mono">${item.theoreticalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LIVE CART BAR */}
              <div className="bg-slate-900 border-t border-slate-700 p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Cart Total SV</span>
                  <span className={`font-bold ${cartTotalSV >= result.totalGap ? 'text-green-400' : 'text-yellow-400'}`}>
                    {cartTotalSV.toLocaleString()} / {result.totalGap.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Cart Cost</span>
                  <span className="text-xl font-bold text-white">${cartTotalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
