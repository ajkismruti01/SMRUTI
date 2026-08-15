import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { Family } from '../models/Family.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { config } from './environment.js';
import { logger } from '../utils/logger.js';

if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User';
          const profileImage = profile.photos?.[0]?.value || 'https://i.pravatar.cc/300?img=33';
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // 1. Check if user exists by googleId OR email
          let user = await User.findOne({
            $or: [{ googleId }, { email }],
          });

          if (user) {
            // Update existing user with googleId & photo if needed
            user.googleId = googleId;
            user.lastLoginAt = new Date();
            if (profileImage && (!user.profileImage || user.profileImage.includes('pravatar'))) {
              user.profileImage = profileImage;
            }
            await user.save();
            logger.info(`Existing user logged in via Google: ${user.email} (${user._id})`);
          } else {
            // 2. Create new user
            user = await User.create({
              googleId,
              email,
              name,
              firstName,
              lastName,
              profileImage,
              lastLoginAt: new Date(),
            });

            // 3. Create initial family space for the new user or join default family
            const existingDefaultFamily = await Family.findOne({ name: 'Mehta Family' });
            let userFamily;

            if (existingDefaultFamily) {
              // Add user as member to existing family space
              userFamily = existingDefaultFamily;
              await FamilyMember.create({
                familyId: userFamily._id,
                userId: user._id,
                name: user.name,
                relationship: 'Member',
                photo: user.profileImage,
                role: 'MEMBER',
                joinedDate: 'Recently',
              });
            } else {
              // Create a personal family space
              const familyTitle = `${lastName || firstName || name}'s Family`;
              userFamily = await Family.create({
                name: familyTitle,
                description: `Private family heritage space for ${user.name}.`,
                familyPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
                ownerId: user._id,
              });
              await FamilyMember.create({
                familyId: userFamily._id,
                userId: user._id,
                name: user.name,
                relationship: 'Owner',
                photo: user.profileImage,
                role: 'OWNER',
                joinedDate: 'Recently',
              });
            }

            user.currentFamilyId = userFamily._id;
            await user.save();

            logger.info(`New user registered and assigned family space: ${user.email} (${user._id})`);
          }

          return done(null, user);
        } catch (error) {
          logger.error('Error during Google authentication', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth credentials missing in configuration.');
}

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
