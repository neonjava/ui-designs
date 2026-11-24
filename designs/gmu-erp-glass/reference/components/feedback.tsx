import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Toasts drop out of the island; success hides itself after a few seconds, errors stay until clicked.
// confirm() opens a macOS-style sheet instead of the browser's confirm box.

type Toast = { id: number; text: string; error?: boolean };
type Ask = { text: string; ok?: string; danger?: boolean };
type Feedback = {
  notify: (text: string, error?: boolean) => void;
  confirm: (ask: Ask) => Promise<boolean>;
};
const Ctx = createContext<Feedback>(null!);
export const useFeedback = () => useContext(Ctx);

const spring = { type: 'spring', stiffness: 520, damping: 34 } as const;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ask, setAsk] = useState<(Ask & { resolve: (v: boolean) => void }) | null>(null);
  const next = useRef(1);

  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);
  const notify = useCallback((text: string, error = false) => {
    const id = next.current++;
    setToasts(t => [...t.slice(-2), { id, text, error }]);
    if (!error) setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);
  const confirm = useCallback((a: Ask) => new Promise<boolean>(resolve => setAsk({ ...a, resolve })), []);

  useEffect(() => {
    document.body.style.overflow = ask ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [ask]);
  const answer = (v: boolean) => { ask?.resolve(v); setAsk(null); };
  useEffect(() => {
    if (!ask) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') answer(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <Ctx.Provider value={{ notify, confirm }}>
      {children}
      <div className="toasts" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <motion.div key={t.id} layout role={t.error ? 'alert' : 'status'}
              className={'flash' + (t.error ? ' error' : '')} onClick={() => dismiss(t.id)}
              initial={{ opacity: 0, y: -22, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: .96 }} transition={spring}>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {ask && (
          <motion.div className="sheet-backdrop" key="sheet" onClick={() => answer(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="sheet" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: -24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: .98 }} transition={spring}>
              <p>{ask.text}</p>
              <div className="form-actions">
                <button type="button" onClick={() => answer(false)}>Cancel</button>
                <button type="button" autoFocus className={ask.danger ? 'danger' : 'primary'} onClick={() => answer(true)}>
                  {ask.ok ?? 'OK'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
