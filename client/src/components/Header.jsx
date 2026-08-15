import { Menu, Search, Bell, ChevronDown, Leaf } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useHeritage } from '@/context/HeritageContext';

const placeholders = {
  '/': 'Search memories, stories, recipes...',
  '/memories': 'Search memories by title, people, place...',
  '/stories': 'Search stories by title, author, or theme...',
  '/recipes': 'Search recipes by name, ingredient, or by family member...',
  '/family-tree': 'Search family members...',
  '/timeline': 'Search timeline events...',
  '/on-this-day': 'Search on this day memories...',
  '/members': 'Search family members...',
  '/search': 'Search the family archive...',
  '/notifications': 'Search notifications...',
  '/settings': 'Search settings...',
};

export default function Header({ onMenu }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, activeFamily } = useAuth();
  const { notifications } = useHeritage();
  const placeholder = placeholders[loc.pathname] || 'Search memories, stories, recipes...';

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;
  const userName = user?.name || 'Rohan Mehta';
  const firstName = userName.split(' ')[0];
  const userPhoto = user?.profileImage || 'https://i.pravatar.cc/100?img=33';
  const familyName = activeFamily?.name || 'Mehta Family';

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#fdfbf7]/95 backdrop-blur border-b border-[#ebe4da] flex items-center gap-3 px-4 md:px-6">
      <button onClick={onMenu} className="touch w-10 h-10" aria-label="Toggle navigation">
        <Menu className="w-5" />
      </button>
      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-stone-600 mr-2">
        <Leaf className="w-4 text-olive" />
        <span>{familyName}</span>
      </div>
      <div className="relative max-w-xl flex-1 mx-auto">
        <Search className="absolute left-4 top-3 w-4 text-stone-500" />
        <input
          aria-label="Global search"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              nav('/search?q=' + encodeURIComponent(e.currentTarget.value.trim()));
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm focus:border-[#58752c] outline-none"
        />
      </div>
      <Link to="/notifications" className="touch relative w-10 h-10" aria-label="Notifications">
        <Bell className="w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] rounded-full grid place-items-center font-bold">
            {unreadCount}
          </span>
        )}
      </Link>
      <Link to="/profile" className="flex items-center gap-2">
        <img className="w-9 h-9 rounded-full object-cover border border-stone-200" src={userPhoto} alt={userName} />
        <span className="hidden md:block text-sm leading-tight">
          <b>Hi, {firstName}</b>
          <small className="flex items-center gap-1 text-stone-500">
            {familyName} <ChevronDown className="w-3" />
          </small>
        </span>
      </Link>
    </header>
  );
}