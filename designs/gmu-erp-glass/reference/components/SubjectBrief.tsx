import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { api } from '../api';
import { useFeedback } from './feedback';

export type Meeting = { day: string; period: number; time: string; room: string };
export type Subject = {
  id: number; code: string; name: string; credits: number; faculty?: string; facultyDesignation?: string;
  registered: boolean; meetings: Meeting[];
  attended?: number; total?: number; percent?: number; shortage?: boolean; classesNeeded?: number;
  cie1?: number; cie2?: number; cie?: number; see?: number; marksTotal?: number; grade?: string;
};

const Ctx = createContext<{ openBrief: (code: string) => void }>({ openBrief: () => {} });
/** openBrief('UE25CS2301') shows the subject pop-up from any page. */
export const useBrief = () => useContext(Ctx);

const spring = { type: 'spring', stiffness: 520, damping: 34 } as const;
const cap = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();
const short = (d: string) => cap(d).slice(0, 3);
const dash = (v?: number | null) => (v == null ? '-' : v);

export function BriefProvider({ children }: { children: ReactNode }) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const { notify } = useFeedback();

  const openBrief = useCallback(async (code: string) => {
    try {
      // Fetched fresh each time so attendance and marks are never stale.
      const all = await api<Subject[]>('/api/student/subjects');
      const hit = all.find(s => s.code === code);
      if (hit) setSubject(hit); else notify('No details for ' + code, true);
    } catch { notify('Could not load the subject details', true); }
  }, [notify]);

  const close = useCallback(() => setSubject(null), []);
  useEffect(() => {
    document.body.style.overflow = subject ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [subject]);
  useEffect(() => {
    if (!subject) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [subject, close]);

  const s = subject;
  const hasAtt = !!s && s.total != null && s.total > 0;
  return (
    <Ctx.Provider value={{ openBrief }}>
      {children}
      <AnimatePresence>
        {s && (
          <motion.div className="sheet-backdrop" key="brief" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="brief glass-window" role="dialog" aria-modal="true" aria-label={s.name}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 18, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: .97 }} transition={spring}>
              <div className="brief-body">
                <button type="button" className="close-btn" aria-label="Close" onClick={close}><X strokeWidth={1.8} /></button>
                <span className="tag solid">{s.code}</span>
                <h2>{s.name}</h2>
                <p className="muted">{s.credits} {s.credits === 1 ? 'credit' : 'credits'}
                  {!s.registered && ' · you have not registered for this yet'}</p>
                <dl className="facts">
                  <div><dt>Taught by</dt><dd>{s.faculty ?? 'Not assigned yet'}
                    {s.facultyDesignation && <small>{s.facultyDesignation}</small>}</dd></div>
                  <div><dt>Meets</dt><dd>
                    {s.meetings.length ? s.meetings.map(m => (
                      <span className="meet" key={m.day + m.period}>{short(m.day)} {m.time}<small>{m.room}</small></span>
                    )) : 'Not on the time table yet'}
                  </dd></div>
                </dl>
                {s.registered && (
                  <div className="standing">
                    <div>
                      <small>Attendance</small>
                      {hasAtt ? <>
                        <b className={s.shortage ? 'low' : ''}>{s.percent}%</b>
                        <span className="bar"><i style={{ width: s.percent + '%' }} /></span>
                        <small>{s.attended} of {s.total} classes{s.shortage ? `, attend the next ${s.classesNeeded} to reach 75%` : ''}</small>
                      </> : <b className="none">No classes yet</b>}
                    </div>
                    <div>
                      <small>Marks</small>
                      {s.cie != null ? <>
                        <b>{s.see != null ? s.marksTotal : s.cie}<em> / {s.see != null ? 100 : 50}</em></b>
                        <small>CIE 1 {dash(s.cie1)}, CIE 2 {dash(s.cie2)}, SEE {dash(s.see)}</small>
                        {s.grade && <span className={'tag' + (s.grade === 'F' ? ' danger' : '')}>Grade {s.grade}</span>}
                      </> : <b className="none">No marks yet</b>}
                    </div>
                  </div>
                )}
                <div className="form-actions"><button className="primary" autoFocus onClick={close}>Done</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
