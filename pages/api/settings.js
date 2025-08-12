// pages/api/settings.js
import { connectToDatabase } from '../../lib/mongodb';
import { verifyToken } from '../../lib/auth';
import { getSiteConfigData } from '../../lib/data-fetchers'; // <-- استيراد الدالة الجديدة

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            // استخدم نفس الدالة الموحدة لجلب الإعدادات المدمجة
            const settingsData = await getSiteConfigData();
            res.status(200).json(settingsData);
        } catch (error) {
            res.status(500).json({ message: 'Could not read settings.', error: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const { db } = await connectToDatabase();
            const collection = db.collection('settings');
            const settingsKey = { key: "main_settings" };
            
            const { siteConfig } = req.body;
            const { _id, key, ...configToUpdate } = siteConfig;
            
            await collection.updateOne(
                settingsKey,
                { $set: configToUpdate },
                { upsert: true } // upsert: true سيقوم بإنشاء المستند إذا لم يكن موجودًا
            );
            
            res.status(200).json({ message: 'Settings have been updated!' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating settings.', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} is not allowed`);
    }
}