// pages/sok.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../layouts/layout';
import { Header, Paragraph } from 'flotiq-components-react';
import RecipeCard from '../components/RecipeCard';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getCategoriesData, getSiteConfigData } from '../lib/data-fetchers';

const SearchPage = ({ allRecipes, categories, siteConfig }) => {
    const router = useRouter();
    const { q: searchTerm } = router.query;
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (searchTerm && allRecipes) {
            const lowerCaseSearchTerm = String(searchTerm).toLowerCase();
            const filtered = allRecipes.filter(recipe =>
                (recipe.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (recipe.description?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (recipe.keywords?.toLowerCase().includes(lowerCaseSearchTerm))
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, allRecipes]);

    const pageTitle = searchTerm
        ? `Sökresultat för "${searchTerm}" | ${siteConfig.title}`
        : `Sök Recept | ${siteConfig.title}`;

    return (
        <Layout 
            title={pageTitle} 
            description={`Sökresultat för ${searchTerm}`} 
            allRecipesForSearch={allRecipes}
            categories={categories}
            siteConfig={siteConfig}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Header level={1} additionalClasses={['!font-sora !text-3xl md:!text-4xl !font-bold !text-primary mb-8']}>
                    {searchTerm ? `Sökresultat för: "${searchTerm}"` : 'Sök Recept'}
                </Header>
                {/* ... rest of the component */}
            </div>
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

export default SearchPage;