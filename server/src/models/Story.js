import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
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
    authorMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
    },
    author: {
      type: String,
      default: 'Family Member',
    },
    authorPhoto: {
      type: String,
      default: 'https://i.pravatar.cc/300?img=33',
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
    preview: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000',
    },
    audio: {
      type: Boolean,
      default: false,
    },
    audioUrl: {
      type: String,
      default: '',
    },
    audioDuration: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '5 min',
    },
    transcript: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Family',
      index: true,
    },
    date: {
      type: String,
      default: 'Today',
    },
    tags: [
      {
        type: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    favoriteBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    relatedMemoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory',
      },
    ],
    relatedMemberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
  },
  {
    timestamps: true,
  }
);

storySchema.index({ familyId: 1, category: 1, createdAt: -1 });

export const Story = mongoose.model('Story', storySchema);
export default Story;
