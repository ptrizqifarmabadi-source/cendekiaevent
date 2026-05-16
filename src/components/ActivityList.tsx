import React from 'react';
import { Activity } from '../types';
import { format, isSameDay } from 'date-fns';
import { MapPin, Users, User, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityListProps {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
}

export default function ActivityList({ activities, onSelect }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xl">
        <p className="text-slate-400 font-medium">Tidak ada kegiatan yang ditemukan untuk filter ini.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
      {activities.map((activity, idx) => {
        const start = activity.date?.toDate ? activity.date.toDate() : new Date(activity.date);
        const end = activity.endDate?.toDate ? activity.endDate.toDate() : (activity.endDate ? new Date(activity.endDate) : start);
        const isMultiDay = !isSameDay(start, end);
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={activity.id}
            onClick={() => onSelect(activity)}
            className="group block bg-white border-[4px] border-vibrant-dark rounded-2xl p-6 shadow-[8px_8px_0_#FFE66D] hover:shadow-[12px_12px_0_#FFE66D] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-pointer relative overflow-hidden"
          >
             <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <span className={`brutalist-tag ${activity.type === 'internal' ? 'bg-vibrant-yellow text-vibrant-dark' : 'bg-vibrant-red text-white'}`}>
                      {activity.type}
                    </span>
                    <span className="bg-vibrant-teal text-white brutalist-tag">
                      {activity.division || 'Akademik'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-vibrant-red uppercase italic">
                    {isMultiDay 
                      ? `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`
                      : format(start, 'dd MMM')}
                  </span>
                </div>

                <h3 className="text-xl font-black text-vibrant-dark uppercase tracking-tighter group-hover:text-vibrant-red transition-colors mb-2">
                  {activity.name}
                </h3>
                
                <p className="text-[10px] font-black text-vibrant-dark/40 uppercase mb-4 italic">
                   PJ: {activity.pic}
                </p>

                <div className="mt-auto pt-4 border-t-[2px] border-dashed border-vibrant-dark/10 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 font-black text-[10px] uppercase text-vibrant-dark/60">
                      <Users size={12} strokeWidth={3} />
                      <span><b>{activity.participantCount}</b> Peserta</span>
                   </div>
                   <div className="flex items-center gap-1.5 font-black text-[10px] uppercase text-vibrant-dark/60">
                      <MapPin size={12} strokeWidth={3} />
                      <span>{activity.participantOrigin}</span>
                   </div>
                </div>

                 <div className="mt-4 pt-4 border-t-[2px] border-vibrant-dark flex items-center justify-between">
                    <div className="text-[10px] font-black text-vibrant-red uppercase tracking-widest leading-none">
                      ANGGARAN
                    </div>
                    <div className="text-sm font-black text-vibrant-dark">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(activity.budget || 0)}
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-1.5 mt-3">
                   {activity.categories.map(cat => (
                     <span key={cat} className="text-[8px] bg-vibrant-dark text-white px-2 py-0.5 rounded font-black uppercase">
                       {cat}
                     </span>
                   ))}
                 </div>
             </div>
          </motion.div>
        );
      })}
    </div>
  );
}
