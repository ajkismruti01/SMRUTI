import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['memory', 'story', 'recipe', 'member', 'event', 'family'],
      default: 'memory',
    },
    text: {
      type: String,
      required: true,
    },
    member: {
      type: String,
      default: 'Family Member',
    },
    memberPhoto: {
      type: String,
      default: 'https://i.pravatar.cc/300?img=33',
    },
    entityType: {
      type: String,
      default: '',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    time: {
      type: String,
      default: 'Just now',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ familyId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
