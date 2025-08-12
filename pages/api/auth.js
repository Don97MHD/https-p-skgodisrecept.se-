// pages/api/auth.js
import { ADMIN_TOKEN } from '../../lib/auth'; // <--- استيراد التوكن المركزي

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
         return res.status(500).json({ message: 'Admin password not set on server.' });
    }

    if (password === adminPassword) {
        // استخدم التوكن المركزي والموحد
        res.status(200).json({ token: ADMIN_TOKEN }); // <--- استخدام التوكن المركزي
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
}