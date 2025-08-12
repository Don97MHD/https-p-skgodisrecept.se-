// pages/recept/[slug].js
import React from 'react';
import RecipeTemplate from '../../templates/RecipePost';
import { getRecipeBySlug, getAllRecipeSlugs, getAllRecipes } from '../../lib/recipe';
import replaceUndefinedWithNull from '../../lib/sanitize';
import config from '../../lib/config';
import { getCategoriesData, getSiteConfigData } from '../../lib/data-fetchers';

const RecipeDetailPage = ({ postData, pageContext, allRecipes, categories, siteConfig }) => {
    return (
        <RecipeTemplate 
            post={postData} 
            pageContext={pageContext} 
            allRecipes={allRecipes} 
            categories={categories}
            siteConfig={siteConfig}
        />
    );
};
export async function getStaticProps({ params }) {
    const requestedSlug = params.slug;

    const [recipeBySlugResponse, otherRecipesResponse, categoriesData, siteConfigData] = await Promise.all([
        getRecipeBySlug(requestedSlug),
        getAllRecipes(),
        getCategoriesData(),
        getSiteConfigData()
    ]);

    if (!recipeBySlugResponse || !recipeBySlugResponse.data || recipeBySlugResponse.data.length === 0) {
        return { notFound: true };
    }

    // سطر احترازي لضمان تحويل ObjectId إلى نص بشكل صحيح
    const recipeData = replaceUndefinedWithNull(JSON.parse(JSON.stringify(recipeBySlugResponse.data[0])));
    const currentOfficialSlug = recipeData.slug;

    if (currentOfficialSlug !== requestedSlug) {
        return {
            redirect: {
                destination: `/recept/${currentOfficialSlug}`,
                permanent: true,
            },
        };
    }

    const sanitizedOtherRecipes = replaceUndefinedWithNull(otherRecipesResponse.data)
                                    .filter(recipe => recipe.slug !== recipeData.slug)
                                    .slice(0, siteConfigData.blog?.postPerPage || 9);
                                    
    const allRecipesForSearch = replaceUndefinedWithNull(otherRecipesResponse.data);

    return {
        props: {
            postData: recipeData,
            pageContext: {
                otherRecipes: sanitizedOtherRecipes,
            },
            allRecipes: allRecipesForSearch,
            categories: categoriesData || [],
            siteConfig: siteConfigData || {},
        },
        revalidate: 60,
    };
}

export async function getStaticPaths() {
    const slugs = await getAllRecipeSlugs();
    return {
        paths: slugs.map((slug) => ({
            params: { slug },
        })),
        fallback: 'blocking',
    };
}

export default RecipeDetailPage;