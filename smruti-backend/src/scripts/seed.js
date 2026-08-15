import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Family } from '../models/Family.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { FamilyRelationship } from '../models/FamilyRelationship.js';
import { Memory } from '../models/Memory.js';
import { Story } from '../models/Story.js';
import { Recipe } from '../models/Recipe.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { logger } from '../utils/logger.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB for seeding.');

    // 1. Find or create seed user (Rohan Mehta)
    let user = await User.findOne({ email: 'rohan@example.com' });
    if (!user) {
      user = await User.create({
        googleId: 'google_rohan_seed_001',
        email: 'rohan@example.com',
        name: 'Rohan Mehta',
        firstName: 'Rohan',
        lastName: 'Mehta',
        profileImage: 'https://i.pravatar.cc/300?img=33',
        language: 'en',
      });
      logger.info('Created initial user: Rohan Mehta');
    }

    // 2. Find or create Mehta Family
    let family = await Family.findOne({ name: 'Mehta Family' });
    if (!family) {
      family = await Family.create({
        name: 'Mehta Family',
        description: 'Our private family space. A home for three generations of cherished memories.',
        familyPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
        ownerId: user._id,
      });
      logger.info('Created Mehta Family space');
    }

    user.currentFamilyId = family._id;
    await user.save();

    // Check if data already seeded
    const memberCount = await FamilyMember.countDocuments({ familyId: family._id });
    if (memberCount > 0) {
      logger.info(`Family already has ${memberCount} members. Skipping duplicate seed.`);
      process.exit(0);
    }

    // 3. Create Family Members
    const av = (i) => `https://i.pravatar.cc/300?img=${i}`;
    const membersData = [
      {
        key: 'm1',
        name: 'Dhirubhai Mehta',
        relationship: 'Grandfather',
        generation: 0,
        photo: av(12),
        birthYear: 1945,
        birthPlace: 'Surat, Gujarat',
        bio: 'Retired textile merchant who built the family business from nothing. A storyteller at heart who keeps our roots alive.',
        occupation: 'Business Owner (Retired)',
        role: 'ADULT_MEMBER',
      },
      {
        key: 'm2',
        name: 'Kantaben Mehta',
        relationship: 'Grandmother',
        generation: 0,
        photo: av(47),
        birthYear: 1948,
        birthPlace: 'Surat, Gujarat',
        bio: 'The heart of our family. Her kitchen is where every recipe was born and every story began.',
        occupation: 'Homemaker',
        role: 'ADULT_MEMBER',
      },
      {
        key: 'm3',
        name: 'Mahesh Mehta',
        relationship: 'Father',
        generation: 1,
        photo: av(11),
        birthYear: 1975,
        birthPlace: 'Surat, Gujarat',
        bio: 'A devoted father who balances family and business with quiet strength and unwavering love.',
        occupation: 'Business Owner',
        role: 'ADULT_MEMBER',
      },
      {
        key: 'm4',
        name: 'Nirali Mehta',
        relationship: 'Mother',
        generation: 1,
        photo: av(45),
        birthYear: 1978,
        birthPlace: 'Ahmedabad, Gujarat',
        bio: 'The glue that holds us together. Her love shows in every meal she cooks and every story she tells.',
        occupation: 'Teacher',
        role: 'ADULT_MEMBER',
      },
      {
        key: 'm5',
        name: 'Ramesh Mehta',
        relationship: 'Uncle',
        generation: 1,
        photo: av(14),
        birthYear: 1978,
        birthPlace: 'Surat, Gujarat',
        bio: "Dhirubhai's younger son. An engineer who moved to Mumbai but never misses a family gathering.",
        occupation: 'Engineer',
        role: 'ADULT_MEMBER',
      },
      {
        key: 'm6',
        name: 'Sunita Mehta',
        relationship: 'Aunt',
        generation: 1,
        photo: av(48),
        birthYear: 1980,
        birthPlace: 'Mumbai, Maharashtra',
        bio: "Ramesh's wife. A warm presence at every family gathering, always bringing new recipes.",
        occupation: 'Designer',
        role: 'ADULT_MEMBER',
      },
      {
        key: 'm7',
        name: 'Rohan Mehta',
        relationship: 'Son',
        generation: 2,
        photo: av(33),
        birthYear: 2000,
        birthPlace: 'Surat, Gujarat',
        bio: 'Tech enthusiast preserving family memories for the digital age. The family archivist.',
        occupation: 'Software Engineer',
        role: 'OWNER',
        userId: user._id, // link to logged in user
      },
      {
        key: 'm8',
        name: 'Pooja Mehta',
        relationship: 'Daughter',
        generation: 2,
        photo: av(44),
        birthYear: 2002,
        birthPlace: 'Surat, Gujarat',
        bio: 'Studying medicine, carrying forward the family\'s caring spirit and dedication.',
        occupation: 'Medical Student',
        role: 'MEMBER',
      },
      {
        key: 'm9',
        name: 'Krunal Mehta',
        relationship: 'Cousin',
        generation: 2,
        photo: av(13),
        birthYear: 2005,
        birthPlace: 'Mumbai, Maharashtra',
        bio: "Ramesh and Sunita's son. A bright young cricketer with a love for family history.",
        occupation: 'Student',
        role: 'MEMBER',
      },
      {
        key: 'm10',
        name: 'Myra Mehta',
        relationship: 'Daughter',
        generation: 2,
        photo: av(49),
        birthYear: 2010,
        birthPlace: 'Surat, Gujarat',
        bio: 'The youngest member of our family, full of joy, curiosity and endless questions.',
        occupation: 'Student',
        role: 'MEMBER',
      },
    ];

    const createdMembersMap = {};
    for (const mData of membersData) {
      const { key, ...rest } = mData;
      const doc = await FamilyMember.create({
        ...rest,
        familyId: family._id,
        joinedDate: 'Jan 2024',
      });
      createdMembersMap[key] = doc;
    }
    logger.info(`Created ${Object.keys(createdMembersMap).length} family members.`);

    // 4. Create Relationships (Explicit graph edges)
    const relationships = [
      // Dhirubhai (m1) & Kantaben (m2) Spouse
      { from: 'm1', to: 'm2', type: 'SPOUSE' },
      // Parents of Mahesh (m3) and Ramesh (m5)
      { from: 'm1', to: 'm3', type: 'PARENT_CHILD' },
      { from: 'm2', to: 'm3', type: 'PARENT_CHILD' },
      { from: 'm1', to: 'm5', type: 'PARENT_CHILD' },
      { from: 'm2', to: 'm5', type: 'PARENT_CHILD' },
      // Mahesh (m3) & Nirali (m4) Spouse
      { from: 'm3', to: 'm4', type: 'SPOUSE' },
      // Parents of Rohan (m7), Pooja (m8), Myra (m10)
      { from: 'm3', to: 'm7', type: 'PARENT_CHILD' },
      { from: 'm4', to: 'm7', type: 'PARENT_CHILD' },
      { from: 'm3', to: 'm8', type: 'PARENT_CHILD' },
      { from: 'm4', to: 'm8', type: 'PARENT_CHILD' },
      { from: 'm3', to: 'm10', type: 'PARENT_CHILD' },
      { from: 'm4', to: 'm10', type: 'PARENT_CHILD' },
      // Ramesh (m5) & Sunita (m6) Spouse
      { from: 'm5', to: 'm6', type: 'SPOUSE' },
      // Parents of Krunal (m9)
      { from: 'm5', to: 'm9', type: 'PARENT_CHILD' },
      { from: 'm6', to: 'm9', type: 'PARENT_CHILD' },
    ];

    for (const rel of relationships) {
      await FamilyRelationship.create({
        familyId: family._id,
        fromMemberId: createdMembersMap[rel.from]._id,
        toMemberId: createdMembersMap[rel.to]._id,
        relationshipType: rel.type,
      });
    }
    logger.info('Created family relationship graph.');

    // 5. Seed Memories
    const photos = {
      wedding: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      trip: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200',
      grad: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      diwali: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
      house: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
      birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000',
      cooking: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000',
      temple: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000',
      picnic: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000',
    };

    const memoriesData = [
      {
        title: "Grandparents' Wedding",
        date: '15 Mar 1985',
        dateSort: 19850315,
        year: 1985,
        location: 'Surat, Gujarat',
        image: photos.wedding,
        gallery: [photos.wedding, photos.family, photos.diwali],
        type: 'Photos',
        category: 'Wedding',
        description: 'A beautiful spring morning in Surat when Dhirubhai and Kantaben began their journey together. The whole family gathered for three days of celebration, music and feasts that would be remembered for generations.',
        people: [createdMembersMap.m1._id, createdMembersMap.m2._id, createdMembersMap.m3._id],
        uploadedBy: 'Kantaben Mehta',
        favoriteBy: [user._id],
        views: 342,
      },
      {
        title: 'Family Trip to Mount Abu',
        date: '22 May 1998',
        dateSort: 19980522,
        year: 1998,
        location: 'Mount Abu, Rajasthan',
        image: photos.trip,
        gallery: [photos.trip, photos.temple],
        type: 'Photos',
        category: 'Travel',
        description: 'Our first family vacation to the hills. The children had never seen mountains before. We still talk about the sunset from Sunset Point and the temple visit the next morning.',
        people: [createdMembersMap.m1._id, createdMembersMap.m2._id, createdMembersMap.m3._id, createdMembersMap.m4._id, createdMembersMap.m5._id],
        uploadedBy: 'Mahesh Mehta',
        views: 218,
      },
      {
        title: "Dad's Graduation Day",
        date: '10 Jun 2005',
        dateSort: 20050610,
        year: 2005,
        location: 'Ahmedabad, Gujarat',
        image: photos.grad,
        gallery: [photos.grad, photos.family],
        type: 'Photos',
        category: 'Education',
        description: 'The day Mahesh graduated from university. Dadi cried happy tears. It was the first graduation in the family and everyone came to celebrate.',
        people: [createdMembersMap.m3._id, createdMembersMap.m1._id, createdMembersMap.m2._id],
        uploadedBy: 'Rohan Mehta',
        views: 156,
      },
      {
        title: 'New Home Sweet Home',
        date: '01 Jan 2010',
        dateSort: 20100101,
        year: 2010,
        location: 'Surat, Gujarat',
        image: photos.house,
        gallery: [photos.house, photos.family],
        type: 'Photos',
        category: 'Milestone',
        description: 'We moved into our new home. The whole family helped paint, arrange furniture and cook the first meal in the new kitchen. A new chapter began.',
        people: [createdMembersMap.m3._id, createdMembersMap.m4._id, createdMembersMap.m7._id, createdMembersMap.m8._id],
        uploadedBy: 'Nirali Mehta',
        favoriteBy: [user._id],
        views: 189,
      },
      {
        title: 'Diwali Celebration',
        date: '11 Nov 2015',
        dateSort: 20151111,
        year: 2015,
        location: 'Surat, Gujarat',
        image: photos.diwali,
        gallery: [photos.diwali, photos.family],
        type: 'Videos',
        category: 'Festival',
        description: "The brightest Diwali we've ever had. Myra was old enough to light her first diya. The house glowed for days and the aroma of fresh ladoos filled every room.",
        people: [createdMembersMap.m1._id, createdMembersMap.m2._id, createdMembersMap.m3._id, createdMembersMap.m4._id, createdMembersMap.m10._id],
        uploadedBy: 'Rohan Mehta',
        favoriteBy: [user._id],
        views: 287,
      },
    ];

    for (const mem of memoriesData) {
      await Memory.create({
        ...mem,
        familyId: family._id,
        createdBy: user._id,
      });
    }
    logger.info(`Seeded ${memoriesData.length} memories.`);

    // 6. Seed Stories
    const storiesData = [
      {
        title: "Grandma's Childhood in the Village",
        author: 'Kantaben Mehta',
        authorPhoto: av(47),
        authorMemberId: createdMembersMap.m2._id,
        image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=900',
        date: '12 August 2024',
        duration: '8 min',
        views: 234,
        category: 'Childhood',
        preview: "Growing up in a small village near Surat, we didn't have much, but we had each other. Every evening, my mother would tell us stories under the banyan tree...",
        text: 'Every family carries stories that deserve to live beyond a lifetime. This memory has been told around our table for years, gathering warmth with every retelling. My grandmother would sit us down after dinner and begin: "When I was your age..." and we would listen, wide-eyed, as the world she described came alive.\n\nThe village was small, maybe thirty families. Everyone knew everyone. In the mornings, I would walk to the river with my mother to wash clothes. The water was cold and clear, and the stones were smooth. We would talk to the other women, share news, share recipes, share worries.\n\nIt was a simpler time, but not an easier one. We had no electricity, no running water. But we had community, and that was everything. When someone was sick, everyone brought food. When someone was married, everyone helped cook. That\'s what I want you to remember — we are nothing without each other.',
        audio: true,
        favoriteBy: [user._id],
        tags: ['village', 'childhood', '1940s'],
      },
      {
        title: "Grandpa's First Job",
        author: 'Dhirubhai Mehta',
        authorPhoto: av(12),
        authorMemberId: createdMembersMap.m1._id,
        image: photos.trip,
        date: '5 August 2024',
        duration: '12 min',
        views: 189,
        category: 'Career',
        preview: 'I was sixteen when I got my first job at the textile mill. I earned two rupees a day, and I thought I was the richest man in Surat...',
        text: 'When I think back to my first job, I remember the smell of cotton in the air and the sound of the looms. I was just a boy, really. Sixteen years old, walking three miles to the mill every morning.\n\nMy father had passed away the year before, and I was the eldest. There was no choice — I had to work. The mill owner, Mr. Patel, was a kind man. He saw something in me, I think. He taught me to count, to measure, to negotiate.\n\nWithin a year, I was managing a small section. Within five years, I had saved enough to start my own small shop. That shop became the business that fed our family for three generations. Never let anyone tell you that hard work doesn\'t matter. It does. Every single day of it.',
        audio: true,
        tags: ['career', '1970s', 'surat'],
      },
    ];

    for (const story of storiesData) {
      await Story.create({
        ...story,
        familyId: family._id,
        createdBy: user._id,
      });
    }
    logger.info(`Seeded ${storiesData.length} stories.`);

    // 7. Seed Recipes
    const recipesData = [
      {
        name: "Ba's Thepla",
        sharedBy: 'Kantaben Mehta',
        sharedByPhoto: av(47),
        sharedByMemberId: createdMembersMap.m2._id,
        category: 'Breakfast',
        time: 25,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000',
        story: 'This recipe has been in our family for four generations. My grandmother taught me on a wooden chakla when I was eight. The secret is in the methi — it must be fresh, never dried.',
        ingredients: [
          '2 cups whole wheat flour',
          '1 cup fresh methi leaves, finely chopped',
          '2 tbsp yogurt',
          '2 tbsp oil',
          '1 tsp turmeric',
          '1 tsp red chili powder',
          '1 tsp cumin seeds',
          'Salt to taste',
        ],
        steps: [
          'Mix flour, methi, yogurt, oil, and all spices in a large bowl.',
          'Knead into a soft dough using warm water. Cover and rest for 15 minutes.',
          'Divide into 12 equal portions and roll each into a thin circle.',
          'Cook on a hot tava with a little oil until golden on both sides.',
          'Serve hot with pickle and yogurt.',
        ],
        servings: '4–5',
        difficulty: 'Easy',
        tags: ['traditional', 'breakfast', 'gujarati'],
        views: 342,
        favoriteBy: [user._id],
      },
    ];

    for (const recipe of recipesData) {
      await Recipe.create({
        ...recipe,
        familyId: family._id,
        createdBy: user._id,
      });
    }
    logger.info(`Seeded ${recipesData.length} recipes.`);

    // 8. Seed Timeline Events
    const timelineData = [
      {
        year: 1945,
        title: "Dhirubhai's Birth",
        date: '12 January 1945',
        dateSort: 19450112,
        category: 'Birth',
        description: 'Dhirubhai Mehta was born in a small village near Surat, laying the foundation for our family.',
        location: 'Surat, Gujarat',
        relatedMemberIds: [createdMembersMap.m1._id],
      },
      {
        year: 1985,
        title: "Grandparents' Wedding",
        date: '15 March 1985',
        dateSort: 19850315,
        category: 'Wedding',
        description: 'Dhirubhai and Kantaben wed in a traditional Gujarati ceremony attended by the entire village.',
        location: 'Surat, Gujarat',
        relatedMemberIds: [createdMembersMap.m1._id, createdMembersMap.m2._id],
      },
      {
        year: 2000,
        title: "Rohan's Birth",
        date: '20 May 2000',
        dateSort: 20000520,
        category: 'Birth',
        description: 'Rohan was born in Surat, bringing immense joy to the entire household.',
        location: 'Surat, Gujarat',
        relatedMemberIds: [createdMembersMap.m7._id, createdMembersMap.m3._id, createdMembersMap.m4._id],
      },
    ];

    for (const tEvent of timelineData) {
      await TimelineEvent.create({
        ...tEvent,
        familyId: family._id,
        createdBy: user._id,
      });
    }
    logger.info(`Seeded ${timelineData.length} timeline events.`);

    // 9. Seed Notification & Activity
    await Notification.create({
      userId: user._id,
      familyId: family._id,
      type: 'system',
      title: 'Welcome to SMRUTI',
      message: 'Your family space has been initialized and secured.',
    });

    await ActivityLog.create({
      userId: user._id,
      familyId: family._id,
      action: 'SYSTEM_INIT',
      type: 'family',
      text: 'initialized the Mehta family archive',
      member: 'Rohan Mehta',
      memberPhoto: user.profileImage,
      entityType: 'Family',
      entityId: family._id,
    });

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database', error);
    process.exit(1);
  }
};

seedDatabase();
