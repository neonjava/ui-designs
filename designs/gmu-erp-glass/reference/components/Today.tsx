import type { TodayClass } from '../api';
import { useNow } from '../hooks';
import { dayProgress } from './Island';
import { useBrief } from './SubjectBrief';

const LENGTH = 55; // minutes per period
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/** The Today card: the class running now (or the next one) with a live countdown, and dots for the day's periods. */
export default function Today({ classes }: { classes: TodayClass[] }) {
  const now = useNow();
  const { openBrief } = useBrief();
  const mins = now.getHours() * 60 + now.getMinutes();
  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  if (!classes.length) {
    return (
      <div className="today">
        <div className="today-head"><span>Today</span><span>{dateLabel}</span></div>
        <p className="next-label">No classes today</p>
        <p className="next-name">Enjoy the day off</p>
        <p className="muted">Or look at the events coming up below.</p>
      </div>
    );
  }

  const current = classes.find(c => mins >= toMin(c.time) && mins < toMin(c.time) + LENGTH);
  const next = classes.find(c => toMin(c.time) > mins);
  const show = current ?? next;
  let note = '';
  if (current) note = `${toMin(current.time) + LENGTH - mins} min left`;
  else if (next) {
    const d = toMin(next.time) - mins, h = Math.floor(d / 60), m = d % 60;
    note = 'in ' + (h ? `${h} h ` : '') + `${m} min`;
  }

  return (
    <div className="today">
      <div className="today-head"><span>Today</span><span>{dateLabel}</span></div>
      <p className="next-label">{current ? 'In class now' : next ? 'Next class' : 'Done for today'}</p>
      <p className="next-name">{show ? <button className="subject-link big" onClick={() => openBrief(show.code)}>{show.name}</button> : 'No more classes today'}</p>
      {show && (
        <p className="next-meta"><b>{show.time}</b><span>{show.room}</span><span className="next-in">{note}</span></p>
      )}
      <div className="day-bar"><i style={{ width: dayProgress(now) + '%' }} /></div>
      <ol className="track">
        {classes.map(c => {
          const s = toMin(c.time);
          const cls = c === current ? 'now' : c === next && !current ? 'next' : mins >= s + LENGTH ? 'done' : '';
          return (
            <li key={c.period + c.code} className={cls} title={`${c.name} in ${c.room}`} role="button" tabIndex={0}
              onClick={() => openBrief(c.code)} onKeyDown={e => e.key === 'Enter' && openBrief(c.code)}>
              <i /><span>P{c.period}</span><small>{c.time}</small>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
