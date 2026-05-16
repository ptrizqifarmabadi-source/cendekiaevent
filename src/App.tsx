import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfToday,
  startOfDay,
  addDays,
  isAfter,
  isBefore
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  List, 
  Bell,
  LogOut,
  User,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Category, Division } from './types';
import { activityService } from './services/activityService';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Components
import ActivityModal from './components/ActivityModal';
import FilterBar from './components/FilterBar';
import ActivityList from './components/ActivityList';

const CATEGORIES: Category[] = [
  'Akademik', 
  'Acara Asrama', 
  'Acara Operasional', 
  'Ekstrakurikuler', 
  'Acara Sekolah', 
  'Rapat', 
  'Lain-lain'
];
const DIVISIONS: Division[] = ['Akademik', 'Asrama', 'Operasional'];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(CATEGORIES);
  const [selectedDivisions, setSelectedDivisions] = useState<Division[]>(DIVISIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Compute all unique categories from current activities plus defaults
  const allAvailableCategories = Array.from(new Set([
    ...CATEGORIES,
    ...activities.flatMap(a => a.categories || [])
  ])).sort();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    const unsubscribeActivities = activityService.subscribeToActivities((data) => {
      setActivities(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeActivities();
    };
  }, []);

  const filteredActivities = activities.filter(activity => 
    activity.categories.some(cat => selectedCategories.includes(cat)) &&
    selectedDivisions.includes(activity.division || 'Akademik')
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalBudgetMonth = filteredActivities
    .filter(activity => {
      const start = activity.date?.toDate ? activity.date.toDate() : new Date(activity.date);
      return isSameMonth(start, monthStart);
    })
    .reduce((sum, activity) => sum + (activity.budget || 0), 0);

  const handleDayClick = (day: Date) => {
    // Possibly open modal with pre-filled date or filter list
  };

  const getActivitiesForDay = (day: Date) => {
    return filteredActivities.filter(activity => {
      const start = activity.date?.toDate ? activity.date.toDate() : new Date(activity.date);
      const end = activity.endDate?.toDate ? activity.endDate.toDate() : (activity.endDate ? new Date(activity.endDate) : start);
      
      const dayStart = startOfDay(day);
      const activityStart = startOfDay(start);
      const activityEnd = startOfDay(end);

      return (isSameDay(day, start) || isSameDay(day, end)) || (isAfter(day, activityStart) && isBefore(day, activityEnd));
    });
  };

  const upcomingActivities = filteredActivities
    .filter(activity => {
      const start = activity.date?.toDate ? activity.date.toDate() : new Date(activity.date);
      const end = activity.endDate?.toDate ? activity.endDate.toDate() : (activity.endDate ? new Date(activity.endDate) : start);
      return isAfter(end, startOfToday()) || isSameDay(end, startOfToday());
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibrant-bg text-vibrant-dark font-sans flex flex-col">
      {/* Header */}
      <header className="bg-vibrant-red border-b-[4px] border-vibrant-dark px-6 py-5 sticky top-0 z-30 shadow-[0_4px_0_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white border-[3px] border-vibrant-dark p-1 rounded-xl flex items-center justify-center shadow-[3px_3px_0_#2D3436] overflow-hidden">
               <img 
                 src="https://lh3.googleusercontent.com/d/1ugonzA_1B-ukGoqRRUIQbLK8QPIzo26V" 
                 alt="Sekolah Cendekia BAZNAS Logo" 
                 className="w-10 h-10 object-contain"
                 referrerPolicy="no-referrer"
               />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Cendekia Event</h1>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em] mt-1">Sekolah Cendekia BAZNAS</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white border-[2px] border-vibrant-dark px-4 py-2 rounded-full shadow-[3px_3px_0_#2D3436]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full border border-vibrant-dark" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-vibrant-yellow border border-vibrant-dark flex items-center justify-center">
                      <User size={14} />
                    </div>
                  )}
                  <span className="text-xs font-black">{user.displayName}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 bg-vibrant-dark text-white rounded-xl shadow-[3px_3px_0_#FF6B6B] hover:translate-y-[-2px] transition-all"
                  title="Keluar"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="bg-white text-vibrant-dark border-[3px] border-vibrant-dark px-6 py-2 rounded-xl font-black text-sm shadow-[4px_4px_0_#2D3436] hover:translate-y-[-2px] active:translate-y-[1px] transition-all uppercase italic"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-8">
          <section className="bg-white border-[3px] border-vibrant-dark p-6 rounded-2xl shadow-[6px_6px_0_#2D3436]">
            <h2 className="text-sm font-black text-vibrant-red uppercase tracking-widest mb-4 border-b-2 border-vibrant-yellow pb-2">Filter Divisi</h2>
            <div className="flex flex-col gap-2 mb-6">
              {DIVISIONS.map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivisions(prev => prev.includes(div) ? (prev.length > 1 ? prev.filter(d => d !== div) : prev) : [...prev, div])}
                  className={`flex items-center justify-between px-4 py-2 rounded-xl text-[10px] font-black transition-all border-[2px] shadow-[2px_2px_0_#2D3436] ${
                    selectedDivisions.includes(div) 
                      ? 'bg-vibrant-teal text-white border-vibrant-dark' 
                      : 'bg-white text-vibrant-dark/40 border-vibrant-dark'
                  }`}
                >
                  {div.toUpperCase()}
                  {selectedDivisions.includes(div) && (
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center border border-vibrant-dark">
                       <div className="w-1.5 h-1.5 bg-vibrant-teal rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <h2 className="text-sm font-black text-vibrant-red uppercase tracking-widest mb-6 border-b-2 border-vibrant-yellow pb-2">Filter Kategori</h2>
            <FilterBar 
              categories={allAvailableCategories} 
              selected={selectedCategories} 
              onChange={setSelectedCategories} 
            />
          </section>

          <section className="bg-vibrant-dark p-6 rounded-2xl shadow-[6px_6px_0_#FFE66D] text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-vibrant-yellow uppercase tracking-[0.2em]">PENGINGAT</h2>
              <div className="w-3 h-3 bg-vibrant-yellow rounded-full animate-pulse shadow-[0_0_10px_#FFE66D]"></div>
            </div>
            <div className="space-y-4">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map(activity => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={activity.id} 
                    className="bg-white text-vibrant-dark p-4 rounded-xl border-[2px] border-vibrant-dark shadow-[4px_4px_0_#FF6B6B]"
                  >
                    <div className="flex items-start justify-between gap-2">
                       <h3 className="text-sm font-black leading-tight">{activity.name}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[10px] font-black text-vibrant-red uppercase">
                        {format(activity.date?.toDate ? activity.date.toDate() : new Date(activity.date), 'dd MMM yyyy')}
                      </p>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full border border-vibrant-dark font-black uppercase ${activity.type === 'internal' ? 'bg-vibrant-teal text-white' : 'bg-vibrant-yellow text-vibrant-dark'}`}>
                         {activity.type}
                       </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-xs text-white/50 italic font-medium">Belum ada kegiatan...</p>
              )}
            </div>
          </section>

          {!user && (
            <div className="bg-vibrant-yellow border-[3px] border-vibrant-dark p-5 rounded-2xl shadow-[4px_4px_0_#2D3436] flex gap-3">
              <Info className="text-vibrant-dark shrink-0" size={20} />
              <p className="text-[11px] text-vibrant-dark leading-tight font-black uppercase italic">
                Masuk untuk kelola jadwal sekolah.
              </p>
            </div>
          )}
        </aside>

        {/* Content */}
        <div className="lg:col-span-9">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-5xl font-black text-vibrant-dark uppercase italic tracking-tighter leading-none">
                {format(currentDate, 'MMMM')} <span className="text-vibrant-red">{format(currentDate, 'yyyy')}</span>
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="bg-vibrant-dark text-vibrant-yellow px-4 py-1.5 border-[3px] border-vibrant-dark rounded-xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#FF6B6B]">
                  Anggaran: {formatIDR(totalBudgetMonth)}
                </div>
                <div className="bg-white text-vibrant-dark px-4 py-1.5 border-[3px] border-vibrant-dark rounded-xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#4ECDC4]">
                   {filteredActivities.length} Acara
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={prevMonth} className="px-4 py-2 bg-white border-[3px] border-vibrant-dark rounded-xl shadow-[3px_3px_0_#2D3436] hover:translate-y-[-2px] active:translate-y-[1px] transition-all"><ChevronLeft size={20} /></button>
                <button onClick={nextMonth} className="px-4 py-2 bg-white border-[3px] border-vibrant-dark rounded-xl shadow-[3px_3px_0_#2D3436] hover:translate-y-[-2px] active:translate-y-[1px] transition-all"><ChevronRight size={20} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-vibrant-teal text-white border-[3px] border-vibrant-dark rounded-xl shadow-[3px_3px_0_#2D3436] text-[10px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all">Hari Ini</button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-2 border-[3px] border-vibrant-dark rounded-2xl shadow-[4px_4px_0_#FFE66D]">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'calendar' ? 'bg-vibrant-dark text-white' : 'text-vibrant-dark/40 hover:text-vibrant-dark'}`}
              >
                <CalendarIcon size={16} /> CALENDAR
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-vibrant-dark text-white' : 'text-vibrant-dark/40 hover:text-vibrant-dark'}`}
              >
                <List size={16} /> LIST VIEW
              </button>
            </div>
          </div>

          {/* View */}
          <AnimatePresence mode="wait">
            {viewMode === 'calendar' ? (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-7 gap-[3px] bg-vibrant-dark border-[4px] border-vibrant-dark rounded-3xl overflow-hidden shadow-[12px_12px_0_rgba(45,52,54,0.15)]"
              >
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                  <div key={day} className="bg-vibrant-yellow p-4 text-center text-[11px] font-black text-vibrant-dark uppercase tracking-[0.2em] border-b-[3px] border-vibrant-dark">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const dayActivities = getActivitiesForDay(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isTodayDay = isToday(day);
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={`min-h-[140px] bg-white p-3 group transition-all flex flex-col ${!isCurrentMonth ? 'bg-vibrant-bg/30 grayscale' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-base font-black w-9 h-9 flex items-center justify-center rounded-xl border-[2px] shadow-[2px_2px_0_#2D3436] transition-all ${isTodayDay ? 'bg-vibrant-red text-white border-vibrant-dark' : isCurrentMonth ? 'bg-white text-vibrant-dark border-vibrant-dark' : 'text-vibrant-dark/20 border-vibrant-dark/10 shadow-none'}`}>
                          {format(day, 'd')}
                        </span>
                        {dayActivities.length > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-vibrant-red leading-none">
                              {dayActivities.length}
                            </span>
                            <span className="text-[8px] font-black text-vibrant-dark/40 uppercase">Events</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
                        {dayActivities.map(activity => (
                          <button
                            key={activity.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActivity(activity);
                              setIsModalOpen(true);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-[9px] font-black truncate transition-all hover:translate-x-1 border-[2px] border-vibrant-dark shadow-[2px_2px_0_#2D3436] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center justify-between gap-1 ${
                              activity.type === 'internal' 
                                ? 'bg-vibrant-teal text-white' 
                                : 'bg-vibrant-yellow text-vibrant-dark'
                            }`}
                          >
                            {activity.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <ActivityList activities={filteredActivities} onSelect={(a) => {
                setSelectedActivity(a);
                setIsModalOpen(true);
              }} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button */}
      {user && (
        <button 
          onClick={() => {
            setSelectedActivity(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-10 right-10 bg-vibrant-yellow text-vibrant-dark border-[4px] border-vibrant-dark p-5 rounded-[2.5rem] shadow-[10px_10px_0_#2D3436] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[14px_14px_0_#2D3436] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all z-40 flex items-center gap-4"
        >
          <Plus size={32} className="stroke-[3px]" />
          <span className="font-black text-lg uppercase italic pr-4">Tambah Kegiatan</span>
        </button>
      )}

      {/* Footer / Pengingat Bar */}
      <footer className="mt-auto bg-vibrant-dark text-white px-6 py-4 flex items-center gap-6 border-t-[4px] border-vibrant-yellow">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-3 h-3 bg-vibrant-red rounded-full animate-pulse"></div>
          <span className="font-black text-sm uppercase italic tracking-widest text-vibrant-yellow">NOTIFIKASI:</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap text-sm font-bold opacity-80 italic italic">
          {upcomingActivities.length > 0 
            ? `Kegiatan Terdekat: "${upcomingActivities[0].name}" pada ${format(upcomingActivities[0].date?.toDate ? upcomingActivities[0].date.toDate() : new Date(upcomingActivities[0].date), 'dd MMMM')}.`
            : "Tetap pantau kalender untuk pembaruan kegiatan sekolah terbaru."}
        </div>
        <div className="text-[10px] font-black opacity-50 uppercase tracking-widest hidden md:block">
           Server Status: Online
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <ActivityModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedActivity(null);
          }}
          activity={selectedActivity}
          user={user}
        />
      )}
    </div>
  );
}
