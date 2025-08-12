import React from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/outline';

const StarRating = ({ rating, totalStars = 5, starSize = "h-5 w-5" , color = "text-yellow-400" }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5; // Check for a half star (e.g., 4.5)
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <StarIconSolid key={`full-${i}`} className={`${starSize} ${color}`} />
            ))}
            {halfStar && (
                <div className="relative"> {/* For precise half-star rendering */}
                    <StarIconOutline key="half-outline" className={`${starSize} ${color}`} />
                    <div 
                        className="absolute top-0 left-0 h-full overflow-hidden" 
                        style={{ width: '50%' }} // Show only half of the solid star
                    >
                        <StarIconSolid key="half-solid" className={`${starSize} ${color}`} />
                    </div>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <StarIconOutline key={`empty-${i}`} className={`${starSize} text-gray-300`} />
            ))}
        </div>
    );
};

export default StarRating;