import { useState } from 'react';
import { BarChart3, BookOpen, Bell, Building2, CalendarDays, CheckCircle2, ChevronRight, Newspaper, Package, Search, Sparkles,
  User, Users, type LucideIcon } from 'lucide-react';
import type { Dashboard as Data } from '../api';
import { useAuth } from '../auth';
import { fmtDate, useData } from '../hooks';
import Go from '../ui/Go';
import Today from '../ui/Today';

type Item = { label: string; note: string; href: string; icon: LucideIcon };
type Group = { title: string; items: Item[] };

function groupsFor(role: string, d: Data): Group[] {
  const g: Group[] = [];
  if (role === 'STUDENT') g.push({ title: 'Study', items: [
    { label: 'Attendance', note: 'Course-wise percentage', href: '/student/attendance', icon: CheckCircle2 },
    { label: 'Time table', note: 'Your week at a glance', href: '/student/timetable', icon: CalendarDays },
    { label: 'Results', note: 'CIE, SEE and SGPA', href: '/student/results', icon: BarChart3 },
    { label: 'Course registration', note: 'Register or drop courses', href: '/student/registration', icon: BookOpen }] });
  if (role === 'FACULTY') g.push({ title: 'Teaching', items: [
    { label: 'My courses', note: 'Students, attendance, marks', href: '/faculty/courses', icon: BookOpen },
    { label: 'My time table', note: 'Your weekly classes', href: '/faculty/timetable', icon: CalendarDays },
    ...(d.myCourses ?? []).flatMap(c => [
      { label: `Attendance, ${c.code}`, note: c.name, href: `/faculty/courses/${c.id}/attendance`, icon: CheckCircle2 },
      { label: `Marks, ${c.code}`, note: c.name, href: `/faculty/courses/${c.id}/marks`, icon: BarChart3 }])] });
  if (role === 'ADMIN') g.push({ title: 'Manage', items: [
    { label: 'Students', note: 'Accounts and sign-in', href: '/admin/students', icon: Users },
    { label: 'Faculty', note: 'Add, search, edit', href: '/admin/faculty', icon: User },
    { label: 'Courses', note: 'Assign faculty', href: '/admin/courses', icon: BookOpen },
    { label: 'Departments', note: 'Programs', href: '/admin/departments', icon: Building2 },
    { label: 'Time table', note: 'Edit by class', href: '/admin/timetable', icon: CalendarDays },
    { label: 'Notices', note: 'Post news', href: '/admin/notices', icon: Bell },
    { label: 'Resources', note: 'Labs, rooms, equipment', href: '/admin/resources', icon: Package }] });
  g.push(
    { title: 'Campus', items: [
      { label: 'Events', note: 'See what is on and register', href: '/events', icon: Sparkles },
      { label: 'Resource booking', note: 'Labs, halls and equipment', href: '/resources', icon: Package },
      { label: 'Latest news', note: 'Notices from the office', href: '/notices', icon: Newspaper }] });
  return g;
}

export default function Dashboard() {
  const { me } = useAuth();
  const { data } = useData<Data>('/api/dashboard');
  const [q, setQ] = useState('');
  if (!me) return null;

  const sub = me.student
    ? `${me.student.usn}, ${me.student.department ?? ''}, semester ${me.student.semester} section ${me.student.section}`
    : me.faculty ? `${me.faculty.designation ?? 'Faculty'}, ${me.faculty.department ?? ''} (${me.faculty.empId})` : 'Administrator';
  const query = q.trim().toLowerCase();
  // The greeting follows the visitor's own clock (the server may be in another time zone, and the preview's data is old).
  // Until the numbers arrive the page already has its final shape, with grey placeholders, so nothing jumps.
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const wantsToday = me.role !== 'ADMIN';
  const placeholders = me.role === 'STUDENT' ? 3 : me.role === 'FACULTY' ? 2 : 5;

  return (
    <main className="container">
      <section className={'hero' + ((data ? data.today : wantsToday) ? '' : ' solo')}>
        <div className="hero-text">
          <p className="greet">{greeting},</p>
          <h1 className="hero-name">{me.displayName}</h1>
          <p className="muted">{sub}</p>
          <dl className="figures">
            {!data && Array.from({ length: placeholders }, (_, i) => <a key={i} className="sk-fig" aria-hidden="true"><dd /><dt /></a>)}
            {data?.stats.map(st => (
              <Go key={st.label} href={st.link} className={st.ring != null && st.ring < 75 ? 'low' : ''}>
                <dd>{st.value}</dd><dt>{st.label}</dt>
              </Go>
            ))}
          </dl>
        </div>
        {data?.today && <Today classes={data.today} />}
        {!data && wantsToday && <div className="today skeleton" aria-busy="true"><span className="sk" style={{ height: '1rem', width: '35%' }} /><span className="sk" style={{ height: '1.8rem', width: '70%', marginTop: '1.4rem' }} /><span className="sk" style={{ height: '1rem', width: '45%', marginTop: '.8rem' }} /></div>}
      </section>

      <div className="search">
        <Search className="search-ic" strokeWidth={1.8} aria-hidden="true" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Find a feature, like results or bookings"
          autoComplete="off" aria-label="Find a feature" />
      </div>

      {data && (() => {
        const groups = groupsFor(me.role, data)
          .map(g => ({ ...g, items: g.items.filter(t => !query || (t.label + ' ' + t.note).toLowerCase().includes(query)) }))
          .filter(g => g.items.length);
        if (!groups.length) return <p className="muted empty-search">Nothing matches “{q}”. Try a shorter word, like “marks” or “room”.</p>;
        return (
          <div className="directory">
            {groups.map(g => (
              <section key={g.title}>
                <h2>{g.title}</h2>
                <ul className="rows">
                  {g.items.map(t => (
                    <li key={t.href}>
                      <Go href={t.href}>
                        <t.icon className="ic" strokeWidth={1.7} />
                        <span><b>{t.label}</b><small>{t.note}</small></span>
                        <ChevronRight className="go" strokeWidth={1.8} aria-hidden="true" />
                      </Go>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        );
      })()}

      {data && !query && <div className="duo">
      {!!data.events.length && <div>
        <h2 className="section">Coming up</h2>
        <ul className="agenda">
          {data.events.map(e => (
            <li key={e.id}>
              <Go href={`/events/${e.id}`}>
                <time><b>{fmtDate(e.date, { day: 'numeric' })}</b> {fmtDate(e.date, { month: 'short' })}</time>
                <span><b>{e.title}</b><small>{e.category} at {e.venue}</small></span>
                <ChevronRight className="go" strokeWidth={1.8} aria-hidden="true" />
              </Go>
            </li>
          ))}
        </ul>
      </div>}

      <div>
        <h2 className="section">Notices</h2>
        {!data.notices.length && <p className="muted">No notices yet.</p>}
        <ol className="feed">
          {data.notices.map(n => (
            <li key={n.id}>
              <time className="muted small">{fmtDate(n.postedOn, { day: 'numeric', month: 'short', year: 'numeric' })}</time>
              <b>{n.title}</b>
              <p>{n.body}</p>
            </li>
          ))}
        </ol>
      </div>
      </div>}
    </main>
  );
}
