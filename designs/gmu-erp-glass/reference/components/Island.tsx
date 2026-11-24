import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, Home, LogOut, Package, Sparkles, User, Users,
  type LucideIcon } from 'lucide-react';
import { useAuth } from '../auth';
import { ASSET } from '../api';
import { prefetch, useNow } from '../hooks';
import Go from './Go';
import MiniCalendar from './MiniCalendar';

type Item = { href: string; label: string; icon: LucideIcon };

// Data each tab needs, loaded as soon as the pointer is over the tab.
const DATA: Record<string, string> = {
  '/': '/api/dashboard', '/notices': '/api/notices', '/student/attendance': '/api/student/attendance',
  '/student/results': '/api/student/results', '/student/timetable': '/api/student/timetable',
  '/student/registration': '/api/student/registration', '/admin/students': '/api/admin/students',
};
const warm = (href: string) => { if (DATA[href]) prefetch(DATA[href]); };

const glide = { type: 'spring', stiffness: 420, damping: 38 } as const;

function itemsFor(role: string): Item[] {
  const items: Item[] = [{ href: '/', label: 'Home', icon: Home }];
  if (role === 'STUDENT') items.push(
    { href: '/student/attendance', label: 'Attendance', icon: CheckCircle2 },
    { href: '/student/timetable', label: 'Time table', icon: CalendarDays },
    { href: '/student/results', label: 'Results', icon: BarChart3 },
    { href: '/student/registration', label: 'Registration', icon: BookOpen });
  if (role === 'FACULTY') items.push(
    { href: '/faculty/courses', label: 'My courses', icon: BookOpen },
    { href: '/faculty/timetable', label: 'Time table', icon: CalendarDays });
  if (role === 'ADMIN') items.push(
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/faculty', label: 'Faculty', icon: User },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/timetable', label: 'Time table', icon: CalendarDays },
    { href: '/admin/notices', label: 'Notices', icon: Bell });
  items.push({ href: '/events', label: 'Events', icon: Sparkles }, { href: '/resources', label: 'Resources', icon: Package });
  return items;
}

const NavLink = motion.create(Go);

// The college day runs 09:00 to 16:00; the clock ring fills as it goes.
export const dayProgress = (d: Date) => Math.max(0, Math.min(100, ((d.getHours() * 60 + d.getMinutes()) - 540) * 100 / 420));

/** The island: a floating glass bar. The current tab opens to show its name, with a pill that glides between tabs. */
export default function Island() {
  const { me, logout } = useAuth();
  const { pathname } = useLocation();
  const now = useNow();
  const [calOpen, setCalOpen] = useState(false);
  useEffect(() => { setCalOpen(false); }, [pathname]);
  if (!me) return null;

  const items = itemsFor(me.role);
  const active = items.filter(i => i.href === '/' ? pathname === '/' : pathname === i.href || pathname.startsWith(i.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <motion.header className="topbar" layout transition={glide}>
      <Go className="brand" href="/" title="GMU ERP home"><img className="logo" src={ASSET + 'img/gmu-logo.png'} alt="GM University" width="40" height="40" /><span className="brand-name">GMU ERP</span></Go>
      <nav className="nav" aria-label="Main">
        {items.map(it => {
          const on = it === active;
          const Icon = it.icon;
          return (
            <NavLink key={it.href} href={it.href} className={on ? 'active' : ''} aria-current={on ? 'page' : undefined}
              layout transition={glide} onPointerEnter={() => warm(it.href)} onFocus={() => warm(it.href)}>
              {on && <motion.i layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
              <Icon className="ic" strokeWidth={1.8} /><span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="clock-wrap">
        <button type="button" className="clock" aria-haspopup="dialog" aria-expanded={calOpen} title="College calendar"
          onClick={() => setCalOpen(o => !o)} style={{ '--p': dayProgress(now) } as React.CSSProperties}>
          <i className="ring" />
          <span className="clock-date">{now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <b className="clock-time">{now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</b>
        </button>
        <AnimatePresence>{calOpen && <MiniCalendar onClose={() => setCalOpen(false)} />}</AnimatePresence>
      </div>
      <div className="who">
        <Go className="avatar" href="/profile" title={me.displayName + ' (profile)'}>{me.displayName.charAt(0)}</Go>
        <button className="icon-btn" type="button" title="Log out" aria-label="Log out" onClick={logout}>
          <LogOut className="ic" strokeWidth={1.8} />
        </button>
      </div>
    </motion.header>
  );
}
