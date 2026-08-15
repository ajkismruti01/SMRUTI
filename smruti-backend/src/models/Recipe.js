import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
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
    sharedByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
    },
    sharedBy: {
      type: String,
      default: 'Family Member',
    },
    sharedByPhoto: {
      type: String,
      default: 'https://i.pravatar.cc/300?img=47',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    story: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000',
    },
    ingredients: [
      {
        type: String,
      },
    ],
    steps: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      default: 'Main Course',
      index: true,
    },
    time: {
      type: Number,
      default: 30,
    },
    servings: {
      type: String,
      default: '4–5',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    voiceRecipeUrl: {
      type: String,
      default: '',
    },
    voiceDuration: {
      type: String,
      default: '',
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
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ familyId: 1, category: 1, createdAt: -1 });

export const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
