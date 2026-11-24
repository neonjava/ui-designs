import { useState } from 'react';
import { api, ApiError, type CourseRow } from '../api';
import { useData } from '../hooks';
import { useFeedback } from '../ui/feedback';
import { useBrief } from '../ui/SubjectBrief';

type AttRow = { code: string; name: string; attended: number; total: number; percent: number; shortage: boolean; classesNeeded: number };

export function Attendance() {
  const { openBrief } = useBrief();
  const { data } = useData<{ required: number; rows: AttRow[] }>('/api/student/attendance');
  return (
    <main className="container">
      <div className="page-head"><div><h1>Attendance</h1>
        <div className="muted">{data ? `You need at least ${data.required}% in each course to sit the SEE.` : ' '}</div></div></div>
      {data && !data.rows.length && <p className="muted">You aren't registered for any course yet.</p>}
      {data && !!data.rows.length && (
        <div className="table-wrap"><table>
          <thead><tr><th>Code</th><th>Course</th><th className="num">Attended</th><th className="num">Total</th>
            <th className="num">%</th><th /><th>Status</th></tr></thead>
          <tbody>{data.rows.map(r => (
            <tr key={r.code} className={'pick' + (r.shortage ? ' flag' : '')} onClick={() => openBrief(r.code)}>
              <td data-code>{r.code}</td><td data-title><button className="subject-link" onClick={e => { e.stopPropagation(); openBrief(r.code); }}>{r.name}</button></td><td className="num" data-label="Attended">{r.attended}</td><td className="num" data-label="Classes">{r.total}</td>
              <td className="num" data-label="Attendance %">{r.percent}</td>
              <td data-wide data-bar><span className="bar"><i style={{ width: r.percent + '%' }} /></span></td>
              <td data-wide>{r.total === 0 ? <span className="muted">No classes yet</span>
                : r.shortage ? <span className="tag danger">Short, attend the next {r.classesNeeded}</span>
                : <span className="tag ok">OK</span>}</td>
            </tr>))}
          </tbody>
        </table></div>
      )}
    </main>
  );
}

type ResRow = { code: string; name: string; credits: number; cie1?: number; cie2?: number; cie: number; see?: number; total?: number; grade?: string };

export function Results() {
  const { openBrief } = useBrief();
  const { data } = useData<{ sgpa?: number; rows: ResRow[] }>('/api/student/results');
  const dash = (v?: number | null) => v == null ? '-' : v;
  return (
    <main className="container">
      <div className="page-head">
        <div><h1>Results</h1><div className="muted">CIE 1 and CIE 2 out of 25 each, SEE out of 50, total out of 100</div></div>
        <div className="stat"><b>{data?.sgpa ?? '-'}</b><small>SGPA (graded courses)</small></div>
      </div>
      {data && !data.rows.length && <p className="muted">You aren't registered for any course yet.</p>}
      {data && !!data.rows.length && (
        <div className="table-wrap"><table>
          <thead><tr><th>Code</th><th>Course</th><th className="num">Credits</th><th className="num">CIE 1</th>
            <th className="num">CIE 2</th><th className="num">CIE</th><th className="num">SEE</th><th className="num">Total</th><th>Grade</th></tr></thead>
          <tbody>{data.rows.map(m => (
            <tr key={m.code} className={'pick' + (m.grade === 'F' ? ' flag' : '')} onClick={() => openBrief(m.code)}>
              <td data-code>{m.code}</td><td data-title><button className="subject-link" onClick={e => { e.stopPropagation(); openBrief(m.code); }}>{m.name}</button></td><td className="num" data-label="Credits">{m.credits}</td><td className="num" data-label="CIE 1">{dash(m.cie1)}</td>
              <td className="num" data-label="CIE 2">{dash(m.cie2)}</td><td className="num" data-label="CIE">{m.cie}</td><td className="num" data-label="SEE">{dash(m.see)}</td>
              <td className="num" data-label="Total">{dash(m.total)}</td>
              <td data-wide data-label="Grade">{m.grade ? <span className={'tag' + (m.grade === 'F' ? ' danger' : '')}>{m.grade}</span>
                : <span className="muted small">Waiting for SEE</span>}</td>
            </tr>))}
          </tbody>
        </table></div>
      )}
    </main>
  );
}

type Slot = { day: string; period: number; code: string; name: string; room: string };
type TT = { title: string; days: string[]; times: string[]; slots: Slot[] };

const cap = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();

export function Timetable() {
  const { data } = useData<TT>('/api/student/timetable');
  const { openBrief } = useBrief();
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const [picked, setPicked] = useState<string | null>(null);
  // Phones show one day at a time (today to start with); laptops and desktops show the whole week.
  const sel = picked ?? (data?.days.includes(todayName) ? todayName : data?.days[0] ?? '');
  const none = !!data && !data.slots.some(x => x.day === sel);
  return (
    <main className="container">
      <div className="page-head"><div><h1>Time Table</h1><div className="muted">{data?.title ?? ' '}</div></div>
        <div className="muted small hint">Click a subject for a quick brief</div></div>
      {data && (
        <div className="tt-days" role="tablist" aria-label="Day of the week">
          {data.days.map(d => (
            <button key={d} type="button" role="tab" aria-selected={d === sel} className={d === sel ? 'on' : ''} onClick={() => setPicked(d)}>
              <span>{cap(d).slice(0, 3)}</span>{d === todayName && <i aria-label="today" />}
            </button>
          ))}
        </div>
      )}
      {data && (
        <div className="table-wrap">
          <div className="tt-grid" role="table" aria-label="Weekly time table" data-sel={sel} style={{ '--cols': data.times.length } as React.CSSProperties}>
            <div className="tt-h tt-corner" role="columnheader">Day</div>
            {data.times.map((t, i) => <div key={t} className="tt-h" role="columnheader">P{i + 1}, {t}</div>)}
            {data.days.map(day => [
              <div key={day} data-day={day} className={'tt-day' + (day === todayName ? ' is-today' : '')} role="rowheader">
                {cap(day)}{day === todayName && <small>Today</small>}
              </div>,
              ...data.times.map((t, i) => {
                const s = data.slots.find(x => x.day === day && x.period === i + 1);
                return s ? (
                  <button key={day + i} type="button" data-day={day} className={'tt-slot' + (day === todayName ? ' is-today' : '')}
                    onClick={() => openBrief(s.code)} aria-label={`${s.name}, details`}>
                    <em className="tt-time">P{i + 1} at {t}</em>
                    <b>{s.code}</b><span>{s.name}</span><small>{s.room}</small>
                  </button>
                ) : <div key={day + i} data-day={day} className="tt-empty">—</div>;
              }),
            ])}
            {none && <p className="tt-none">No classes on {cap(sel)}.</p>}
          </div>
        </div>
      )}
    </main>
  );
}

export function Registration() {
  const { data, reload } = useData<{ course: CourseRow; registered: boolean }[]>('/api/student/registration');
  const { notify, confirm } = useFeedback();
  const { openBrief } = useBrief();
  const [busy, setBusy] = useState<number | null>(null);

  async function act(c: CourseRow, drop: boolean) {
    if (drop && !(await confirm({ text: `Drop ${c.code} ${c.name}? Your attendance and marks for it stay saved.`, ok: 'Drop course', danger: true }))) return;
    setBusy(c.id);
    try {
      const r = await api<{ message: string }>(`/api/student/registration/${c.id}`, { method: drop ? 'DELETE' : 'POST' });
      notify(r.message); reload();
    } catch (e) { notify(e instanceof ApiError ? e.message : 'Something went wrong', true); }
    finally { setBusy(null); }
  }

  return (
    <main className="container">
      <div className="page-head"><div><h1>Course Registration</h1><div className="muted">Courses offered for your semester</div></div></div>
      {data && !data.length && <p className="muted">No courses are offered for your semester yet.</p>}
      {data && !!data.length && (
        <div className="table-wrap"><table>
          <thead><tr><th>Code</th><th>Course</th><th className="num">Credits</th><th>Faculty</th><th>Status</th><th /></tr></thead>
          <tbody>{data.map(({ course: c, registered }) => (
            <tr key={c.id} className="pick" onClick={() => openBrief(c.code)}>
              <td data-code>{c.code}</td><td data-title><button className="subject-link" onClick={e => { e.stopPropagation(); openBrief(c.code); }}>{c.name}</button></td><td className="num" data-label="Credits">{c.credits}</td><td data-label="Taught by" data-span2>{c.faculty ?? 'Not assigned yet'}</td>
              <td data-hide-empty>{registered && <span className="tag ok">Registered</span>}</td>
              <td className="num" data-wide data-actions onClick={e => e.stopPropagation()}>
                {registered
                  ? <button className="small" disabled={busy === c.id} onClick={() => act(c, true)}>Drop</button>
                  : <button className="small primary" disabled={busy === c.id} onClick={() => act(c, false)}>Register</button>}
              </td>
            </tr>))}
          </tbody>
        </table></div>
      )}
    </main>
  );
}
