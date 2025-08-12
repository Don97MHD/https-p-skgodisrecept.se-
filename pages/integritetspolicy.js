// pages/integritetspolicy.js
import React from 'react';
import Layout from '../layouts/layout';
import { Header } from 'flotiq-components-react';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getPagesData, getCategoriesData, getSiteConfigData } from '../lib/data-fetchers';

const PrivacyPolicyPage = ({ content, allRecipes, categories, siteConfig }) => {
    return (
        <Layout 
            title={content.title} 
            description={content.meta_description} 
            allRecipesForSearch={allRecipes}
            categories={categories}
            siteConfig={siteConfig}
        >
            <div className="bg-surface">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center">
                        <Header level={1} additionalClasses={['!font-display !text-4xl md:!text-5xl !font-bold !text-primary']}>
                            {content.headline}
                        </Header>
                    </div>
                    <div 
                        className="prose prose-lg max-w-none text-gray-700 mt-12 leading-loose"
                        dangerouslySetInnerHTML={{ __html: content.body }}
                    />
                </div>
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    const [allRecipesResponse, pagesData, categoriesData, siteConfigData] = await Promise.all([
        getAllRecipes(),
        getPagesData(),
        getCategoriesData(),
        getSiteConfigData()
    ]);

    const pageContent = pagesData.find(p => p.key === 'privacy');

    if (!pageContent) {
        return { notFound: true };
    }

    return {
        props: {
            allRecipes: replaceUndefinedWithNull(allRecipesResponse?.data) || [],
            content: pageContent,
            categories: categoriesData || [],
            siteConfig: siteConfigData || {},
        },
        revalidate: 3600, // يمكن إعادة بناء هذه الصفحات بشكل أقل تكرارًا
    };
}

export default PrivacyPolicyPage;