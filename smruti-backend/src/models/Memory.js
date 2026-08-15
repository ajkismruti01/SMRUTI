import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
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
      index: true,
    },
    location: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['Photos', 'Videos', 'Audio', 'Documents'],
      default: 'Photos',
    },
    category: {
      type: String,
      enum: [
        'Wedding',
        'Travel',
        'Festival',
        'Birthday',
        'Family',
        'Education',
        'Milestone',
        'Spiritual',
        'Sports',
        'Celebration',
        'Other',
      ],
      default: 'Family',
      index: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
    },
    gallery: [
      {
        type: String,
      },
    ],
    people: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
      },
    ],
    favoriteBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    uploadedBy: {
      type: String,
      default: 'Family Member',
    },
    uploadDate: {
      type: String,
      default: 'Just now',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

memorySchema.index({ familyId: 1, category: 1, dateSort: -1 });

export const Memory = mongoose.model('Memory', memorySchema);
export default Memory;
