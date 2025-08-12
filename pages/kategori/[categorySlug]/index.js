import React from 'react';
import Head from 'next/head';
import Layout from '../../../layouts/layout';
import RecipeCard from '../../../components/RecipeCard';
import CustomPagination from '../../../components/CustomPagination';
import { getRecipe, getAllRecipes } from '../../../lib/recipe';
import replaceUndefinedWithNull from '../../../lib/sanitize';
import { getCategoryPageLink } from '../../../lib/categoryUtils';
import { getCategoriesData } from '../../../lib/data-fetchers';
import config from '../../../lib/config'; // <-- هذا هو السطر الذي كان مفقودًا

const CategoryPage = ({ recipes, pageContext, categoryInfo, allRecipes, categories }) => {
    if (!categoryInfo) {
        return (
             <Layout allRecipesForSearch={allRecipes || []} categories={categories || []}>
                <p>Kategori hittades inte.</p>
             </Layout>
        );
    }

    const pageTitle = `${categoryInfo.name} - Recept | ${config.siteMetadata.title}`;
    const canonicalUrl = `${config.siteMetadata.siteUrl}/kategori/${categoryInfo.slug}`;

    return (
        <Layout 
            title={pageTitle} 
            description={categoryInfo.meta_description} 
            allRecipesForSearch={allRecipes}
            categories={categories}
        >
            <Head>
                <link rel="canonical" href={canonicalUrl} />
                {pageContext.numPages > 1 && (
                    <link rel="next" href={getCategoryPageLink(categoryInfo.slug, 2)} />
                )}
            </Head>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="font-sora text-4xl md:text-5xl font-bold text-primary">{categoryInfo.headline}</h1>
                    <div className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto"
                         dangerouslySetInnerHTML={{ __html: categoryInfo.body }}/>
                </div>
                <div className="flex flex-wrap -mx-3">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
                {pageContext.numPages > 1 && (
                    <CustomPagination
                        currentPage={1}
                        numPages={pageContext.numPages}
                        basePath={`/kategori/${categoryInfo.slug}`}
                    />
                )}
            </div>
        </Layout>
    );
};

export async function getStaticPaths() {
    const categories = await getCategoriesData();
    const paths = categories.map(cat => ({
        params: { categorySlug: cat.slug },
    }));
    return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
    const { categorySlug } = params;
    
    const [allCategories, allRecipesResponse] = await Promise.all([
        getCategoriesData(),
        getAllRecipes()
    ]);

    const categoryInfo = allCategories.find(c => c.slug === categorySlug);

    if (!categoryInfo) {
        return { notFound: true };
    }
    
    const recipesPerPage = config.blog.postPerPage || 9;
    const recipesResponse = await getRecipe(1, recipesPerPage, categoryInfo.filterTerm);
    
    return {
        props: {
            recipes: replaceUndefinedWithNull(recipesResponse.data),
            pageContext: {
                currentPage: 1,
                numPages: recipesResponse.total_pages,
            },
            categoryInfo,
            allRecipes: replaceUndefinedWithNull(allRecipesResponse.data),
            categories: allCategories,
        },
        revalidate: 60,
    };
}

export default CategoryPage;