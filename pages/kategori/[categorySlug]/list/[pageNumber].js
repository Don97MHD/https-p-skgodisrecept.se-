// pages/kategori/[categorySlug]/list/[pageNumber].js
import React from 'react';
import Head from 'next/head';
import Layout from '../../../../layouts/layout';
import config from '../../../../lib/config';
import RecipeCard from '../../../../components/RecipeCard';
import CustomPagination from '../../../../components/CustomPagination';
import { getRecipe, getAllRecipes } from '../../../../lib/recipe';
import replaceUndefinedWithNull from '../../../../lib/sanitize';
import { getCategoryPageLink } from '../../../../lib/categoryUtils';
import { getCategoriesData } from '../../../../lib/data-fetchers'; // <-- استيراد جديد

const CategoryListPage = ({ recipes, pageContext, categoryInfo, allRecipes, categories }) => {
    const pageTitle = `${categoryInfo.name} - Sida ${pageContext.currentPage} | ${config.siteMetadata.title}`;
    const canonicalUrl = `${config.siteMetadata.siteUrl}/kategori/${categoryInfo.slug}/list/${pageContext.currentPage}`;

    return (
        <Layout 
            title={pageTitle} 
            description={`Sida ${pageContext.currentPage} av alla recept i kategorin ${categoryInfo.name}.`} 
            allRecipesForSearch={allRecipes}
            categories={categories}
        >
            <Head>
                <link rel="canonical" href={canonicalUrl} />
                <link rel="prev" href={getCategoryPageLink(categoryInfo.slug, pageContext.currentPage - 1)} />
                {pageContext.currentPage < pageContext.numPages && (
                    <link rel="next" href={getCategoryPageLink(categoryInfo.slug, pageContext.currentPage + 1)} />
                )}
            </Head>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                 <div className="text-center mb-12">
                    <h1 className="font-sora text-4xl md:text-5xl font-bold text-primary">{categoryInfo.headline}</h1>
                    <p className="text-lg text-gray-600 mt-2">Sida {pageContext.currentPage} av {pageContext.numPages}</p>
                </div>
                <div className="flex flex-wrap -mx-3">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
                <CustomPagination
                    currentPage={pageContext.currentPage}
                    numPages={pageContext.numPages}
                    basePath={`/kategori/${categoryInfo.slug}`}
                />
            </div>
        </Layout>
    );
};

export async function getStaticPaths() {
    // fallback: 'blocking' سيتولى إنشاء الصفحات عند الطلب الأول
    return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
    const { categorySlug, pageNumber } = params;
    
    // 👇 جلب البيانات باستخدام await
    const [allCategories, allRecipesResponse] = await Promise.all([
        getCategoriesData(),
        getAllRecipes()
    ]);
    
    const categoryInfo = allCategories.find(c => c.slug === categorySlug);
    const page = parseInt(pageNumber, 10);

    if (!categoryInfo || isNaN(page) || page < 2) {
        return { notFound: true };
    }
    
    const recipesPerPage = config.blog.postPerPage || 9;
    const recipesResponse = await getRecipe(page, recipesPerPage, categoryInfo.filterTerm);
    
    if (!recipesResponse.data || recipesResponse.data.length === 0) {
        return { notFound: true };
    }
    
    return {
        props: {
            recipes: replaceUndefinedWithNull(recipesResponse.data),
            pageContext: {
                currentPage: recipesResponse.current_page,
                numPages: recipesResponse.total_pages,
            },
            categoryInfo,
            allRecipes: replaceUndefinedWithNull(allRecipesResponse.data),
            categories: allCategories,
        },
        revalidate: 60,
    };
}

export default CategoryListPage;