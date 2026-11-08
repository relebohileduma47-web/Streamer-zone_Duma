const User = require('../models/User');

// Creates the single creator account if no user exists yet.
module.exports = async function seedAdmin() {
  if ((await User.countDocuments()) > 0) return;
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('No creator account exists and ADMIN_EMAIL / ADMIN_PASSWORD are not set.');
    return;
  }
  await User.create({
    name: ADMIN_NAME || 'Creator',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD, // hashed by the User model before saving
    bio: 'Welcome! Edit this introduction from the Profile page in your dashboard.',
  });
  console.log(`Creator account created for ${ADMIN_EMAIL}`);
};
