import { Memory } from '../models/Memory.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { Story } from '../models/Story.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export const getOnThisDay = async (req, res) => {
  try {
    const familyId = req.family._id;

    // Get today's date info (month and day)
    const today = new Date();
    const currentMonth = today.toLocaleString('en-US', { month: 'short' }); // e.g. 'Aug'
    const currentDay = String(today.getDate()).padStart(2, '0'); // e.g. '15'

    // Match any memories/events where date string contains current month and day or matching dateSort
    const monthRegex = new RegExp(`${currentDay}\\s+${currentMonth}|${currentMonth}\\s+${currentDay}|${currentMonth}`, 'i');

    const memories = await Memory.find({
      familyId,
      $or: [{ date: monthRegex }],
    }).sort({ year: -1 });

    const events = await TimelineEvent.find({
      familyId,
      $or: [{ date: monthRegex }],
    }).sort({ year: -1 });

    // Group items by year
    const byYearMap = new Map();

    memories.forEach((m) => {
      const yr = m.year || (m.date ? parseInt(m.date.slice(-4), 10) : 2020);
      if (!byYearMap.has(yr)) byYearMap.set(yr, []);
      byYearMap.get(yr).push({
        type: 'memory',
        id: m._id.toString(),
        title: m.title,
        description: m.description,
        image: m.image,
        date: m.date,
        location: m.location,
        category: m.category,
      });
    });

    events.forEach((e) => {
      const yr = e.year || 2020;
      if (!byYearMap.has(yr)) byYearMap.set(yr, []);
      byYearMap.get(yr).push({
        type: 'event',
        id: e._id.toString(),
        title: e.title,
        description: e.description,
        image: e.image,
        date: e.date,
        location: e.location,
        category: e.category,
      });
    });

    // Format grouped list
    const grouped = [];
    Array.from(byYearMap.keys())
      .sort((a, b) => b - a)
      .forEach((year) => {
        grouped.push({
          year,
          yearsAgo: today.getFullYear() - year,
          items: byYearMap.get(year),
        });
      });

    return successResponse(res, {
      todayFormatted: today.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
      totalMoments: memories.length + events.length,
      historicalMoments: grouped,
      memories: memories.map((m) => ({ ...m.toObject(), id: m._id.toString() })),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
