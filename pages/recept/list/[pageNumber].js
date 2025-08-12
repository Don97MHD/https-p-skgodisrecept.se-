// pages/recept/list/[pageNumber].js
import React from 'react';
import Head from 'next/head';
import Layout from '../../../layouts/layout';
import config from '../../../lib/config';
import RecipeCard from '../../../components/RecipeCard';
import CustomPagination from '../../../components/CustomPagination';
import { getRecipe, getAllRecipes } from '../../../lib/recipe';
import replaceUndefinedWithNull from '../../../lib/sanitize';
import { getRecipePageLink } from '../../../lib/utils';
import { getCategoriesData } from '../../../lib/data-fetchers'; // <-- استيراد دالة جلب التصنيفات

const RecipeListPage = ({ recipes, pageContext, allRecipes, categories }) => {
    const pageTitle = `Alla Recept - Sida ${pageContext.currentPage} | ${config.siteMetadata.title}`;
    const canonicalUrl = `${config.siteMetadata.siteUrl}/recept/list/${pageContext.currentPage}`;

    return (
        <Layout 
            title={pageTitle} 
            description={`Sida ${pageContext.currentPage} av alla recept.`} 
            allRecipesForSearch={allRecipes}
            categories={categories} // <-- تمرير التصنيفات إلى Layout
        >
            <Head>
                <link rel="canonical" href={canonicalUrl} />
                {pageContext.currentPage > 1 && (
                    <link rel="prev" href={getRecipePageLink(pageContext.currentPage - 1)} />
                )}
                {pageContext.currentPage < pageContext.numPages && (
                    <link rel="next" href={getRecipePageLink(pageContext.currentPage + 1)} />
                )}
            </Head>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                 <div className="text-center mb-12">
                    <h1 className="font-sora text-4xl md:text-5xl font-bold text-primary">
                        Alla Våra Recept
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Sida {pageContext.currentPage} av {pageContext.numPages}
                    </p>
                </div>
                <div className="flex flex-wrap -mx-3">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
                <CustomPagination
                    currentPage={pageContext.currentPage}
                    numPages={pageContext.numPages}
                />
            </div>
        </Layout>
    );
};

// --- دالة جلب المسارات الديناميكية ---
export async function getStaticPaths() {
    // هذه الدالة لا تحتاج إلى تعديل، فهي تعمل بشكل صحيح
    const recipesResponse = await getAllRecipes();
    const numPages = Math.ceil((recipesResponse.total_count || 0) / (config.blog.postPerPage || 9));
    const paths = [];

    for (let i = 2; i <= numPages; i++) {
        paths.push({
            params: { pageNumber: i.toString() },
        });
    }

    return {
        paths,
        fallback: 'blocking',
    };
}

// --- دالة جلب بيانات الصفحة ---
export async function getStaticProps({ params }) {
    const page = parseInt(params.pageNumber, 10);

    if (isNaN(page) || page < 2) {
        return { notFound: true };
    }
    
    const recipesPerPage = config.blog.postPerPage || 9;
    
    // 👇 جلب جميع البيانات المطلوبة معًا باستخدام Promise.all
    const [recipesResponse, allRecipesResponse, categoriesData] = await Promise.all([
        getRecipe(page, recipesPerPage),
        getAllRecipes(),
        getCategoriesData()
    ]);
    
    const sanitizedRecipes = replaceUndefinedWithNull(recipesResponse.data);

    if (!sanitizedRecipes || sanitizedRecipes.length === 0) {
        return { notFound: true };
    }
    
    return {
        props: {
            recipes: sanitizedRecipes,
            pageContext: {
                currentPage: recipesResponse.current_page,
                numPages: recipesResponse.total_pages,
            },
            // استخدام || [] كقيمة افتراضية للأمان
            allRecipes: replaceUndefinedWithNull(allRecipesResponse?.data) || [],
            categories: categoriesData || [],
        },
        revalidate: 60,
    };
}

export default RecipeListPage;