// pages/api/revalidate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // استخدم REVALIDATE_SECRET_TOKEN من .env.local
  if (req.query.secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const pathToRevalidate = req.body.path;
  if (!pathToRevalidate) {
    return res.status(400).json({ message: 'Path är obligatorisk' });
  }

  try {
    await res.revalidate(pathToRevalidate);
    console.log(`Successfully revalidated: ${pathToRevalidate}`);
    return res.json({ revalidated: true, path: pathToRevalidate });
  } catch (err) {
    console.error(`Error revalidating ${pathToRevalidate}:`, err);
    return res.status(500).send('Error revalidating');
  }
}