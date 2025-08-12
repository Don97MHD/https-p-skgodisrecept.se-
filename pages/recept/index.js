// pages/recept/index.js

import React from 'react';
import Head from 'next/head';
import Layout from '../../layouts/layout';
import config from '../../lib/config';
import RecipeCard from '../../components/RecipeCard';
import CustomPagination from '../../components/CustomPagination';
import replaceUndefinedWithNull from '../../lib/sanitize';
import { Header } from 'flotiq-components-react';

// تم حذف جميع استدعاءات (import) لدوال الخادم من هنا

const RecipeIndexPage = ({ recipes, pageContext, allRecipes, categories, siteConfig }) => {
    // محتوى المكون يبقى كما هو بدون أي تغيير
    const pageTitle = `Alla Våra Recept | ${siteConfig.title}`;
    const pageDescription = `Bläddra bland alla ljuvliga recept på ${siteConfig.title}. Hitta din nästa favoritkaka att baka!`;
    const canonicalUrl = `${siteConfig.siteUrl}/recept`;

    return (
        <Layout 
            title={pageTitle} 
            description={pageDescription} 
            allRecipesForSearch={allRecipes}
            categories={categories}
            siteConfig={siteConfig}
        >
            <Head>
                <link rel="canonical" href={canonicalUrl} />
                {pageContext.numPages > 1 && (
                    <link rel="next" href={`${siteConfig.siteUrl}/recept/list/2`} />
                )}
            </Head>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="text-center mb-12">
                    <Header level={1} additionalClasses={['!font-sora !text-4xl md:!text-5xl !font-bold !text-primary']}>
                        Alla Våra Recept
                    </Header>
                    <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
                        Här har vi samlat alla bakverk, från älskade klassiker till nya, spännande skapelser.
                    </p>
                </div>

                {recipes && recipes.length > 0 ? (
                    <div className="flex flex-wrap -mx-3">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-lg">Inga recept att visa för tillfället.</p>
                )}

                {pageContext.numPages > 1 && (
                    <CustomPagination
                        currentPage={1}
                        numPages={pageContext.numPages}
                    />
                )}
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    // --- بداية التعديل: استدعاء الدوال هنا داخل الدالة فقط ---
    const { getRecipe, getAllRecipes } = await import('../../lib/recipe');
    const { getCategoriesData, getSiteConfigData } = await import('../../lib/data-fetchers');
    const cfg = await import('../../lib/config');
    const recipesPerPage = cfg.default.blog.postPerPage || 9;
    // --- نهاية التعديل ---
    
    const [recipesResponse, allRecipesResponse, categoriesData, siteConfigData] = await Promise.all([
        getRecipe(1, recipesPerPage),
        getAllRecipes(),
        getCategoriesData(),
        getSiteConfigData()
    ]);
    
    return {
        props: {
            recipes: replaceUndefinedWithNull(recipesResponse?.data) || [],
            pageContext: {
                currentPage: 1,
                numPages: recipesResponse?.total_pages || 1,
            },
            allRecipes: replaceUndefinedWithNull(allRecipesResponse?.data) || [],
            categories: categoriesData || [],
            siteConfig: siteConfigData || {}, // إضافة إعدادات الموقع
        },
        revalidate: 60,
    };
}

export default RecipeIndexPage;