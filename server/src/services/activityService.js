import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { logger } from '../utils/logger.js';

export const createNotification = async ({
  userId,
  familyId,
  type = 'system',
  title,
  message,
  relatedEntityType,
  relatedEntityId,
}) => {
  try {
    return await Notification.create({
      userId,
      familyId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
    });
  } catch (error) {
    logger.error('Failed to create notification', error);
  }
};

export const createActivityLog = async ({
  userId,
  familyId,
  action,
  type,
  text,
  member,
  memberPhoto,
  entityType,
  entityId,
}) => {
  try {
    return await ActivityLog.create({
      userId,
      familyId,
      action,
      type,
      text,
      member: member || 'Family Member',
      memberPhoto: memberPhoto || 'https://i.pravatar.cc/300?img=33',
      entityType,
      entityId,
      time: 'Just now',
    });
  } catch (error) {
    logger.error('Failed to create activity log', error);
  }
};
