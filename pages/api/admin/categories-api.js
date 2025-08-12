// pages/api/admin/categories-api.js
import { connectToDatabase } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('categories');

    if (req.method === 'GET') {
        const data = await collection.find({}).sort({ name: 1 }).toArray();
        res.status(200).json(data);
    } else if (req.method === 'POST') {
        try {
            // سنستبدل كل شيء لتسهيل الإضافة والحذف
            const updatedCategories = req.body.map(({ _id, ...cat }) => cat); // إزالة أي _id قديم
            
            await collection.deleteMany({});
            if (updatedCategories.length > 0) {
                await collection.insertMany(updatedCategories);
            }
            
            res.status(200).json({ message: 'Kategorierna har uppdaterats!' });
        } catch (error) {
            res.status(500).json({ message: 'Fel vid uppdatering av kategorier.', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Metod ${req.method} är inte tillåten`);
    }
}