// components/RecipeCard.js
import React, { useState } from 'react'; // الخطوة 1: استيراد useState لإدارة حالة الصورة
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/solid';

const RecipeCard = ({ recipe }) => {
    if (!recipe) return null;

    // الخطوة 2: تحديد الرابط الأولي وإعداد حالة لمصدر الصورة
    // إذا لم يكن هناك رابط من الأساس، نبدأ بالصورة البديلة فورًا
    const initialUrl = recipe.image?.[0]?.url || '/images/placeholder.jpg';
    const [imageSrc, setImageSrc] = useState(initialUrl);

    // الخطوة 3: إنشاء دالة لمعالجة الخطأ
    const handleImageError = () => {
        // إذا فشل تحميل الصورة، قم بتغيير المصدر إلى الصورة البديلة
        setImageSrc('/images/placeholder.jpg');
    };

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 p-3">
            <Link href={`/recept/${recipe.slug}`} passHref>
                <div className="block bg-surface rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group h-full flex flex-col">
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <Image
                            // الخطوة 4: استخدام الحالة كمصدر للصورة بدلاً من المتغير المباشر
                            src={imageSrc} 
                            alt={recipe.name || 'Receptbild'}
                            layout="fill"
                            objectFit="cover"
                            className="transform group-hover:scale-110 transition-transform duration-300 ease-in-out"
                            // الخطوة 5: إضافة معالج الخطأ onError
                            onError={handleImageError}
                        />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold font-sora text-primary mb-2 flex-grow">
                            {recipe.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {recipe.description.replace(/<[^>]*>?/gm, '')}
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-3 border-t border-gray-extra-light">
                            <span className="font-medium">{recipe.totalTime?.replace('PT', '').replace('M', ' min')}</span>
                            <div className="flex items-center">
                                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                                <span className="font-semibold">{recipe.aggregateRating?.ratingValue || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default RecipeCard;