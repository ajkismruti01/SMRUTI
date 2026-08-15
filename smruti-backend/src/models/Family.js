import mongoose from 'mongoose';

const familySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: 'Our private family heritage space.',
    },
    familyPhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Family = mongoose.model('Family', familySchema);
export default Family;
