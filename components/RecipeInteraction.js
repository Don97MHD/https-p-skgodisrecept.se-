// components/RecipeInteraction.js

import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/solid';
import {
    FacebookShareButton,
    TwitterShareButton,
    PinterestShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    PinterestIcon,
    EmailIcon,
} from 'react-share';

const RecipeInteraction = ({ recipeId, currentUrl, onReviewSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setMessage({ text: 'Vänligen välj ett betyg (1-5 stjärnor).', type: 'error' });
            return;
        }
        if (comment.trim() === '') {
            setMessage({ text: 'Vänligen skriv en kommentar.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ text: 'Skickar din recension...', type: 'info' });

        try {
            const res = await fetch('/api/submit-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId, rating, comment }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Ett okänt fel uppstod.');

            setMessage({ text: data.message || 'Tack! Din recension har skickats.', type: 'success' });
            
            if (onReviewSuccess) {
                onReviewSuccess({
                    ratingValue: data.newRatingValue,
                    ratingCount: data.newRatingCount,
                });
            }

            setComment('');
            setRating(0);

        } catch (error) {
            setMessage({ text: `Ett fel uppstod: ${error.message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const messageStyles = {
        info: 'text-blue-600',
        success: 'text-green-600',
        error: 'text-red-600',
    };

    return (
        <div className="bg-gray-50 p-6 md:p-8 rounded-lg border border-gray-200 mt-12 text-center">
            <h3 className="font-cursive text-4xl text-primary mb-6">
                Vad tyckte du om receptet?
            </h3>
            
            <div className="flex justify-center items-center space-x-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`h-10 w-10 cursor-pointer transition-colors duration-200 ${
                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>

            <div className="flex justify-center items-center space-x-3 mb-8">
                <p className="text-sm font-semibold text-gray-600 mr-2">Dela:</p>
                <FacebookShareButton url={currentUrl}><FacebookIcon size={32} round /></FacebookShareButton>
                <TwitterShareButton url={currentUrl}><TwitterIcon size={32} round /></TwitterShareButton>
                <PinterestShareButton url={currentUrl} media={currentUrl}><PinterestIcon size={32} round /></PinterestShareButton>
                <EmailShareButton url={currentUrl}><EmailIcon size={32} round /></EmailShareButton>
            </div>
            
            <form onSubmit={handleSubmitReview} className="max-w-lg mx-auto">
                 <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border rounded-md"
                    placeholder="Skriv din kommentar här för att kunna betygsätta..."
                    rows="4"
                 />
                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors mt-4 disabled:bg-opacity-50"
                 >
                    {isSubmitting ? 'Skickar...' : 'Skicka Recension'}
                 </button>
            </form>

            {message.text && <p className={`mt-4 font-semibold ${messageStyles[message.type]}`}>{message.text}</p>}
        </div>
    );
};

export default RecipeInteraction;