
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  Settings, 
  History, 
  PlusCircle, 
  Volume2, 
  RotateCcw, 
  Moon, 
  Sun, 
  Share2, 
  Award,
  Timer,
  Play,
  X,
  Printer,
  ChevronRight,
  Target
} from 'lucide-react';

// --- Types ---
type Category = 'Alphabets' | 'Numbers' | 'Animals' | 'Colors';

interface GameItem {
  id: string;
  value: string;
  category: Category;
  display: string;
}

interface MoveLog {
  timestamp: number;
  item: string;
  correct: boolean;
}

// --- Helper for generating Alphabet and Numbers ---
const generateAlphabets = (): GameItem[] => {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => ({
    id: `alpha-${letter}`,
    value: letter,
    category: 'Alphabets',
    display: letter
  }));
};

const generateNumbers = (): GameItem[] => {
  const nums: GameItem[] = [];
  for (let i = 1; i <= 100; i++) {
    nums.push({
      id: `num-${i}`,
      value: i.toString(),
      category: 'Numbers',
      display: i.toString()
    });
  }
  return nums;
};

// --- Constants ---
const INITIAL_DATA: GameItem[] = [
  ...generateAlphabets(),
  ...generateNumbers(),
  // Animals
  { id: 'an1', value: 'Lion', category: 'Animals', display: '🦁' },
  { id: 'an2', value: 'Tiger', category: 'Animals', display: '🐯' },
  { id: 'an3', value: 'Monkey', category: 'Animals', display: '🐒' },
  { id: 'an4', value: 'Elephant', category: 'Animals', display: '🐘' },
  { id: 'an5', value: 'Giraffe', category: 'Animals', display: '🦒' },
  { id: 'an6', value: 'Zebra', category: 'Animals', display: '🦓' },
  { id: 'an7', value: 'Panda', category: 'Animals', display: '🐼' },
  { id: 'an8', value: 'Koala', category: 'Animals', display: '🐨' },
  { id: 'an9', value: 'Kangaroo', category: 'Animals', display: '🦘' },
  { id: 'an10', value: 'Rabbit', category: 'Animals', display: '🐰' },
  { id: 'an11', value: 'Cat', category: 'Animals', display: '🐱' },
  { id: 'an12', value: 'Dog', category: 'Animals', display: '🐶' },
  { id: 'an13', value: 'Horse', category: 'Animals', display: '🐴' },
  { id: 'an14', value: 'Pig', category: 'Animals', display: '🐷' },
  { id: 'an15', value: 'Cow', category: 'Animals', display: '🐮' },
  { id: 'an16', value: 'Sheep', category: 'Animals', display: '🐑' },
  { id: 'an17', value: 'Chicken', category: 'Animals', display: '🐔' },
  { id: 'an18', value: 'Duck', category: 'Animals', display: '🦆' },
  { id: 'an19', value: 'Frog', category: 'Animals', display: '🐸' },
  { id: 'an20', value: 'Snake', category: 'Animals', display: '🐍' },
  { id: 'an21', value: 'Turtle', category: 'Animals', display: '🐢' },
  { id: 'an22', value: 'Whale', category: 'Animals', display: '🐳' },
  { id: 'an23', value: 'Dolphin', category: 'Animals', display: '🐬' },
  { id: 'an24', value: 'Shark', category: 'Animals', display: '🦈' },
  { id: 'an25', value: 'Octopus', category: 'Animals', display: '🐙' },
  // Colors
  { id: 'c1', value: 'Red', category: 'Colors', display: '🔴' },
  { id: 'c2', value: 'Blue', category: 'Colors', display: '🔵' },
  { id: 'c3', value: 'Green', category: 'Colors', display: '🟢' },
  { id: 'c4', value: 'Yellow', category: 'Colors', display: '🟡' },
  { id: 'c5', value: 'Orange', category: 'Colors', display: '🟠' },
  { id: 'c6', value: 'Purple', category: 'Colors', display: '🟣' },
  { id: 'c7', value: 'Brown', category: 'Colors', display: '🟤' },
  { id: 'c8', value: 'Black', category: 'Colors', display: '⚫' },
  { id: 'c9', value: 'White', category: 'Colors', display: '⚪' },
  { id: 'c10', value: 'Pink', category: 'Colors', display: '🌸' },
  { id: 'c11', value: 'Teal', category: 'Colors', display: '🌊' },
  { id: 'c12', value: 'Gray', category: 'Colors', display: '🔘' },
];

const ACHIEVEMENTS = [
  { id: 'newbie', name: 'Smart Start', description: 'Score your first 5 points', threshold: 5 },
  { id: 'streak5', name: 'Unstoppable', description: 'Get a streak of 5', streak: 5 },
  { id: 'master', name: 'Genius Kid', description: 'Reach a High Score of 50', threshold: 50 },
];

const App: React.FC = () => {
  // --- State ---
  const [activeCategory, setActiveCategory] = useState<Category>('Alphabets');
  const [items, setItems] = useState<GameItem[]>(INITIAL_DATA);
  const [currentTiles, setCurrentTiles] = useState<GameItem[]>([]);
  const [targetItem, setTargetItem] = useState<GameItem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [history, setHistory] = useState<MoveLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const [customInput, setCustomInput] = useState({ value: '', display: '', category: 'Alphabets' as Category });
  const [achievements, setAchievements] = useState<string[]>([]);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- Refs ---
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetZoneRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadTiles = useCallback(() => {
    const filtered = items.filter(i => i.category === activeCategory);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 4);
    setCurrentTiles(shuffled);
    if (shuffled.length > 0) {
      const newTarget = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTargetItem(newTarget);
    }
  }, [activeCategory, items]);

  const saveProgress = useCallback(() => {
    const data = { score, streak, highScore, achievements, items, history };
    localStorage.setItem('abc_123_progress', JSON.stringify(data));
  }, [score, streak, highScore, achievements, items, history]);

  // --- Effects ---
  useEffect(() => {
    const saved = localStorage.getItem('abc_123_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setHighScore(parsed.highScore || 0);
      if (parsed.items && parsed.items.length > INITIAL_DATA.length) {
         setItems(parsed.items);
      }
      setHistory(parsed.history || []);
      setAchievements(parsed.achievements || []);
    }
  }, []);

  useEffect(() => {
    if (gameStarted) {
      loadTiles();
    }
  }, [gameStarted, activeCategory, loadTiles]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameStarted(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    saveProgress();
    ACHIEVEMENTS.forEach(ach => {
      if (!achievements.includes(ach.id)) {
        if (ach.threshold && score >= ach.threshold) setAchievements(p => [...p, ach.id]);
        if (ach.streak && streak >= ach.streak) setAchievements(p => [...p, ach.id]);
      }
    });
  }, [score, streak, highScore, achievements, saveProgress]);

  // --- Core Functions ---
  const handleDrop = (droppedValue: string) => {
    if (!targetItem) return;

    const isCorrect = droppedValue === targetItem.value;
    
    setHistory(prev => [{ 
      timestamp: Date.now(), 
      item: targetItem.display, 
      correct: isCorrect 
    }, ...prev].slice(0, 50));

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      if (score + 1 > highScore) setHighScore(score + 1);
      setLastFeedback('correct');
      speak("Great job! " + targetItem.value);
      // @ts-ignore
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setLastFeedback(null);
        loadTiles();
      }, 800);
    } else {
      setStreak(0);
      setLastFeedback('wrong');
      speak("Oops! Try again.");
      setTimeout(() => setLastFeedback(null), 500);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, value: string) => {
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (targetZoneRef.current && (targetZoneRef.current === targetElement || targetZoneRef.current.contains(targetElement))) {
      handleDrop(value);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    loadTiles();
  };

  const addCustomItem = () => {
    if (customInput.value && customInput.display) {
      const newItem: GameItem = {
        id: `custom-${Date.now()}`,
        value: customInput.value,
        display: customInput.display,
        category: customInput.category
      };
      setItems(prev => [...prev, newItem]);
      setCustomInput({ value: '', display: '', category: 'Alphabets' });
      setShowCustomAdd(false);
      speak("Item added!");
    }
  };

  const shareScore = () => {
    const text = `Hey! I just scored ${score} points on APNA_NAAM ABC 123 Learning! High score: ${highScore} 🎮✨`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const printCertificate = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Genius Certificate</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap');
            body { font-family: 'Fredoka', sans-serif; text-align: center; padding: 50px; border: 15px solid #6C5CE7; background-color: #f9f9f9; }
            h1 { color: #6C5CE7; font-size: 48px; margin-bottom: 20px; }
            p { font-size: 24px; margin: 10px 0; }
            .score { color: #FF6B6B; font-weight: bold; font-size: 32px; }
            .seal { margin-top: 40px; font-size: 60px; }
          </style>
        </head>
        <body>
          <div class="seal">🏆</div>
          <h1>CERTIFICATE OF ACHIEVEMENT</h1>
          <p>Proudly presented to a Little Genius</p>
          <p>For mastering learning games with a Score of <span class="score">${score}</span></p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </body>
      </html>
    `);
    win.print();
  };

  const CategoryBtn: React.FC<{ cat: Category }> = ({ cat }) => (
    <button 
      onClick={() => setActiveCategory(cat)}
      className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full transition-all text-sm md:text-base whitespace-nowrap font-medium ${activeCategory === cat ? 'bg-primary text-white scale-105 shadow-[0_0_15px_rgba(108,92,231,0.4)]' : 'bg-white/10 hover:bg-white/20'}`}
    >
      {cat}
    </button>
  );

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start p-3 md:p-8 transition-colors duration-500 pb-16 ${isDarkMode ? 'dark bg-slate-950' : ''}`}>
      
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-3 md:mb-8 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl md:text-5xl font-bold neon-glow text-accent2 tracking-tight leading-tight">
            APNA_NAAM ABC 123
          </h1>
          <span className="text-[10px] sm:text-xs md:text-base text-secondary font-medium uppercase tracking-widest opacity-80">LEARNING IS FUN! 🎮✨</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 sm:p-2.5 rounded-full glass hover:scale-110 transition active:scale-95">
            {isDarkMode ? <Sun size={18} className="text-yellow-400 sm:w-6 sm:h-6" /> : <Moon size={18} className="sm:w-6 sm:h-6" />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 sm:p-2.5 rounded-full glass hover:scale-110 transition active:scale-95">
            <Settings size={18} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-5xl flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-8 flex-grow">
        
        {/* Left/Stats Column */}
        <div className="lg:col-span-1 order-2 lg:order-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
            <div className="glass p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] flex flex-col gap-1 md:gap-3 shadow-xl border-t border-white/20">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] md:text-sm uppercase tracking-widest">Score</span>
                <Trophy size={14} className="text-accent2" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">{score}</div>
              <div className="h-1.5 md:h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out" 
                  style={{ width: `${Math.min((score / 50) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] md:text-sm font-medium">
                <span className="text-accent3">Streak: {streak}</span>
                <span className="text-accent2">Best: {highScore}</span>
              </div>
            </div>

            <div className="glass p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] flex flex-col gap-1 md:gap-3 shadow-xl border-t border-white/20">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] md:text-sm uppercase tracking-widest">Time</span>
                <Timer size={14} className="text-accent1" />
              </div>
              <div className={`text-2xl sm:text-3xl md:text-5xl font-bold leading-tight ${timeLeft < 10 ? 'text-accent1 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </div>
              <div className="text-[9px] md:text-xs opacity-40 uppercase tracking-widest mt-auto">Countdown</div>
            </div>
          </div>

          {/* History */}
          <div className="glass p-4 rounded-2xl md:rounded-[2.5rem] flex flex-col gap-2 shadow-xl overflow-hidden md:flex-grow">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs md:text-base font-bold flex items-center gap-2 uppercase tracking-widest opacity-70"><History size={16} /> History</h3>
              <button onClick={() => setShowHistory(true)} className="text-[9px] md:text-xs text-secondary font-bold underline hover:text-white transition">VIEW ALL</button>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[120px] md:max-h-none scrollbar-hide">
              {history.slice(0, 4).map((h, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] md:text-sm p-2 bg-white/5 rounded-xl border border-white/5">
                  <span className="flex items-center gap-2 font-medium">Item: {h.item}</span>
                  <span className={h.correct ? 'text-accent3 font-bold' : 'text-accent1 font-bold'}>
                    {h.correct ? '✓ OK' : '✗ NO'}
                  </span>
                </div>
              ))}
              {history.length === 0 && <div className="text-center text-white/20 italic py-6 text-xs">Play to see history!</div>}
            </div>
          </div>
        </div>

        {/* Center/Game Area */}
        <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col gap-4 md:gap-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar px-1">
            {(['Alphabets', 'Numbers', 'Animals', 'Colors'] as Category[]).map(cat => (
              <CategoryBtn key={cat} cat={cat} />
            ))}
          </div>

          <div className={`relative min-h-[260px] sm:min-h-[300px] md:min-h-[480px] flex-grow glass rounded-[2.5rem] md:rounded-[3.5rem] p-5 md:p-10 flex flex-col items-center justify-center border-4 transition-all duration-300 ${lastFeedback === 'correct' ? 'border-accent3 shadow-[0_0_60px_rgba(29,209,161,0.3)]' : lastFeedback === 'wrong' ? 'border-accent1 shadow-[0_0_60px_rgba(255,107,107,0.3)]' : 'border-white/10'}`}>
            {!gameStarted ? (
              <div className="flex flex-col items-center gap-4 md:gap-8 animate-float py-8">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl hover:rotate-6 transition">
                  <Play size={40} className="text-white ml-2 sm:w-16 sm:h-16 md:w-24 md:h-24" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">Ready for Fun?</h2>
                  <p className="text-[10px] md:text-sm text-white/50 uppercase tracking-widest font-bold">Pick a category & start!</p>
                </div>
                <button 
                  onClick={startGame}
                  className="px-8 py-3 md:px-12 md:py-5 bg-accent3 hover:bg-accent3/80 text-white rounded-full font-black text-lg md:text-2xl shadow-xl hover:scale-110 transition active:scale-95 uppercase tracking-tighter"
                >
                  GO PLAY!
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-between gap-4 md:gap-10">
                {/* Target Information */}
                <div className="flex flex-col items-center gap-3 md:gap-5 w-full">
                  <div className="text-[10px] md:text-sm text-white/60 font-black uppercase tracking-[0.2em] mb-1">Target Item</div>
                  <div className="flex items-center justify-center gap-4 md:gap-8 w-full">
                    <div 
                      ref={targetZoneRef}
                      className="w-28 h-28 sm:w-32 sm:h-32 md:w-56 md:h-56 rounded-[2rem] md:rounded-[3rem] bg-white/5 border-4 border-dashed border-white/20 flex items-center justify-center text-4xl sm:text-5xl md:text-8xl shadow-inner relative transition-transform hover:rotate-1"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const val = e.dataTransfer.getData('text');
                        handleDrop(val);
                      }}
                    >
                      <Target className="text-white/5 absolute" size={120} />
                      <span className="relative z-10 text-accent2 font-black animate-pulse drop-shadow-xl">{targetItem?.value}</span>
                    </div>
                    <button 
                      onClick={() => speak(`Find the ${targetItem?.value}`)}
                      className="p-4 sm:p-5 md:p-8 rounded-full bg-secondary text-white hover:scale-110 transition shadow-[0_0_30px_rgba(0,210,211,0.4)] active:scale-90"
                    >
                      <Volume2 size={24} className="sm:w-8 sm:h-8 md:w-12 md:h-12" />
                    </button>
                  </div>
                </div>

                {/* Choices/Tiles Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 w-full max-w-2xl">
                  {currentTiles.map(tile => (
                    <div
                      key={tile.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text', tile.value)}
                      onTouchEnd={(e) => handleTouchEnd(e, tile.value)}
                      onClick={() => handleDrop(tile.value)}
                      className="h-20 sm:h-24 md:h-36 rounded-2xl md:rounded-[2rem] glass flex items-center justify-center text-2xl sm:text-3xl md:text-6xl cursor-pointer hover:scale-105 transition-all shadow-xl hover:bg-white/20 select-none active:bg-white/40 active:scale-95 border-b-4 border-black/20"
                    >
                      {tile.display}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] md:text-sm text-white/40 font-bold uppercase tracking-widest text-center">Drag or touch the correct one!</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Action Buttons Bar */}
      <div className="w-full max-w-5xl mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-5 px-1">
        <button onClick={() => setShowCustomAdd(true)} className="flex items-center gap-2 px-4 py-2.5 md:px-7 md:py-4 glass rounded-full hover:bg-white/20 transition text-[10px] md:text-sm font-bold uppercase tracking-widest active:scale-95">
          <PlusCircle size={14} /> Add
        </button>
        <button onClick={shareScore} className="flex items-center gap-2 px-4 py-2.5 md:px-7 md:py-4 glass rounded-full hover:bg-white/20 transition text-[10px] md:text-sm font-bold uppercase tracking-widest active:scale-95">
          <Share2 size={14} /> Share
        </button>
        <button onClick={printCertificate} className="flex items-center gap-2 px-4 py-2.5 md:px-7 md:py-4 glass rounded-full hover:bg-white/20 transition text-[10px] md:text-sm font-bold uppercase tracking-widest active:scale-95">
          <Printer size={14} /> Certificate
        </button>
        <button onClick={() => { if(confirm("Clear all game data?")) { localStorage.clear(); location.reload(); } }} className="flex items-center gap-2 px-4 py-2.5 md:px-7 md:py-4 glass rounded-full hover:bg-accent1/80 hover:text-white transition text-[10px] md:text-sm font-bold uppercase tracking-widest active:scale-95">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Modals & Popups */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glass max-w-md w-full rounded-[2.5rem] p-7 md:p-10 relative border-2 border-white/10">
            <button onClick={() => setShowSettings(false)} className="absolute top-5 right-5 p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={20}/></button>
            <h2 className="text-2xl md:text-4xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter"><Settings className="text-primary" size={28}/> Settings</h2>
            <div className="space-y-8 text-sm md:text-base font-bold">
              <div className="space-y-3">
                <span className="opacity-50 uppercase text-[11px] tracking-widest">Master Volume</span>
                <input type="range" className="accent-primary w-full h-2 rounded-lg" />
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                <span className="uppercase text-[11px] tracking-widest">Voice Guidance</span>
                <div className="w-12 h-6 bg-accent3 rounded-full flex items-center px-1 shadow-inner"><div className="w-4 h-4 bg-white rounded-full"></div></div>
              </div>
              <div>
                <span className="block mb-3 opacity-50 uppercase text-[11px] tracking-widest">Speech Speed</span>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black transition">SLOW</button>
                  <button className="flex-1 py-3 bg-primary rounded-xl text-xs font-black transition shadow-lg">NORMAL</button>
                  <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black transition">FAST</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glass max-w-md w-full rounded-[2.5rem] p-7 md:p-10 relative border-2 border-white/10">
            <button onClick={() => setShowCustomAdd(false)} className="absolute top-5 right-5 p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={20}/></button>
            <h2 className="text-2xl md:text-4xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter"><PlusCircle className="text-secondary" size={28}/> New Item</h2>
            <div className="space-y-5">
              <input placeholder="Item Name (e.g. Bear)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold" value={customInput.value} onChange={e => setCustomInput(p => ({ ...p, value: e.target.value }))} />
              <input placeholder="Emoji/Visual (e.g. 🐻)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-2xl text-center" value={customInput.display} onChange={e => setCustomInput(p => ({ ...p, display: e.target.value }))} />
              <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none text-sm font-bold uppercase tracking-widest appearance-none" value={customInput.category} onChange={e => setCustomInput(p => ({ ...p, category: e.target.value as Category }))}>
                <option value="Alphabets">Alphabets</option><option value="Numbers">Numbers</option><option value="Animals">Animals</option><option value="Colors">Colors</option>
              </select>
              <button onClick={addCustomItem} className="w-full py-5 bg-primary rounded-2xl font-black text-lg hover:scale-105 transition active:scale-95 shadow-2xl uppercase tracking-tighter mt-4">Save To Library</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="glass max-w-lg w-full rounded-[2.5rem] p-7 md:p-10 relative max-h-[85vh] flex flex-col border-2 border-white/10">
            <button onClick={() => setShowHistory(false)} className="absolute top-5 right-5 p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={20}/></button>
            <h2 className="text-2xl md:text-4xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter"><History className="text-accent2" size={28}/> All Moves</h2>
            <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                  <div className="flex flex-col">
                    <span className="font-black text-sm uppercase tracking-tight">Solved: {h.item}</span>
                    <span className="text-[9px] text-white/30 uppercase font-bold">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className={h.correct ? 'text-accent3 font-black text-xs bg-accent3/10 px-3 py-1 rounded-full' : 'text-accent1 font-black text-xs bg-accent1/10 px-3 py-1 rounded-full'}>
                    {h.correct ? 'MATCH' : 'MISS'}
                  </span>
                </div>
              ))}
              {history.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase tracking-[0.3em]">No Logs</div>}
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="w-full mt-auto pt-10 pb-4 text-white/20 text-[9px] md:text-xs flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {achievements.map(ach => {
            const data = ACHIEVEMENTS.find(a => a.id === ach);
            return (
              <div key={ach} title={data?.description} className="p-2.5 bg-accent2/10 text-accent2 rounded-full border border-accent2/20 animate-pulse">
                <Award size={18} />
              </div>
            );
          })}
        </div>
        <div className="font-bold uppercase tracking-[0.4em]">APNA_NAAM DEVELOPERS</div>
      </footer>

    </div>
  );
};

export default App;
