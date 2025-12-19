import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Terminal } from 'lucide-react';

interface AccessGateProps {
  children: React.ReactNode;
}

// ---------------------------------------------------------
// 🔐 SECURITY FREQUENCY - AUTO-ROTATING MONTHLY ACCESS SYSTEM
// ---------------------------------------------------------
const MASTER_PASSWORD = "alien2025"; // Skeleton key - always works
const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

// Get current month code automatically
const getCurrentMonthCode = (): string => {
  const today = new Date();
  return MONTH_NAMES[today.getMonth()];
};

export const AccessGate: React.FC<AccessGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if they already have a valid saved code
    const savedCode = localStorage.getItem('alien_access_code');
    const currentMonth = getCurrentMonthCode();
    
    if (savedCode === MASTER_PASSWORD || savedCode === currentMonth) {
      setIsAuthenticated(true);
    } else {
      // Clear invalid/expired saved codes
      localStorage.removeItem('alien_access_code');
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = inputCode.trim().toUpperCase();
    const currentMonth = getCurrentMonthCode();
    
    // Check if input matches master password OR current month
    if (userInput === MASTER_PASSWORD.toUpperCase() || userInput === currentMonth) {
      localStorage.setItem('alien_access_code', userInput);
      setIsAuthenticated(true);
    } else {
      setError('⛔ ACCESS DENIED. INVALID FREQUENCY.');
      setInputCode('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full border border-green-800 p-8 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.1)] bg-zinc-950">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 border-2 border-green-600 rounded-full animate-pulse">
            <Lock className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase">
          Alien Probe
        </h1>
        <p className="text-center text-green-700 text-sm mb-8">
          RESTRICTED AREA // AUTHORIZED PERSONNEL ONLY
        </p>

        {/* The Form */}
        <form onSubmit={handleUnlock} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 text-green-600">
              Enter Security Frequency
            </label>
            <div className="relative">
              <Terminal className="absolute left-3 top-3 w-5 h-5 text-green-700" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-black border border-green-800 rounded p-3 pl-10 text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 uppercase tracking-widest placeholder-green-900"
                placeholder="CODE-XXXX"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs text-center font-bold border border-red-900 bg-red-950/30 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-900/20 hover:bg-green-600 hover:text-black border border-green-600 text-green-500 font-bold py-3 px-4 rounded transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Initialize Probe
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Need access? Join the Alien Army.
          </p>
          <a 
            href="#" // PUT YOUR STAN STORE LINK HERE LATER
            className="text-xs text-green-700 hover:text-green-400 underline mt-1 block"
          >
            Request Clearance
          </a>
        </div>
      </div>
    </div>
  );
};

