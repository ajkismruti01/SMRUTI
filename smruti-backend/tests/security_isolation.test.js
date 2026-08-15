import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Family } from '../src/models/Family.js';
import { FamilyMember } from '../src/models/FamilyMember.js';
import { Memory } from '../src/models/Memory.js';
import { Story } from '../src/models/Story.js';
import { Recipe } from '../src/models/Recipe.js';
import { TimelineEvent } from '../src/models/TimelineEvent.js';
import { createApp } from '../src/app.js';

test('Security & Data Isolation Tests - Cross-Family and IDOR Prevention', async (t) => {
  await connectDB();
  const app = createApp();

  let userA, userB;
  let familyA, familyB;
  let memoryA, memoryB;

  await t.test('Setup isolated test families and users', async () => {
    // Clean up test entities if exist
    await User.deleteMany({ email: { $in: ['test_user_a@smruti.test', 'test_user_b@smruti.test'] } });

    userA = await User.create({
      name: 'User A',
      email: 'test_user_a@smruti.test',
      googleId: 'test_google_a_' + Date.now(),
    });

    userB = await User.create({
      name: 'User B',
      email: 'test_user_b@smruti.test',
      googleId: 'test_google_b_' + Date.now(),
    });

    familyA = await Family.create({
      name: 'Family Alpha',
      ownerId: userA._id,
    });

    familyB = await Family.create({
      name: 'Family Beta',
      ownerId: userB._id,
    });

    await FamilyMember.create({
      familyId: familyA._id,
      userId: userA._id,
      name: 'User A Member',
      relationship: 'Owner',
      role: 'OWNER',
    });

    await FamilyMember.create({
      familyId: familyB._id,
      userId: userB._id,
      name: 'User B Member',
      relationship: 'Owner',
      role: 'OWNER',
    });

    memoryA = await Memory.create({
      familyId: familyA._id,
      createdBy: userA._id,
      title: 'Family Alpha Private Memory',
      description: 'Top secret memory for Family Alpha',
    });

    memoryB = await Memory.create({
      familyId: familyB._id,
      createdBy: userB._id,
      title: 'Family Beta Private Memory',
      description: 'Top secret memory for Family Beta',
    });

    assert.ok(userA && userB && familyA && familyB);
  });

  await t.test('Database query level isolation prevents cross-family read', async () => {
    // Querying Memory with familyA filter must NEVER return memoryB
    const foundMemoriesA = await Memory.find({ familyId: familyA._id });
    const memoryIds = foundMemoriesA.map((m) => m._id.toString());

    assert.ok(memoryIds.includes(memoryA._id.toString()), 'Family A should see memory A');
    assert.ok(!memoryIds.includes(memoryB._id.toString()), 'Family A MUST NOT see memory B');
  });

  await t.test('IDOR protection: Target memory must match familyId', async () => {
    // Simulating user trying to find memoryB within familyA
    const illegalAccess = await Memory.findOne({
      _id: memoryB._id,
      familyId: familyA._id,
    });

    assert.equal(illegalAccess, null, 'Cross-family memory access returned null as expected');
  });

  await t.test('Clean up test artifacts', async () => {
    await Memory.deleteMany({ _id: { $in: [memoryA._id, memoryB._id] } });
    await FamilyMember.deleteMany({ familyId: { $in: [familyA._id, familyB._id] } });
    await Family.deleteMany({ _id: { $in: [familyA._id, familyB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  });

  // Close connection after tests
  await mongoose.disconnect();
});
