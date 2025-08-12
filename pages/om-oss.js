// pages/om-oss.js
import React from 'react';
import Layout from '../layouts/layout';
import { Header } from 'flotiq-components-react';
import Image from 'next/image';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getPagesData, getCategoriesData,  getSiteConfigData } from '../lib/data-fetchers';

const OmOssPage = ({ content, allRecipes , categories, siteConfig }) => {
    // ... (المكون لا يتغير، فقط مصدر البيانات)
     return (
        <Layout title={content.title} description={content.meta_description} allRecipesForSearch={allRecipes}  categories={categories}  siteConfig={siteConfig}>
            <div className="bg-surface">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center">
                        <Image
                            src="/images/stefan-lindberg-portrait.jpg"
                            alt="stefan-lindberg"
                            width={200}
                            height={200}
                            className="rounded-full shadow-2xl mx-auto mb-8"
                        />
                        <Header level={1} additionalClasses={['!font-sora !text-4xl md:!text-5xl !font-bold !text-primary']}>
                            {content.headline}
                        </Header>
                        <p className="text-secondary font-semibold text-lg mt-2">Grundare & Receptkreatör</p>
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

    const aboutPageContent = pagesData.find(p => p.key === 'about');

    if (!aboutPageContent) {
        return { notFound: true };
    }

    return {
        props: {
            allRecipes: replaceUndefinedWithNull(allRecipesResponse?.data) || [],
            content: aboutPageContent,
            categories: categoriesData || [],
            siteConfig: siteConfigData || {},
        },
        revalidate: 60,
    };
}

export default OmOssPage;