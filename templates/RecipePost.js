// templates/RecipePost.js

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../layouts/layout';
import config from '../lib/config';
import RecipeCard from '../components/RecipeCard';
import StarRating from '../components/StarRating';
import { Header } from 'flotiq-components-react';
import { PlusIcon, MinusIcon } from '@heroicons/react/solid';
import RecipeInteraction from '../components/RecipeInteraction';
import Breadcrumbs from '../components/Breadcrumbs'; // <-- استيراد المكون الجديد
import CreamyDivider from '../components/CreamyDivider'; 
import { useRouter } from 'next/router';

const StepImage = ({ src, alt }) => {
    const [imageSrc, setImageSrc] = useState(src || '/images/placeholder.jpg');
    const handleImageError = () => {
        setImageSrc('/images/placeholder.jpg');
    };

    return (
        <div className="my-4 rounded-lg overflow-hidden relative aspect-[16/10]">
            <Image
                src={imageSrc}
                alt={alt}
                layout="fill"
                objectFit="cover"
                onError={handleImageError}
            />
        </div>
    );
};
const parseBaseServings = (servingString) => {
    if (!servingString) return 12;
    const match = servingString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 12;
};
const IngredientChecklist = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) {
        return null;
    }
    
    return (
        <div className="space-y-4">
            {ingredients.map((ingredient, index) => {
                const ingredientText = `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.product || ''}`.trim();
                
                if (!ingredient.unit && !ingredient.amount) {
                return (
                        <div key={index} className="mt-6">
                            <h4 className="text-xl font-bold font-display text-primary mb-0">
                                {ingredient.product}
                            </h4>
                            {/* استخدام الفاصل الكريمي */}
                            <CreamyDivider />
                        </div>
                    );
                }
                return (
                    <div key={index}>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="peer h-5 w-5 text-secondary border-gray-300 rounded focus:ring-secondary focus:ring-opacity-50"
                            />
                            <span className="text-lg text-gray-800 peer-checked:text-gray-400 peer-checked:line-through transition-colors duration-200">
                                {ingredientText}
                            </span>
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

const RecipeTemplate = ({ post, pageContext, allRecipes, categories, siteConfig }) =>  {
    if (!post) {
        return (
            <Layout allRecipesForSearch={allRecipes || []} categories={categories || [] } siteConfig={siteConfig || {}}>
                <p>Receptet kunde inte laddas...</p>
            </Layout>
        );
    }
    
    const initialMainImageUrl = post.image?.[0]?.url || '/images/placeholder.jpg';
    const [mainImageSrc, setMainImageSrc] = useState(initialMainImageUrl);
    const [displayRating, setDisplayRating] = useState(post.aggregateRating);
useEffect(() => {
        // هذا الكود سيعمل في كل مرة تتغير فيها بيانات 'post'
        // مما يضمن تحديث الصورة عند التنقل بين الصفحات
        setMainImageSrc(post.image?.[0]?.url || '/images/placeholder.jpg');
        setDisplayRating(post.aggregateRating);
    }, [post]); // مصفوفة الاعتمادية: أعد تشغيل هذا التأثير عندما تتغير 'post'
    const handleMainImageError = () => {
        setMainImageSrc('/images/placeholder.jpg');
    };

    const handleReviewSuccess = (newRatingData) => {
        setDisplayRating(newRatingData);
    };

    const recipe = post;
    const baseServings = useMemo(() => parseBaseServings(recipe.servings), [recipe.servings]);
    const [currentServings, setCurrentServings] = useState(baseServings);
    const [scaledIngredients, setScaledIngredients] = useState(recipe.ingredients);
    const otherRecipes = pageContext.otherRecipes;
    const siteUrl = siteConfig?.siteUrl || 'https://påskgodisrecept.se';
    useEffect(() => {
        const newServings = Number(currentServings);
        if (isNaN(newServings) || newServings <= 0) {
            setScaledIngredients(recipe.ingredients);
            return;
        }
        const scalingFactor = newServings / baseServings;
        const newIngredients = recipe.ingredients.map(ingredient => {
            const originalAmountStr = String(ingredient.amount || '').replace(',', '.'); // Hantera kommatecken
            const originalAmount = parseFloat(originalAmountStr);

            if (isNaN(originalAmount)) {
                return ingredient;
            }
            const newAmount = originalAmount * scalingFactor;
            
            let finalAmount;
            if (newAmount < 1 && newAmount > 0) {
                finalAmount = parseFloat(newAmount.toFixed(2));
            } else if (newAmount < 10) {
                finalAmount = parseFloat(newAmount.toFixed(1));
            } else {
                finalAmount = Math.round(newAmount);
            }
            return { ...ingredient, amount: finalAmount.toString() };
        });
        setScaledIngredients(newIngredients);
    }, [currentServings, recipe.ingredients, baseServings]);

    const handleServingChange = (amount) => {
        setCurrentServings(prev => {
            const newValue = prev + amount;
            return newValue > 0 ? newValue : 1;
        });
    };
    const crumbs = [
        { name: 'Hem', url: '/' },
        { name: 'Recept', url: '/recept' },
        { name: post.name, url: `${siteUrl}/recept/${post.slug}` }
    ];
    const recipeSchema = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.name,
        "image": recipe.image?.map(img => `${siteUrl}${img.url}`) || [],
        "author": {
            "@type": "Person",
            "name": "Stefan Lindberg",
            "url": `${siteUrl}/om-oss`
        },
        "datePublished": recipe.datePublished,
        "description": recipe.description.replace(/<[^>]*>?/gm, ''),
        "prepTime": recipe.prepTime,
        "cookTime": recipe.cookingTime,
        "totalTime": recipe.totalTime,
        "keywords": recipe.keywords,
        "recipeYield": recipe.servings,
        "recipeCategory": recipe.recipeCategory,
        "recipeCuisine": recipe.recipeCuisine,
        ...(recipe.aggregateRating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": recipe.aggregateRating.ratingValue,
                "reviewCount": recipe.aggregateRating.ratingCount
            }
        }),
        ...(recipe.nutrition && {
            "nutrition": {
                "@type": "NutritionInformation",
                "calories": recipe.nutrition.calories
            }
        }),
        "recipeIngredient": recipe.ingredients
            ?.filter(ing => ing.product && (ing.amount || ing.unit))
            .map(ing => `${ing.amount || ''} ${ing.unit || ''} ${ing.product}`.trim()) || [],
        "recipeInstructions": recipe.steps?.map((step, index) => ({
            "@type": "HowToStep",
            "name": `Steg ${index + 1}`,
            "text": step.step,
            "url": `${siteUrl}/recept/${recipe.slug}#step-${index + 1}`,
            ...(step.image && step.image[0] && {
                "image": `${siteUrl}${step.image[0].url}`
            })
        })) || []
    };
    const router = useRouter();
    const currentUrl = `${siteUrl}${router.asPath}`;
    return (
        <Layout
            allRecipesForSearch={allRecipes}
            categories={categories}
            siteConfig={siteConfig}
            title={`${recipe.name} | ${siteConfig.title || 'Påskgodis Recept'}`}
            description={recipe.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'}
            ogImage={recipe.image?.[0]?.url}
            ogType="article"
        >
            <Head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}/>
            </Head>
                        <Breadcrumbs crumbs={crumbs} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <article className="bg-surface rounded-lg shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-0">
                            <Image
                                src={mainImageSrc}
                                alt={recipe.name}
                                layout="fill"
                                objectFit="cover"
                                priority
                                onError={handleMainImageError}
                            />
                        </div>
                        <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
                            <Header level={1} additionalClasses={['!font-sora !text-3xl md:!text-4xl !font-bold !text-primary !mb-4']}>
                                {recipe.name}
                            </Header>
                            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                                {displayRating && <StarRating rating={displayRating.ratingValue} />}
                                <span>{`(${displayRating?.ratingCount || 0} betyg)`}</span>
                            </div>
                            
                            {recipe.elsaIntro && (
                                <blockquote className="border-l-4 border-secondary pl-4 italic text-gray-600 my-4">
                                    <div dangerouslySetInnerHTML={{ __html: recipe.elsaIntro }} />
                                    <p className="font-semibold not-italic mt-3 text-primary">- Stefan Lindberg</p>
                                </blockquote>
                            )}

                            <div className="grid grid-cols-3 gap-4 text-center my-6">
                                <div>
                                    <p className="text-sm text-gray-500">Förberedelse</p>
                                    <p className="font-semibold text-primary">{recipe.prepTime?.replace('PT', '').replace('M', ' min')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tillagning</p>
                                    <p className="font-semibold text-primary">{recipe.cookingTime?.replace('PT', '').replace('M', ' min')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Portioner</p>
                                    <p className="font-semibold text-primary">{recipe.servings}</p>
                                </div>
                            </div>
                             <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: recipe.description }} />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row p-6 md:p-10 border-t border-gray-extra-light">
                        <div className="w-full md:w-1/3 md:pr-8 mb-8 md:mb-0">
                             <Header level={2} additionalClasses={['!font-sora !text-2xl !font-bold !text-primary !mb-4']}>Ingredienser</Header>
                              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-full border border-gray-200 mb-6">
                                <button 
                                    onClick={() => handleServingChange(-1)}
                                    className="bg-primary text-white rounded-full p-2 hover:bg-opacity-90 transition-all duration-200 disabled:bg-gray-300"
                                    disabled={currentServings <= 1}
                                    aria-label="Minska antal portioner"
                                >
                                    <MinusIcon className="h-5 w-5" />
                                </button>
                                <div className="text-center">
                                    <span className="font-bold text-lg text-primary">{currentServings}</span>
                                    <span className="text-sm text-gray-600"> portioner/bitar</span>
                                </div>
                                <button 
                                    onClick={() => handleServingChange(1)}
                                    className="bg-primary text-white rounded-full p-2 hover:bg-opacity-90 transition-all duration-200"
                                    aria-label="Öka antal portioner"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                             </div>
                             <IngredientChecklist ingredients={scaledIngredients} />
                        </div>
                             
                        <div className="w-full md:w-2/3 md:pl-8 md:border-l border-gray-extra-light">
                            <Header level={2} additionalClasses={['!font-sora !text-2xl !font-bold !text-primary !mb-4']}>Gör så här</Header>
                            <div className="prose prose-lg max-w-none">
                                <ol>
                                    {recipe.steps?.map((step, index) => (
                                        <li key={index} id={`step${index + 1}`}>
                                            <div dangerouslySetInnerHTML={{ __html: step.step }} />
                                            {step.image && step.image[0] && (
                                                <StepImage 
                                                    src={step.image[0].url} 
                                                    alt={`Bild för steg ${index + 1}`}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                      {recipe.image && recipe.image.length > 1 && (
                        <div className="p-6 md:p-10 border-t border-gray-extra-light">
                            <Header level={2} additionalClasses={['!font-display !text-2xl !font-bold !text-primary !mb-6']}>
                                Fler Bilder
                            </Header>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {recipe.image.slice(1).map((img, index) => (
                                    <div key={img.id || index} className="relative rounded-lg overflow-hidden shadow-md">
                                        <Image
                                            src={img.url || '/images/placeholder.jpg'}
                                            alt={img.alt || `${recipe.name} - bild ${index + 2}`}
                                            layout="responsive"
                                            width={800}
                                            height={600}
                                            className="transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="p-6 md:p-10 border-t border-gray-extra-light">
                      {recipe._id && (
                             <RecipeInteraction
                                recipeId={recipe._id}
                                currentUrl={currentUrl}
                                onReviewSuccess={handleReviewSuccess}
                             />
                        )}
                    </div>
                
                </article>
            </div>
            
            {otherRecipes && otherRecipes.length > 0 && (
                <div className="bg-background pt-16">
                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                             <h2 className="text-3xl md:text-4xl font-bold text-primary font-sora">Fler recept att utforska</h2>
                        </div>
                        <div className="flex flex-wrap -mx-3">
                            {otherRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RecipeTemplate;