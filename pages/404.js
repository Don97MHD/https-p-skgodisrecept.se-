// pages/404.js
import { Header } from 'flotiq-components-react';
import React from 'react';
import Link from 'next/link';
import Button from 'flotiq-components-react/dist/components/Button/Button';
import Layout from '../layouts/layout';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getCategoriesData, getSiteConfigData } from '../lib/data-fetchers';

const NotFoundPage = ({ allRecipes, categories, siteConfig }) => {
    const title = 'Sidan hittades inte';
    return (
        <Layout 
            title={title} 
            allRecipesForSearch={allRecipes} 
            categories={categories} 
            siteConfig={siteConfig}
        >
            <main className="flex flex-col h-screen justify-center items-center text-center px-4">
                <Header alignment="center" additionalClasses={['my-10', '!py-10', '!text-4xl']}>
                    404 - Sidan hittades inte
                </Header>
                <p className="text-lg mb-8">Tyvärr, sidan du letar efter verkar inte finnas.</p>
                <div>
                    <Link href="/" passHref>
                        <Button variant="secondary" label="Gå tillbaka till startsidan" />
                    </Link>
                </div>
            </main>
        </Layout>
    );
};

export async function getStaticProps() {
    const [recipeData, categoriesData, siteConfigData] = await Promise.all([
        getAllRecipes(),
        getCategoriesData(),
        getSiteConfigData()
    ]);
    
    return {
        props: {
            allRecipes: replaceUndefinedWithNull(recipeData?.data) || [],
            categories: categoriesData || [],
            siteConfig: siteConfigData || {},
        },
        revalidate: 60,
    };
}
export default NotFoundPage;