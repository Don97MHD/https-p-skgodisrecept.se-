import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../lib/auth';
export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { db } = await connectToDatabase();
        const recipesCollection = db.collection('recipes');

        switch (req.method) {
            case 'GET': {
                const recipes = await recipesCollection.find({}).sort({ datePublished: -1 }).toArray();
                res.status(200).json(recipes);
                break;
            }
            case 'POST': {
                const newRecipe = req.body;
                delete newRecipe._id; 
                const result = await recipesCollection.insertOne(newRecipe);
                res.status(201).json({ message: 'Receptet har lagts till!', insertedId: result.insertedId });
                break;
            }
            case 'PUT': {
                const { _id, ...updatedData } = req.body;
                if (!_id) return res.status(400).json({ message: 'Receptets _id krävs för uppdatering.' });
                
                const result = await recipesCollection.updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: updatedData }
                );
                
                if (result.matchedCount === 0) return res.status(404).json({ message: 'Receptet hittades inte.' });
                res.status(200).json({ message: 'Receptet har uppdaterats!' });
                break;
            }
            case 'DELETE': {
                const { id } = req.query;
                if (!id) return res.status(400).json({ message: 'Receptets ID krävs.' });
                
                const result = await recipesCollection.deleteOne({ _id: new ObjectId(id) });
                
                if (result.deletedCount === 0) return res.status(404).json({ message: 'Receptet hittades inte.' });
                res.status(200).json({ message: 'Receptet har raderats!' });
                break;
            }
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Metod ${req.method} är inte tillåten`);
        }
    } catch (error) {
        console.error("API Error in /api/recipes:", error);
        res.status(500).json({ message: 'Internt serverfel.', error: error.message });
    }
}