import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Users, Globe, Tag, Trash2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Category, ActivityType, Division } from '../types';
import { activityService } from '../services/activityService';
import { format } from 'date-fns';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  user: any;
}

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

export default function ActivityModal({ isOpen, onClose, activity, user }: ActivityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    division: 'Akademik' as Division,
    pic: '',
    type: 'internal' as ActivityType,
    participantCount: 0,
    participantOrigin: '',
    categories: [] as Category[],
    budget: 0,
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activity) {
      const date = activity.date?.toDate ? activity.date.toDate() : new Date(activity.date);
      const endDate = activity.endDate?.toDate ? activity.endDate.toDate() : (activity.endDate ? new Date(activity.endDate) : date);
      setFormData({
        name: activity.name,
        date: format(date, "yyyy-MM-dd'T'HH:mm"),
        endDate: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        division: activity.division || 'Akademik',
        pic: activity.pic,
        type: activity.type,
        participantCount: activity.participantCount,
        participantOrigin: activity.participantOrigin,
        categories: activity.categories || [],
        budget: activity.budget || 0,
      });
    } else {
      setFormData({
        name: '',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        division: 'Akademik',
        pic: '',
        type: 'internal',
        participantCount: 0,
        participantOrigin: '',
        categories: [],
        budget: 0,
      });
    }
    setCustomCategory('');
  }, [activity]);

  const canEdit = !activity || activity.ownerId === 'guest' || (user && activity.ownerId === user.uid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const submission = {
      ...formData,
      date: new Date(formData.date),
      endDate: new Date(formData.endDate),
      participantCount: Number(formData.participantCount),
      budget: Number(formData.budget),
    };

    if (activity?.id) {
      await activityService.updateActivity(activity.id, submission);
    } else {
      await activityService.addActivity(submission);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!activity?.id) return;
    if (!canEdit) return;
    setIsDeleting(true);
    await activityService.deleteActivity(activity.id);
    setIsDeleting(false);
    onClose();
  };

  const toggleCategory = (cat: Category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const addCustomCategory = () => {
    if (!customCategory.trim()) return;
    const cat = customCategory.trim();
    if (!formData.categories.includes(cat)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, cat]
      }));
    }
    setCustomCategory('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vibrant-dark/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="bg-white border-[4px] border-vibrant-dark rounded-3xl w-full max-w-lg overflow-hidden shadow-[20px_20px_0_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]"
      >
        <header className="p-8 border-b-[4px] border-vibrant-dark flex items-center justify-between bg-vibrant-yellow">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{activity ? 'Edit Kegiatan' : 'Input Kegiatan'}</h2>
            <p className="text-[10px] text-vibrant-dark/60 font-black uppercase tracking-widest mt-2">Database Event Sekolah</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border-[3px] border-vibrant-dark rounded-xl transition-all hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0_#2D3436] active:shadow-none text-vibrant-dark">
            <X size={24} strokeWidth={3} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 bg-vibrant-bg/30">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Nama Kegiatan</label>
              <input 
                required
                type="text" 
                disabled={!canEdit}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Lomba Catur Nasional"
                className="w-full brutalist-input !py-4 font-black text-lg placeholder:text-vibrant-dark/20 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Tanggal Mulai</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark" size={18} />
                  <input 
                    required
                    type="datetime-local" 
                    disabled={!canEdit}
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full brutalist-input pl-12 !py-4 font-black disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Tanggal Selesai</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark" size={18} />
                  <input 
                    required
                    type="datetime-local" 
                    disabled={!canEdit}
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full brutalist-input pl-12 !py-4 font-black disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Divisi Penanggung Jawab</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark" size={18} />
                  <select
                    required
                    disabled={!canEdit}
                    value={formData.division}
                    onChange={e => setFormData({...formData, division: e.target.value as Division})}
                    className="w-full brutalist-input pl-12 !py-4 font-black appearance-none bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {DIVISIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ PIC Lapangan</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark" size={18} />
                  <input 
                    required
                    type="text" 
                    disabled={!canEdit}
                    value={formData.pic}
                    onChange={e => setFormData({...formData, pic: e.target.value})}
                    placeholder="Nama PIC"
                    className="w-full brutalist-input pl-12 !py-4 font-black disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Kategori Kegiatan</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => canEdit && toggleCategory(cat)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all border-[3px] border-vibrant-dark shadow-[3px_3px_0_#2D3436] disabled:opacity-75 ${
                      formData.categories.includes(cat) 
                        ? 'bg-vibrant-red text-white -translate-y-1 shadow-[5px_5px_0_#2D3436] disabled:shadow-[3px_3px_0_#2D3436] disabled:translate-y-0' 
                        : 'bg-white text-vibrant-dark/40 hover:text-vibrant-dark disabled:hover:text-vibrant-dark/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                
                {/* Dynamically added custom categories that are not in default list */}
                {formData.categories.filter(c => !CATEGORIES.includes(c)).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => canEdit && toggleCategory(cat)}
                    className="px-4 py-3 rounded-xl text-[10px] font-black transition-all border-[3px] border-vibrant-dark shadow-[5px_5px_0_#2D3436] bg-vibrant-teal text-white -translate-y-1 disabled:shadow-[3px_3px_0_#2D3436] disabled:translate-y-0 disabled:opacity-75"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {canEdit && (
                <div className="flex gap-2 mt-4">
                  <input 
                    type="text"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                    placeholder="Tambah kategori lainnya..."
                    className="flex-1 brutalist-input !py-3 !text-xs font-black placeholder:text-vibrant-dark/20"
                  />
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="p-3 bg-vibrant-teal text-white border-[3px] border-vibrant-dark rounded-xl shadow-[4px_4px_0_#2D3436] font-black text-[10px]"
                  >
                    TAMBAH
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Tipe</label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-vibrant-dark rounded-xl border-[3px] border-vibrant-dark">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => canEdit && setFormData({...formData, type: 'internal'})}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all ${formData.type === 'internal' ? 'bg-vibrant-teal text-white' : 'text-white/40'} disabled:cursor-not-allowed`}
                    >
                      INTERNAL
                    </button>
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => canEdit && setFormData({...formData, type: 'external'})}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all ${formData.type === 'external' ? 'bg-vibrant-yellow text-vibrant-dark' : 'text-white/40'} disabled:cursor-not-allowed`}
                    >
                      EKSTERNAL
                    </button>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Jumlah Peserta</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark" size={18} />
                    <input 
                      type="number" 
                      disabled={!canEdit}
                      value={formData.participantCount}
                      onChange={e => setFormData({...formData, participantCount: Number(e.target.value)})}
                      placeholder="0"
                      className="w-full brutalist-input pl-12 !py-4 font-black disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
               </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Anggaran (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark font-black text-sm">Rp</span>
                <input 
                  type="number" 
                  disabled={!canEdit}
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                  placeholder="0"
                  className="w-full brutalist-input pl-12 !py-4 font-black disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-vibrant-red uppercase tracking-widest block mb-2">★ Asal Peserta</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-dark" size={18} />
                <input 
                  type="text" 
                  disabled={!canEdit}
                  value={formData.participantOrigin}
                  onChange={e => setFormData({...formData, participantOrigin: e.target.value})}
                  placeholder="Contoh: Siswa Kelas IX, Alumni, Guru"
                  className="w-full brutalist-input pl-12 !py-4 font-black disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </form>

        <footer className="p-8 bg-white border-t-[4px] border-vibrant-dark flex items-center justify-between gap-4">
          {activity?.id && canEdit ? (
             <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-4 bg-white text-vibrant-red border-[3px] border-vibrant-dark rounded-xl font-black shadow-[4px_4px_0_#FF6B6B] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Trash2 size={24} />
            </button>
          ) : <div />}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 text-[10px] font-black text-vibrant-dark/40 hover:text-vibrant-dark uppercase tracking-widest"
            >
              {canEdit ? 'Batal' : 'Tutup'}
            </button>
            {canEdit && (
              <button
                onClick={handleSubmit}
                className="brutalist-button px-10 italic uppercase tracking-tighter !text-lg"
              >
                SIMPAN KEGIATAN
              </button>
            )}
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
