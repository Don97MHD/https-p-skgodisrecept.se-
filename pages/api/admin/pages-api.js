// pages/api/admin/pages-api.js
import { connectToDatabase } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('pages');

    if (req.method === 'GET') {
        const data = await collection.find({}).toArray();
        res.status(200).json(data);
    } else if (req.method === 'POST') {
        try {
            // الآن، بدلاً من استبدال الملف، سنقوم بتحديث كل صفحة على حدة
            const updatedPages = req.body;
            const bulkOps = updatedPages.map(page => {
                const { _id, ...rest } = page;
                return {
                    updateOne: {
                        filter: { _id: new ObjectId(_id) },
                        update: { $set: rest },
                    }
                };
            });
            
            await collection.bulkWrite(bulkOps);
            res.status(200).json({ message: 'Sidorna har uppdaterats!' });
        } catch (error) {
            res.status(500).json({ message: 'Fel vid uppdatering av sidor.', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Metod ${req.method} är inte tillåten`);
    }
}