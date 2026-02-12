import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Wallet, TrendingUp, PiggyBank, Calculator, ArrowRight, Settings2, Info, RefreshCw, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, RotateCcw, Cloud, Check, X, ShieldCheck, Zap, BookOpen, Percent, DollarSign, Target, MousePointer2, Sparkles, LayoutDashboard
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION ---
// Get these from Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyBUQhstjwh_cXZx91Qt788IO2BU2rtpEQo",
  authDomain: "wealthflow-planner.firebaseapp.com",
  projectId: "wealthflow-planner",
  storageBucket: "wealthflow-planner.firebasestorage.app",
  messagingSenderId: "1:972877655996:web:f867c371ab9f1fbe5245b9",
  appId: "972877655996"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "wealthflow-planner-v1";

// Rounding Utility
const round = (val) => Math.round(Number(val) || 0);

const DEFAULTS = {
  income: 5000,
  incomeType: 'monthly',
  taxStatus: 'after',
  estTaxRate: 25,
  totalAllocation: 20,
  initialSplit: 50, 
  postGoalSplit: 25, 
  emergencyFundMultiplier: 3,
  savingsApr: 4.0,
  investRoi: 7.0,
  duration: 60,
  startingSavings: 0,
  startingInvestments: 0,
  raises: [
    { id: 1, afterYear: 1, value: 3, isPercent: true, label: 'Cost of Living' },
    { id: 2, afterYear: 2, value: 3, isPercent: true, label: 'Cost of Living' }
  ]
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [currentTableYear, setCurrentTableYear] = useState(1);

  const [income, setIncome] = useState(DEFAULTS.income);
  const [incomeType, setIncomeType] = useState(DEFAULTS.incomeType);
  const [taxStatus, setTaxStatus] = useState(DEFAULTS.taxStatus);
  const [estTaxRate, setEstTaxRate] = useState(DEFAULTS.estTaxRate);
  const [totalAllocation, setTotalAllocation] = useState(DEFAULTS.totalAllocation);
  const [initialSplit, setInitialSplit] = useState(DEFAULTS.initialSplit);
  const [postGoalSplit, setPostGoalSplit] = useState(DEFAULTS.postGoalSplit);
  const [emergencyFundMultiplier, setEmergencyFundMultiplier] = useState(DEFAULTS.emergencyFundMultiplier);
  const [savingsApr, setSavingsApr] = useState(DEFAULTS.savingsApr);
  const [investRoi, setInvestRoi] = useState(DEFAULTS.investRoi);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [startingSavings, setStartingSavings] = useState(DEFAULTS.startingSavings);
  const [startingInvestments, setStartingInvestments] = useState(DEFAULTS.startingInvestments);
  const [raises, setRaises] = useState(DEFAULTS.raises);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const settingsDoc = doc(db, 'wealthflow', appId, 'users', user.uid, 'settings', 'current');
    const unsubscribe = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIncome(round(data.income));
        setIncomeType(data.incomeType);
        setTaxStatus(data.taxStatus);
        setEstTaxRate(data.estTaxRate);
        setTotalAllocation(data.totalAllocation);
        setInitialSplit(data.initialSplit);
        setPostGoalSplit(data.postGoalSplit);
        setEmergencyFundMultiplier(data.emergencyFundMultiplier);
        setSavingsApr(data.savingsApr);
        setInvestRoi(data.investRoi);
        setDuration(data.duration);
        setStartingSavings(round(data.startingSavings));
        setStartingInvestments(round(data.startingInvestments));
        setRaises(data.raises || []);
      }
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, [user]);

  const saveSettings = async () => {
    if (!user || isInitialLoad) return;
    setIsSaving(true);
    try {
      const settingsDoc = doc(db, 'wealthflow', appId, 'users', user.uid, 'settings', 'current');
      await setDoc(settingsDoc, {
        income: round(income), 
        incomeType, taxStatus, estTaxRate, totalAllocation, 
        initialSplit, postGoalSplit, emergencyFundMultiplier,
        savingsApr, investRoi, duration, 
        startingSavings: round(startingSavings), 
        startingInvestments: round(startingInvestments), 
        raises
      });
    } catch (e) { console.error(e); } finally { setTimeout(() => setIsSaving(false), 800); }
  };

  useEffect(() => {
    if (isInitialLoad) return;
    const timer = setTimeout(saveSettings, 1500);
    return () => clearTimeout(timer);
  }, [income, incomeType, taxStatus, estTaxRate, totalAllocation, initialSplit, postGoalSplit, emergencyFundMultiplier, savingsApr, investRoi, duration, startingSavings, startingInvestments, raises]);

  const resetToDefaults = () => {
    setIncome(DEFAULTS.income);
    setIncomeType(DEFAULTS.incomeType);
    setTaxStatus(DEFAULTS.taxStatus);
    setEstTaxRate(DEFAULTS.estTaxRate);
    setTotalAllocation(DEFAULTS.totalAllocation);
    setInitialSplit(DEFAULTS.initialSplit);
    setPostGoalSplit(DEFAULTS.postGoalSplit);
    setEmergencyFundMultiplier(DEFAULTS.emergencyFundMultiplier);
    setSavingsApr(DEFAULTS.savingsApr);
    setInvestRoi(DEFAULTS.investRoi);
    setDuration(DEFAULTS.duration);
    setStartingSavings(DEFAULTS.startingSavings);
    setStartingInvestments(DEFAULTS.startingInvestments);
    setRaises(DEFAULTS.raises);
    setCurrentTableYear(1);
  };

  const addRaise = () => {
    const nextYear = raises.length > 0 ? Math.max(...raises.map(r => r.afterYear)) + 1 : 1;
    if (nextYear >= Math.ceil(duration / 12)) return;
    setRaises([...raises, { id: Date.now(), afterYear: nextYear, value: 3, isPercent: true, label: 'Annual Raise' }]);
  };

  const updateRaise = (id, field, value) => {
    setRaises(raises.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRaise = (id) => setRaises(raises.filter(r => r.id !== id));

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const projectionData = useMemo(() => {
    let data = [];
    let currentSavings = parseFloat(startingSavings) || 0;
    let currentInvestments = parseFloat(startingInvestments) || 0;
    
    let grossMonthly = 0;
    if (incomeType === 'hourly') grossMonthly = income * 40 * 4.33;
    else if (incomeType === 'biweekly') grossMonthly = (income * 26) / 12;
    else if (incomeType === 'monthly') grossMonthly = income;
    else if (incomeType === 'yearly') grossMonthly = income / 12;

    let currentTakeHome = taxStatus === 'before' ? grossMonthly * (1 - estTaxRate / 100) : grossMonthly;
    
    const sApr = (savingsApr / 100) / 12;
    const iRoi = (investRoi / 100) / 12;

    for (let m = 1; m <= duration; m++) {
      const currentYear = Math.ceil(m / 12);
      const yearStarted = m % 12 === 1 && m > 1;

      if (yearStarted) {
        const activeRaise = raises.find(r => r.afterYear === currentYear - 1);
        if (activeRaise) {
          if (activeRaise.isPercent) currentTakeHome *= (1 + activeRaise.value / 100);
          else currentTakeHome += activeRaise.value;
        }
      }

      const totalAllocatedDollars = currentTakeHome * (totalAllocation / 100);
      const targetSavingsGoal = currentTakeHome * emergencyFundMultiplier;
      
      const isPhase1 = currentSavings < targetSavingsGoal;
      const currentSplitPct = isPhase1 ? initialSplit : postGoalSplit;
      
      const monthlySavingsDeposit = totalAllocatedDollars * (currentSplitPct / 100);
      const monthlyInvestDeposit = totalAllocatedDollars * (1 - currentSplitPct / 100);

      const savingsInterest = currentSavings * sApr;
      const investGains = currentInvestments * iRoi;

      currentSavings += monthlySavingsDeposit + savingsInterest;
      currentInvestments += monthlyInvestDeposit + investGains;

      data.push({
        month: m,
        year: currentYear,
        savings: round(currentSavings),
        investments: round(currentInvestments),
        total: round(currentSavings + currentInvestments),
        income: round(currentTakeHome),
        gains: round(savingsInterest + investGains),
        deposited: round(totalAllocatedDollars),
        phase: isPhase1 ? 1 : 2
      });
    }
    return data;
  }, [income, incomeType, taxStatus, estTaxRate, totalAllocation, initialSplit, postGoalSplit, emergencyFundMultiplier, savingsApr, investRoi, duration, raises, startingSavings, startingInvestments]);

  const stats = useMemo(() => {
    const last = projectionData[projectionData.length - 1] || { total: 0, savings: 0, investments: 0, income: 0 };
    return {
      finalBalance: last.total,
      finalSavings: last.savings,
      finalInvestments: last.investments,
      totalGains: round(projectionData.reduce((sum, d) => sum + d.gains, 0)),
      maxYears: Math.ceil(duration / 12)
    };
  }, [projectionData, duration]);

  const paginatedTableData = useMemo(() => projectionData.filter(d => d.year === currentTableYear), [projectionData, currentTableYear]);

  const strategyHeader = useMemo(() => {
    if (!paginatedTableData.length) return null;
    const yearIncome = paginatedTableData[0].income;
    const monthlyTotal = yearIncome * (totalAllocation / 100);
    
    return {
      income: yearIncome,
      p1: {
        sav: round(monthlyTotal * (initialSplit / 100)),
        inv: round(monthlyTotal * (1 - initialSplit / 100))
      },
      p2: {
        sav: round(monthlyTotal * (postGoalSplit / 100)),
        inv: round(monthlyTotal * (1 - postGoalSplit / 100))
      }
    };
  }, [paginatedTableData, totalAllocation, initialSplit, postGoalSplit]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-2 md:p-8">
      
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">WealthFlow Manual</h2>
                  <p className="text-xs uppercase font-black text-slate-400 tracking-widest">Mastering Asset Rotation</p>
                </div>
              </div>
              <button onClick={() => setIsInfoOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-12 text-left">
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600 border-b border-blue-50 pb-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-black text-sm uppercase tracking-wider">The Vision</h3>
                </div>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                  WealthFlow is a dynamic financial engine designed to help you bridge the gap between building security and achieving wealth.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-800"><ShieldCheck className="w-5 h-5" /> Phase 1: Defensive</div>
                    <p className="text-sm text-emerald-700 leading-relaxed">Initially, you build your Emergency Fund. Split contributions 50/50 to capture early growth while filling your cash bucket.</p>
                  </div>
                  <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-indigo-800"><TrendingUp className="w-5 h-5" /> Phase 2: Offensive</div>
                    <p className="text-sm text-indigo-700 leading-relaxed">Once your safety net is set (3x-6x income), the engine pivots to 75% investing to maximize compound interest.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-2 text-blue-600 border-b border-blue-50 pb-2">
                  <MousePointer2 className="w-5 h-5" />
                  <h3 className="font-black text-sm uppercase tracking-wider">The Command Center</h3>
                </div>
                
                <div className="space-y-10">
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center font-black text-emerald-600 shadow-sm border border-emerald-200">01</div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest"><Wallet className="w-4 h-4 text-emerald-500" /> Income Setup</h5>
                      <p className="text-sm text-slate-500 leading-relaxed">Input your gross pay. Toggle "Before Tax" to enter your tax rate. The app calculates your real take-home pay available for allocation.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-200">02</div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest"><Target className="w-4 h-4 text-blue-500" /> Trigger & Split</h5>
                      <p className="text-sm text-slate-500 leading-relaxed">Set your total contribution % and the target multiple (e.g., 3x). Once savings reach that goal, the app pivots splits automatically.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-black text-orange-600 shadow-sm border border-orange-200">03</div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest"><RefreshCw className="w-4 h-4 text-orange-500" /> Yearly Milestones</h5>
                      <p className="text-sm text-slate-500 leading-relaxed">Add annual raises. Toggle between % (cost-of-living) or $ (promotions) to see your future growth accelerate.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsInfoOpen(false)} className="px-8 py-4 bg-blue-600 text-white font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Let's Begin</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight text-left">WealthFlow Planner</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm md:text-base text-slate-500 font-medium">Intelligent Asset Rotation</p>
              {isSaving ? <span className="text-xs text-blue-500 font-bold uppercase tracking-widest animate-pulse">Saving...</span> : <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1"><Cloud className="w-2.5 h-2.5" /> Synced</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsInfoOpen(true)} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 text-sm font-extrabold group hover:shadow-md transition-all text-blue-600">
              <Info className="w-5 h-5" /> Manual
            </button>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Final Net Worth</p>
              <p className="text-xl md:text-2xl font-black text-slate-800">{formatCurrency(stats.finalBalance)}</p>
            </div>
            <button onClick={resetToDefaults} className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors text-slate-500"><RotateCcw className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 border-slate-200">
              <h2 className="font-bold flex items-center gap-2 text-slate-700 text-left text-base md:text-lg"><Wallet className="w-5 h-5 text-emerald-500" /> Income Setup</h2>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={income} onChange={(e) => setIncome(round(e.target.value))} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                  <option value="hourly">Hourly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {['before', 'after'].map(s => (
                  <button key={s} onClick={() => setTaxStatus(s)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${taxStatus === s ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    {s === 'before' ? 'Pre-Tax' : 'Post-Tax'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 border-slate-200">
              <h2 className="font-bold flex items-center gap-2 text-slate-700 text-left text-base md:text-lg"><Settings2 className="w-5 h-5 text-blue-500" /> Allocation Strategy</h2>
              <div className="space-y-6 text-left">
                 <div>
                  <div className="flex justify-between text-sm font-bold mb-3"><span>Total % to Future</span><span>{totalAllocation}%</span></div>
                  <input type="range" min="1" max="50" value={totalAllocation} onChange={(e) => setTotalAllocation(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none accent-blue-600" />
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Target className="w-4 h-4 text-blue-500" /> Phase Switch Trigger</div>
                  <div className="flex items-center gap-3">
                    <input type="number" value={emergencyFundMultiplier} onChange={(e) => setEmergencyFundMultiplier(Number(e.target.value))} className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-base font-bold text-center outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-sm text-slate-500 font-bold">x Monthly Income</span>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-2 tracking-wider text-left">Phase 1: Security Split</p>
                    <div className="flex justify-between text-xs mb-1 font-bold"><span>Sav: {initialSplit}%</span><span>Inv: {100-initialSplit}%</span></div>
                    <input type="range" min="0" max="100" value={initialSplit} onChange={(e) => setInitialSplit(Number(e.target.value))} className="w-full h-2 accent-emerald-500" />
                  </div>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-700 uppercase mb-2 tracking-wider text-left">Phase 2: Wealth Split</p>
                    <div className="flex justify-between text-xs mb-1 font-bold"><span>Sav: {postGoalSplit}%</span><span>Inv: {100-postGoalSplit}%</span></div>
                    <input type="range" min="0" max="100" value={postGoalSplit} onChange={(e) => setPostGoalSplit(Number(e.target.value))} className="w-full h-2 accent-indigo-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 ${duration <= 12 ? 'opacity-30 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2 text-slate-700 text-left text-base md:text-lg"><RefreshCw className="w-5 h-5 text-orange-500" /> Yearly Milestones</h2>
                <button onClick={addRaise} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Plus /></button>
              </div>
              <div className="space-y-3">
                {raises.map(r => (
                  <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative shadow-sm text-left">
                    <button onClick={() => removeRaise(r.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Effective After</label>
                        <select value={r.afterYear} onChange={(e) => updateRaise(r.id, 'afterYear', Number(e.target.value))} className="w-full text-sm p-2 bg-white border border-slate-200 rounded font-bold outline-none mt-1">
                          {Array.from({ length: Math.ceil(duration/12) - 1 }).map((_, i) => (
                            <option key={i+1} value={i+1}>Year {i+1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Raise</label>
                          <button onClick={() => updateRaise(r.id, 'isPercent', !r.isPercent)} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-all text-left">
                            {r.isPercent ? 'To $' : 'To %'}
                          </button>
                        </div>
                        <div className="relative mt-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{r.isPercent ? '%' : '$'}</span>
                          <input type="number" value={r.value} onChange={(e) => updateRaise(r.id, 'value', Number(e.target.value))} className="w-full text-sm pl-6 p-2 bg-white border border-slate-200 rounded font-bold outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-400 border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cash Reserve</p>
                <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.finalSavings)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-indigo-400 border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Market Value</p>
                <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.finalInvestments)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-amber-400 border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Growth</p>
                <p className="text-2xl font-black text-amber-600">{formatCurrency(stats.totalGains)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left">
               <div className="flex items-center justify-between mb-8">
                <div><h3 className="font-bold text-slate-800 text-lg tracking-tight">Growth Forecast</h3><p className="text-sm text-slate-500 font-medium">Projected net worth trajectory</p></div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400 ml-1" />
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="text-sm font-bold border-none bg-transparent outline-none pr-8 focus:ring-0">
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={60}>5 Years</option>
                    <option value={120}>10 Years</option>
                  </select>
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => v % 12 === 0 ? `Y${v/12}` : ''} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => `$${v/1000}k`} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(m) => `Month ${m}`} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="savings" name="Savings" stackId="1" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="investments" name="Investments" stackId="1" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left">
               <div className="p-4 md:p-6 border-b flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
                <div className="w-full sm:w-auto">
                  <h3 className="font-bold text-slate-800 text-base md:text-lg tracking-tight uppercase">Wealth Roadmap - Year {currentTableYear}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Wallet className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-slate-400 uppercase tracking-tighter text-left">Income:</span> 
                      <span className="text-blue-600 font-black">{formatCurrency(strategyHeader?.income)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-slate-400 uppercase tracking-tighter text-left">P1 Goal:</span> 
                      <span className="text-emerald-600 font-black">{formatCurrency(strategyHeader?.p1.sav)} Sav / {formatCurrency(strategyHeader?.p1.inv)} Inv</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold border-l pl-3 border-slate-200">
                      <span className="text-slate-400 uppercase tracking-tighter text-left">P2 Goal:</span> 
                      <span className="text-indigo-600 font-black">{formatCurrency(strategyHeader?.p2.sav)} Sav / {formatCurrency(strategyHeader?.p2.inv)} Inv</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm self-end sm:self-center">
                  <button onClick={() => setCurrentTableYear(v => Math.max(1, v-1))} className="p-2 hover:bg-slate-50 rounded transition-colors text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
                  <span className="text-xs font-black w-16 text-center text-slate-600 tracking-widest">YEAR {currentTableYear}</span>
                  <button onClick={() => setCurrentTableYear(v => Math.min(stats.maxYears, v+1))} className="p-2 hover:bg-slate-50 rounded transition-colors text-slate-600"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap table-fixed sm:table-auto">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] md:text-xs uppercase font-black text-slate-400 border-b border-slate-200">
                      <th className="px-4 md:px-6 py-4 w-[100px] md:w-auto">Month</th>
                      <th className="px-4 md:px-6 py-4 text-emerald-600">Savings Bal.</th>
                      <th className="px-4 md:px-6 py-4 text-indigo-600">Invest Bal.</th>
                      <th className="px-4 md:px-6 py-4 text-amber-600">Gains</th>
                      <th className="px-4 md:px-6 py-4 text-slate-800">Total Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedTableData.map((row, idx) => {
                      const prevRow = paginatedTableData[idx - 1] || (currentTableYear > 1 ? projectionData[(currentTableYear - 1) * 12 - 1] : null);
                      const isTransition = prevRow && prevRow.phase === 1 && row.phase === 2;

                      return (
                        <Fragment key={row.month}>
                          {isTransition && (
                            <tr className="bg-blue-600 shadow-inner text-center">
                              <td colSpan="5" className="px-4 py-3">
                                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-[0.2em] justify-center">
                                  <Zap className="w-4 h-4 fill-white" /> Phase 2 Activated: Growth Pivot
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr className="hover:bg-slate-50 transition-all text-sm md:text-base">
                            <td className={`px-4 md:px-6 py-5 font-black border-l-4 transition-colors ${row.phase === 1 ? 'bg-emerald-50/40 text-emerald-800 border-l-emerald-400' : 'bg-indigo-50/40 text-indigo-800 border-l-indigo-400'}`}>
                              Month {row.month}
                            </td>
                            <td className="px-4 md:px-6 py-5 font-bold text-emerald-600/90 tracking-tighter">{formatCurrency(row.savings)}</td>
                            <td className="px-4 md:px-6 py-5 font-bold text-indigo-600/90 tracking-tighter">{formatCurrency(row.investments)}</td>
                            <td className="px-4 md:px-6 py-5 text-amber-600 font-black tracking-tighter">+{formatCurrency(row.gains)}</td>
                            <td className="px-4 md:px-6 py-5 font-black text-slate-800 tracking-tighter">{formatCurrency(row.total)}</td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;