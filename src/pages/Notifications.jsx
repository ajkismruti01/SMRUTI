import { Bell, Check } from 'lucide-react';
import { useHeritage } from '@/context/HeritageContext';
import { api } from '@/api/client';
import PageHeader from '@/components/PageHeader';
import NotificationCard from '@/components/NotificationCard';

export default function Notifications() {
  const { notifications, setNotifications } = useHeritage();

  const formattedNotifs = (notifications || []).map((n) => ({
    id: n.id || n._id,
    type: n.type || 'system',
    title: n.title,
    message: n.message,
    read: Boolean(n.isRead || n.read),
    time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Recent',
    group: 'Recent',
  }));

  const unreadCount = formattedNotifs.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle={`${unreadCount} unread notifications from your family circle.`}
        action={
          unreadCount > 0 ? (
            <button className="btn-outline" onClick={handleMarkAllRead}>
              <Check className="w-4" /> Mark all read
            </button>
          ) : null
        }
      />
      {formattedNotifs.length === 0 ? (
        <div className="card p-8 text-center text-stone-500">
          <Bell className="w-8 h-8 mx-auto text-stone-300 mb-2" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Family Activity</h2>
          <div className="space-y-3">
            {formattedNotifs.map((n) => (
              <NotificationCard item={n} key={n.id} onRead={() => handleMarkRead(n.id)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}