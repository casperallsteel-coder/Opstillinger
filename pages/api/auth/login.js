// pages/api/auth/login.js
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';
import { getUserByUsername, validatePassword } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Brugernavn og adgangskode er påkrævet.' });
  }

  const user = getUserByUsername(username.toLowerCase().trim());

  if (!user || !validatePassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Forkert brugernavn eller adgangskode.' });
  }

  const session = await getIronSession(req, res, sessionOptions);
  session.user = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
  };
  await session.save();

  return res.status(200).json({ ok: true, user: session.user });
}
