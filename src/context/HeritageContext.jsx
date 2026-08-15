import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

const HeritageContext = createContext(null);

export function HeritageProvider({ children }) {
  const { activeFamily, isAuthenticated } = useAuth();
  const [memories, setMemories] = useState([]);
  const [stories, setStories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [members, setMembers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [treeData, setTreeData] = useState({ members: [], couples: [], generations: [] });
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const familyId = activeFamily?._id || activeFamily?.id;

  const loadFamilyData = useCallback(async () => {
    if (!isAuthenticated || !familyId) return;
    try {
      setLoading(true);
      const [memsRes, storiesRes, recipesRes, membersRes, timelineRes, treeRes, notifRes, actRes] =
        await Promise.allSettled([
          api.memories.list(familyId),
          api.stories.list(familyId),
          api.recipes.list(familyId),
          api.members.list(familyId),
          api.timeline.list(familyId),
          api.tree.get(familyId),
          api.notifications.list(),
          api.notifications.getActivity(familyId),
        ]);

      if (memsRes.status === 'fulfilled' && memsRes.value) {
        setMemories(memsRes.value.memories || memsRes.value || []);
      }
      if (storiesRes.status === 'fulfilled' && storiesRes.value) {
        setStories(storiesRes.value.stories || storiesRes.value || []);
      }
      if (recipesRes.status === 'fulfilled' && recipesRes.value) {
        setRecipes(recipesRes.value.recipes || recipesRes.value || []);
      }
      if (membersRes.status === 'fulfilled' && membersRes.value) {
        setMembers(membersRes.value || []);
      }
      if (timelineRes.status === 'fulfilled' && timelineRes.value) {
        setTimeline(timelineRes.value || []);
      }
      if (treeRes.status === 'fulfilled' && treeRes.value) {
        setTreeData(treeRes.value || { members: [], couples: [], generations: [] });
      }
      if (notifRes.status === 'fulfilled' && notifRes.value) {
        setNotifications(notifRes.value.notifications || notifRes.value || []);
      }
      if (actRes.status === 'fulfilled' && actRes.value) {
        setActivity(actRes.value || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch heritage data', error);
      setLoading(false);
    }
  }, [familyId, isAuthenticated]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  const add = async (kind, item) => {
    if (!familyId) {
      toast({ title: 'No active family space found', variant: 'destructive' });
      return;
    }

    try {
      if (kind === 'memory') {
        const created = await api.memories.create(familyId, item);
        setMemories((prev) => [created, ...prev]);
      } else if (kind === 'story') {
        const created = await api.stories.create(familyId, item);
        setStories((prev) => [created, ...prev]);
      } else if (kind === 'recipe') {
        const created = await api.recipes.create(familyId, item);
        setRecipes((prev) => [created, ...prev]);
      } else if (kind === 'member') {
        const created = await api.members.create(familyId, item);
        setMembers((prev) => [...prev, created]);
        // Refresh tree
        api.tree.get(familyId).then((t) => setTreeData(t));
      }

      // Refresh activity log
      api.notifications.getActivity(familyId).then((acts) => {
        if (acts) setActivity(acts);
      });

      toast({
        title: `${kind[0].toUpperCase() + kind.slice(1)} saved`,
        description: 'Your family archive has been updated.',
      });
    } catch (error) {
      toast({
        title: `Failed to save ${kind}`,
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (kind, id) => {
    if (!familyId) return;
    try {
      if (kind === 'memory') {
        const res = await api.memories.toggleFavorite(familyId, id);
        setMemories((prev) => prev.map((x) => (x.id === id || x._id === id ? { ...x, favorite: res.favorite } : x)));
      } else if (kind === 'story') {
        const res = await api.stories.toggleFavorite(familyId, id);
        setStories((prev) => prev.map((x) => (x.id === id || x._id === id ? { ...x, favorite: res.favorite } : x)));
      } else if (kind === 'recipe') {
        const res = await api.recipes.toggleFavorite(familyId, id);
        setRecipes((prev) => prev.map((x) => (x.id === id || x._id === id ? { ...x, favorite: res.favorite } : x)));
      }
    } catch (error) {
      console.error('Toggle favorite failed', error);
    }
  };

  const remove = async (kind, id) => {
    if (!familyId) return;
    try {
      if (kind === 'memory') {
        await api.memories.delete(familyId, id);
        setMemories((prev) => prev.filter((x) => x.id !== id && x._id !== id));
      } else if (kind === 'story') {
        await api.stories.delete(familyId, id);
        setStories((prev) => prev.filter((x) => x.id !== id && x._id !== id));
      } else if (kind === 'recipe') {
        await api.recipes.delete(familyId, id);
        setRecipes((prev) => prev.filter((x) => x.id !== id && x._id !== id));
      } else if (kind === 'member') {
        await api.members.delete(familyId, id);
        setMembers((prev) => prev.filter((x) => x.id !== id && x._id !== id));
        api.tree.get(familyId).then((t) => setTreeData(t));
      }
      toast({ title: 'Removed from archive' });
    } catch (error) {
      toast({ title: 'Failed to remove', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <HeritageContext.Provider
      value={{
        memories,
        stories,
        recipes,
        members,
        timeline,
        treeData,
        notifications,
        setNotifications,
        activity,
        loading,
        add,
        toggleFavorite,
        remove,
        refresh: loadFamilyData,
      }}
    >
      {children}
    </HeritageContext.Provider>
  );
}

export const useHeritage = () => {
  const context = useContext(HeritageContext);
  if (!context) {
    throw new Error('useHeritage must be used within a HeritageProvider');
  }
  return context;
};