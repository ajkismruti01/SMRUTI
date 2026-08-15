import mongoose from 'mongoose';

const familyRelationshipSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    fromMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },
    toMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },
    relationshipType: {
      type: String,
      enum: ['PARENT_CHILD', 'SPOUSE'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure no duplicate relationships
familyRelationshipSchema.index(
  { familyId: 1, fromMemberId: 1, toMemberId: 1, relationshipType: 1 },
  { unique: true }
);

export const FamilyRelationship = mongoose.model('FamilyRelationship', familyRelationshipSchema);
export default FamilyRelationship;
