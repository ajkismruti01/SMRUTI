import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      default: 'https://i.pravatar.cc/300?img=12',
    },
    bio: {
      type: String,
      default: '',
    },
    birthYear: {
      type: Number,
    },
    birthPlace: {
      type: String,
      default: '',
    },
    occupation: {
      type: String,
      default: '',
    },
    generation: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADULT_MEMBER', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
    },
    joinedDate: {
      type: String,
      default: 'Just now',
    },
  },
  {
    timestamps: true,
  }
);

familyMemberSchema.index({ familyId: 1, userId: 1 });

export const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
export default FamilyMember;
