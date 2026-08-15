import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Image,
  Mic2,
  Utensils,
  Users,
  Clock3,
  CalendarDays,
  Search,
  Settings,
  PlusCircle,
  Heart,
  Leaf,
} from 'lucide-react';
import Brand from './Brand';

const items = [
  ['/', Home, 'Home'],
  ['/memories', Image, 'Memories'],
  ['/stories', Mic2, 'Stories'],
  ['/recipes', Utensils, 'Recipes'],
  ['/family-tree', Users, 'Family Tree'],
  ['/timeline', Clock3, 'Timeline'],
  ['/on-this-day', CalendarDays, 'On This Day'],
  ['/search', Search, 'Search'],
  ['/settings', Settings, 'Settings'],
];

const footers = {
  '/': 'યાદો એ જિંદગીની સાચી કમાણી છે.',
  '/memories': 'Every picture has a story. Every story has a legacy.',
  '/recipes': 'Good food brings people together.',
  '/family-tree': 'A family is like branches on a tree... Our roots remain as one.',
  '/stories': 'Stories are the threads that weave our family together.',
  '/timeline': 'Time passes but memories remain forever.',
  '/on-this-day': 'Today is a gift from the past.',
  '/search': 'Search and you shall find your roots.',
  '/settings': 'A well-kept family is a happy family.',
};

export default function Sidebar({ collapsed }) {
  const loc = useLocation();
  const footer = footers[loc.pathname] || 'યાદો એ જિંદગીની સાચી કમાણી છે.';

  return (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-[#e8dfd1] bg-[#f7f2ec] transition-all overflow-hidden ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="py-4 shrink-0">
        <Brand compact={collapsed} />
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar min-h-0">
        {items.map(([to, I, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={to === '/'}
          >
            <I className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <div className="mt-4 mb-2 rounded-xl border border-[#e5dac8] bg-white/80 p-3 shadow-xs">
            <p className="font-semibold text-xs uppercase tracking-wider text-olive flex justify-between items-center mb-1.5">
              Quick Add <PlusCircle className="w-4 h-4" />
            </p>
            {[
              ['/add/memory', 'Add Memory'],
              ['/add/story', 'Record Story'],
              ['/add/recipe', 'Add Recipe'],
              ['/add/member', 'Add Member'],
            ].map((x) => (
              <NavLink
                className="block py-1 text-xs text-stone-600 hover:text-olive transition-colors font-medium"
                to={x[0]}
                key={x[0]}
              >
                + {x[1]}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Heritage Quote Footer */}
      {!collapsed && (
        <div className="px-4 py-3 text-center border-t border-[#ebe4d9]/60 shrink-0 bg-[#f7f2ec]">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="h-px bg-[#d4c9b8] flex-1" />
            <Leaf className="w-3.5 h-3.5 text-olive" />
            <span className="h-px bg-[#d4c9b8] flex-1" />
          </div>
          <p className="text-[11px] text-stone-500 italic leading-snug">{footer}</p>
          <Heart className="w-3.5 h-3.5 text-olive mx-auto mt-1" />
        </div>
      )}
    </aside>
  );
}