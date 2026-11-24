import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { useData } from '../hooks';
import { useFeedback } from './feedback';
import Go from './Go';

type Entry = { id?: number | null; date: string; title: string; type: 'HOLIDAY' | 'EXAM' | 'ACADEMIC' | 'EVENT'; link?: string | null };

const KIND: Record<Entry['type'], string> = { HOLIDAY: 'Holiday', EXAM: 'Exam', ACADEMIC: 'Academic', EVENT: 'Event' };
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const pretty = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

/** A month at a glance: holidays, exams and events. Opens from the clock in the island. Admin can add and remove dates. */
export default function MiniCalendar({ onClose }: { onClose: () => void }) {
  const { me } = useAuth();
  const { notify } = useFeedback();
  const now = new Date();
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [picked, setPicked] = useState(todayIso);
  const month = `${view.y}-${String(view.m + 1).padStart(2, '0')}`;
  const { data, reload } = useData<Entry[]>(`/api/calendar?month=${month}`);
  const box = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ title: '', type: 'HOLIDAY' });

  // Close with Esc or a click anywhere outside.
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const away = (e: MouseEvent) => {
      const t = e.target as Node;
      if (box.current && !box.current.contains(t) && !(t as HTMLElement).closest?.('.clock')) onClose();
    };
    window.addEventListener('keydown', key);
    document.addEventListener('mousedown', away);
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('mousedown', away); };
  }, [onClose]);

  const byDay = useMemo(() => {
    const m = new Map<string, Entry[]>();
    data?.forEach(e => m.set(e.date, [...(m.get(e.date) ?? []), e]));
    return m;
  }, [data]);

  // Monday-first grid of the visible month, padded with blanks.
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const total = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const shift = (by: number) => {
    const d = new Date(view.y, view.m + by, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setPicked(iso(d.getFullYear(), d.getMonth(), 1));
  };

  const dayEntries = byDay.get(picked) ?? [];
  const isSunday = new Date(picked + 'T00:00:00').getDay() === 0;

  async function add(e: FormEvent) {
    e.preventDefault();
    try {
      await api('/api/admin/calendar', { method: 'POST', body: { date: picked, title: form.title, type: form.type } });
      setForm({ ...form, title: '' }); reload(); notify('Added to the calendar');
    } catch (err) { notify(err instanceof ApiError ? err.message : 'Could not add that', true); }
  }
  async function remove(id: number) {
    try { await api(`/api/admin/calendar/${id}`, { method: 'DELETE' }); reload(); notify('Removed from the calendar'); }
    catch { notify('Could not remove that', true); }
  }

  return (
    <motion.div ref={box} className="cal-pop" role="dialog" aria-label="College calendar"
      initial={{ opacity: 0, y: -10, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: .98 }} transition={{ type: 'spring', stiffness: 520, damping: 36 }}>
      <div className="cal-head">
        <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft className="ic" /></button>
        <b>{new Date(view.y, view.m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b>
        <button type="button" className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><ChevronRight className="ic" /></button>
      </div>

      <div className="cal-grid" role="grid">
        {DAYS.map((d, i) => <span key={i} className="dow">{d}</span>)}
        {cells.map((d, i) => {
          if (d == null) return <span key={'b' + i} />;
          const key = iso(view.y, view.m, d);
          const list = byDay.get(key) ?? [];
          const sunday = (lead + d - 1) % 7 === 6;
          const kinds = [...new Set(list.map(e => e.type))];
          const holiday = kinds.includes('HOLIDAY');
          return (
            <button key={key} type="button" aria-label={`${pretty(key)}${list.length ? ', ' + list.map(e => e.title).join(', ') : ''}`}
              className={['day', key === todayIso && 'today', key === picked && 'picked', (sunday || holiday) && 'off'].filter(Boolean).join(' ')}
              onClick={() => setPicked(key)}>
              {d}
              <span className="marks">{kinds.filter(k => k !== 'HOLIDAY').map(k => <i key={k} className={k.toLowerCase()} />)}{holiday && <i className="holiday" />}</span>
            </button>
          );
        })}
      </div>

      <div className="cal-legend"><span><i className="holiday" />Holiday</span><span><i className="exam" />Exam</span>
        <span><i className="academic" />Academic</span><span><i className="event" />Event</span></div>

      <div className="cal-day">
        <h3>{pretty(picked)}{picked === todayIso && <span className="tag">Today</span>}</h3>
        {dayEntries.length ? (
          <ul>{dayEntries.map(e => (
            <li key={e.title + (e.id ?? '')}>
              <i className={e.type.toLowerCase()} />
              <span>{e.link ? <Go href={e.link}>{e.title}</Go> : e.title}<small>{KIND[e.type]}</small></span>
              {me?.role === 'ADMIN' && e.id != null &&
                <button type="button" className="icon-btn" aria-label={'Remove ' + e.title} onClick={() => remove(e.id!)}><X className="ic" /></button>}
            </li>))}
          </ul>
        ) : <p className="muted">{isSunday ? 'Sunday, no classes.' : 'Regular working day.'}</p>}
      </div>

      {me?.role === 'ADMIN' && (
        <form className="cal-add" onSubmit={add}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Add to this date, like Diwali holiday" aria-label="Title" required />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} aria-label="Type">
            <option value="HOLIDAY">Holiday</option><option value="EXAM">Exam</option><option value="ACADEMIC">Academic</option>
          </select>
          <button type="submit" className="small primary">Add</button>
        </form>
      )}
    </motion.div>
  );
}
