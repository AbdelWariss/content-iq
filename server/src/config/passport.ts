import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";

// Passport opère avec les documents Mongoose — on caste via unknown pour éviter
// le conflit de type Express.User vs IUser dans ce contexte de session
type PassportUser = Express.User;

export function configurePassport(): void {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    logger.warn("OAuth Google non configuré — GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL manquants");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Email Google non disponible"));

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            user.lastLoginAt = new Date();
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              emailVerified: true,
              role: "free",
              credits: { remaining: 50, total: 50 },
            });
          }

          return done(null, user as unknown as PassportUser);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );

  // Session désactivée — JWT only. serialize/deserialize ne sont pas utilisés en pratique.
  passport.serializeUser((user, done) =>
    done(null, (user as unknown as { _id: string })._id?.toString()),
  );
  passport.deserializeUser(async (id: unknown, done) => {
    try {
      const user = await User.findById(id as string);
      done(null, user as unknown as PassportUser);
    } catch (err) {
      done(err);
    }
  });
}
