// pages/sitemap.xml.js

import { getAllRecipes } from '../lib/recipe';
import { getPagesData, getCategoriesData, getSiteConfigData } from '../lib/data-fetchers';

// دالة لتوليد كود XML لكل رابط
const generateUrlNode = (url, lastmod, changefreq, priority) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;

function generateSiteMap(siteUrl, recipes, categories, pages) {
    const today = new Date().toISOString().split('T')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     
     ${generateUrlNode(`${siteUrl}/`, today, 'daily', '1.00')}
     
    
     ${pages
       .map(({ path }) => generateUrlNode(`${siteUrl}${path}`, today, 'monthly', '0.80'))
       .join('')}

    
     ${categories
       .map(({ slug }) => generateUrlNode(`${siteUrl}/kategori/${slug}`, today, 'weekly', '0.90'))
       .join('')}

    
     ${generateUrlNode(`${siteUrl}/recept`, today, 'weekly', '0.80')}

     
     ${recipes
       .map(({ slug, datePublished }) => generateUrlNode(`${siteUrl}/recept/${slug}`, datePublished || today, 'weekly', '0.70'))
       .join('')}
   </urlset>
 `;
}

// دالة Next.js لتوليد الصفحة من جانب الخادم
export async function getServerSideProps({ res }) {
    // جلب كل البيانات المطلوبة ديناميكيًا
    const [siteConfig, recipesResponse, categoriesData, pagesData] = await Promise.all([
        getSiteConfigData(),
        getAllRecipes(),
        getCategoriesData(),
        getPagesData(),
    ]);

    const siteUrl = siteConfig.siteUrl;
    const recipes = recipesResponse.data || [];
    const categories = categoriesData || [];
    // استبعاد صفحات الخصوصية والشروط من الأولوية العالية إذا أردت
    const pages = pagesData.filter(p => p.path) || [];

    // توليد خريطة الموقع
    const sitemap = generateSiteMap(siteUrl, recipes, categories, pages);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return { props: {} };
}

// المكون نفسه لا يعرض شيئًا
const Sitemap = () => {};
export default Sitemap;