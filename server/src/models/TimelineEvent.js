import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: '',
    },
    dateSort: {
      type: Number,
      default: 0,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Milestone',
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    relatedMemberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
    relatedMemoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory',
      },
    ],
  },
  {
    timestamps: true,
  }
);

timelineEventSchema.index({ familyId: 1, year: -1, dateSort: -1 });

export const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);
export default TimelineEvent;
