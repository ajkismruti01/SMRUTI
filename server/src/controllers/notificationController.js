import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return successResponse(res, {
      notifications: notifications.map((n) => ({ ...n.toObject(), id: n._id.toString() })),
      unreadCount,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, notification, 'Notification marked as read');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getActivityFeed = async (req, res) => {
  try {
    const familyId = req.family._id;
    const activity = await ActivityLog.find({ familyId }).sort({ createdAt: -1 }).limit(30);

    return successResponse(
      res,
      activity.map((a) => ({ ...a.toObject(), id: a._id.toString() }))
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
