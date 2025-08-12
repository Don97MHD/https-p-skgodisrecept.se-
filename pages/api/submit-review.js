// pages/api/submit-review.js

import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { db } = await connectToDatabase();

    try {
        const { recipeId, rating, comment } = req.body;

        if (!recipeId || typeof recipeId !== 'string' || recipeId.length !== 24) {
            throw new Error(`Invalid recipeId received: ${recipeId}`);
        }
        if (!rating || rating < 1 || rating > 5) {
            throw new Error('Ogiltigt betyg. Betyget måste vara mellan 1-5.');
        }
        if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
            throw new Error('En kommentar krävs.');
        }

        const recipesCollection = db.collection('recipes');
        const reviewsCollection = db.collection('reviews');
        const recipeObjectId = new ObjectId(recipeId);

        const recipe = await recipesCollection.findOne({ _id: recipeObjectId });

        if (!recipe) {
            throw new Error('Receptet hittades inte.');
        }

        const currentRatingValue = parseFloat(recipe.aggregateRating?.ratingValue || '0');
        const currentRatingCount = parseInt(recipe.aggregateRating?.ratingCount || '0', 10);
        
        const totalRatingPoints = (currentRatingValue * currentRatingCount) + rating;
        const newRatingCount = currentRatingCount + 1;
        const newAverageRating = totalRatingPoints / newRatingCount;

        const updateResult = await recipesCollection.updateOne(
            { _id: recipeObjectId },
            { 
                $set: {
                    'aggregateRating.ratingValue': parseFloat(newAverageRating.toFixed(2)),
                    'aggregateRating.ratingCount': newRatingCount
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error('Misslyckades med att uppdatera receptbetyget.');
        }

        await reviewsCollection.insertOne({
            recipeId: recipeObjectId,
            rating: rating,
            comment: comment.trim(),
            createdAt: new Date(),
            approved: true, 
        });

        // تم إضافة القيم المحدثة هنا ليتم إرجاعها إلى الواجهة الأمامية
        res.status(200).json({ 
            message: 'Tack! Din recension har tagits emot.',
            newRatingValue: parseFloat(newAverageRating.toFixed(2)),
            newRatingCount: newRatingCount
        });

    } catch (error) {
        console.error('Submit Review API Error:', error);
        res.status(500).json({ message: error.message || 'Ett serverfel uppstod.' });
    }
}