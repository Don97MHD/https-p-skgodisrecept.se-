// pages/index.js
import React from 'react';
import Layout from '../layouts/layout';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';
import RecipeCard from '../components/RecipeCard';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { Header, Paragraph } from 'flotiq-components-react';
import { getCategoriesData, getSiteConfigData } from '../lib/data-fetchers';
import { BeakerIcon, BookOpenIcon, StarIcon, ChevronDownIcon } from '@heroicons/react/outline';

// --- المكونات المتخصصة للصفحة الرئيسية ---

// قسم الإحصائيات لبناء الثقة
const StatsSection = ({ recipeCount, ratingCount }) => (
    <div className="bg-surface py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-4">
                    <BookOpenIcon className="w-12 h-12 mx-auto text-secondary mb-3"/>
                    <p className="text-4xl font-bold font-display text-primary">{recipeCount}+</p>
                    <p className="text-gray-500 font-semibold">Noggrant Utprovade Recept</p>
                </div>
                <div className="p-4">
                    <StarIcon className="w-12 h-12 mx-auto text-secondary mb-3"/>
                    <p className="text-4xl font-bold font-display text-primary">{ratingCount}+</p>
                    <p className="text-gray-500 font-semibold">Nöjda Recensioner Från Er</p>
                </div>
                <div className="p-4">
                    <BeakerIcon className="w-12 h-12 mx-auto text-secondary mb-3"/>
                    <p className="text-4xl font-bold font-display text-primary">100%</p>
                    <p className="text-gray-500 font-semibold">Passion För Hantverket</p>
                </div>
            </div>
        </div>
    </div>
);

// قسم الفئات (الآن ديناميكي بالكامل مع صور تلقائية)
const DynamicCategorySection = ({ categories }) => {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="bg-background py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Header level={2} additionalClasses={['!font-display !text-3xl md:!text-4xl !font-bold !text-primary']}>
                        Utforska Påskens Godsaker
                    </Header>
                    <Paragraph additionalClasses={['text-lg text-gray-600 mt-4 max-w-2xl mx-auto']}>
                        Oavsett om du föredrar choklad, kola eller marsipan, finns det en kategori som väntar på dig. Varje kategori är fylld med recept och tekniker för att du ska lyckas.
                    </Paragraph>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map(cat => {
                        const imagePath = `/images/categories/${cat.slug}.jpg`;
                        const fallbackImagePath = '/images/categories/category-default.jpg';

                        return (
                            <Link href={`/kategori/${cat.slug}`} key={cat.slug} passHref>
                                <div className="block group text-center cursor-pointer">
                                    <div className="relative rounded-lg overflow-hidden w-full aspect-square mx-auto shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                                        <Image 
                                            src={imagePath}
                                            alt={cat.name} 
                                            layout="fill" 
                                            objectFit="cover"
                                            onError={(e) => { e.currentTarget.src = fallbackImagePath; }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                                            <h3 className="text-white text-2xl font-bold font-display text-center drop-shadow-md p-2">{cat.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// قسم جديد للترويج للأدلة والتقنيات
const GuideTeaserSection = () => (
    <div className="bg-primary text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center px-4">
            <BeakerIcon className="w-16 h-16 mx-auto text-secondary mb-4" />
            <Header level={2} additionalClasses={['!font-display !text-3xl md:!text-4xl !font-bold !text-white']}>
                Mer än bara recept – bemästra hantverket
            </Header>
            <Paragraph additionalClasses={['text-lg text-gray-300 leading-relaxed my-6']}>
                Lär dig hemligheterna bakom perfekt tempererad choklad, hur du kokar den segaste kolan, och teknikerna som lyfter ditt påskgodis från gott till oförglömligt. Mina guider är skapade för att göra dig till en mästare i ditt eget kök.
            </Paragraph>
            <Link href="/recept" passHref> 
                <Button label="Läs mina guider" variant="secondary" />
            </Link>
        </div>
    </div>
);

// قسم جديد لآراء الزوار (Testimonials)
const TestimonialSection = () => (
    <div className="bg-surface py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <Header level={2} additionalClasses={['!font-display !text-3xl md:!text-4xl !font-bold !text-primary']}>
                    Vad andra säger
                </Header>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                    <Image src="/images/testimonial-1.jpg" alt="Anna S." width={80} height={80} className="rounded-full mx-auto mb-4" />
                    <blockquote className="text-gray-600 italic">"Stefans recept på saltkola är idiotsäkert! Bästa påskgodiset jag någonsin gjort. Tack!"</blockquote>
                    <p className="mt-2 font-bold text-primary">- Anna S.</p>
                </div>
                 <div className="text-center">
                    <Image src="/images/testimonial-2.jpg" alt="Mikael L." width={80} height={80} className="rounded-full mx-auto mb-4" />
                    <blockquote className="text-gray-600 italic">"Äntligen en sida som går på djupet. Guiden om att temperera choklad förändrade allt för mig."</blockquote>
                    <p className="mt-2 font-bold text-primary">- Mikael L.</p>
                </div>
                 <div className="text-center">
                    <Image src="/images/testimonial-3.jpg" alt="Familjen P." width={80} height={80} className="rounded-full mx-auto mb-4" />
                    <blockquote className="text-gray-600 italic">"Vi gjorde marsipankycklingar med barnen efter Stefans guide. Så roligt och resultatet blev fantastiskt!"</blockquote>
                    <p className="mt-2 font-bold text-primary">- Familjen P.</p>
                </div>
            </div>
        </div>
    </div>
);

// قسم الأسئلة الشائعة (FAQ)
const FaqSection = () => {
    const faqs = [
        { q: "Hur förvarar jag bäst hemgjort påskgodis?", a: "De flesta kolor och knäck förvaras bäst torrt och svalt i en burk med lock. Chokladpraliner mår bäst i kylen, men bör tas fram en stund innan servering för bästa smak." },
        { q: "Kan jag byta ut ljus sirap mot mörk sirap?", a: "Absolut! Mörk sirap ger en djupare och mer karamelliserad smak, vilket kan vara ljuvligt i många kolor. Prova dig fram för att hitta din favorit." },
        { q: "Varför blir min choklad grå och flammig?", a: "Det beror oftast på att chokladen inte har tempererats korrekt. Temperering stabiliserar kakaosmöret och ger en glansig, hård yta. Kolla in min guide om chokladtemperering för en detaljerad genomgång!" },
    ];
    return (
        <div className="bg-background py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Header level={2} additionalClasses={['!font-display !text-3xl md:!text-4xl !font-bold !text-primary']}>
                        Frågor & Svar från Kocken
                    </Header>
                     <Paragraph additionalClasses={['text-lg text-gray-600 mt-4 max-w-2xl mx-auto']}>
                        Här har jag samlat svaren på några av de vanligaste frågorna jag får. Allt för att göra din tid i köket enklare och roligare.
                    </Paragraph>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                         <details key={index} className="group bg-surface p-6 rounded-lg shadow-sm">
                            <summary className="flex justify-between items-center font-semibold cursor-pointer text-lg text-primary">
                                {faq.q}
                                <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- المكون الرئيسي للصفحة الرئيسية (مُعاد بناؤه بالكامل) ---
const HomePage = ({
    latestRecipes,
    topRatedRecipes,
    allRecipes,
    categories,
    siteConfig
}) => {
    
    if (!allRecipes || allRecipes.length === 0) {
        return (
             <Layout allRecipesForSearch={[]} categories={categories} siteConfig={siteConfig}>
                <div className="text-center py-20">
                    <p>Webbplatsen är under uppbyggnad. Kom snart tillbaka för fantastiska recept!</p>
                </div>
            </Layout>
        )
    }

    const totalRatings = allRecipes.reduce((acc, recipe) => acc + (parseInt(recipe.aggregateRating?.ratingCount, 10) || 0), 0);

    return (
        <Layout allRecipesForSearch={allRecipes} categories={categories} siteConfig={siteConfig}>
            {/* 1. Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center text-center bg-primary text-white">
                 <Image src="/images/paskgodis-hero-background.jpg" alt="Vackert hemgjort påskgodis" layout="fill" objectFit="cover" className="absolute inset-0 z-0 opacity-40" priority/>
                <div className="relative z-10 p-5 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold font-display drop-shadow-lg mb-6">
                        Skapa Magi i Påskköket.
                    </h1>
                    <Paragraph additionalClasses={['text-lg md:text-xl text-gray-200 mb-10 drop-shadow-md max-w-2xl mx-auto']}>
                        Välkommen till Sveriges mest dedikerade guide för hemgjort påskgodis. Jag är Stefan Lindberg, och jag hjälper dig att lyckas – från den enklaste kolan till de mest avancerade chokladpralinerna.
                    </Paragraph>
                    <Link href="/recept" passHref>
                        <Button label="Hitta ditt favoritrecept" variant="secondary" size="lg" />
                    </Link>
                </div>
            </section>

            {/* 2. Stats Section */}
            <StatsSection recipeCount={allRecipes.length} ratingCount={totalRatings} />

            {/* 3. Latest Recipes Section */}
            {latestRecipes.length > 0 && (
                <section className="bg-background py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <Header level={2} additionalClasses={['!font-display !text-3xl md:!text-4xl !font-bold !text-primary']}>
                                Färskt från Köket
                            </Header>
                             <Paragraph additionalClasses={['text-lg text-gray-600 mt-4 max-w-2xl mx-auto']}>
                                De allra senaste recepten, noggrant utprovade och redo att förgylla din påsk. Alltid med enkla steg och professionella tips.
                            </Paragraph>
                        </div>
                        <div className="flex flex-wrap -mx-3">
                            {latestRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Dynamic Categories Section */}
            <DynamicCategorySection categories={categories} />

            {/* 5. Top Rated Recipes Section */}
            {topRatedRecipes.length > 0 && (
                 <section className="bg-surface py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <Header level={2} additionalClasses={['!font-display !text-3xl md:!text-4xl !font-bold !text-primary']}>
                                Läsarnas Favoriter
                            </Header>
                             <Paragraph additionalClasses={['text-lg text-gray-600 mt-4 max-w-2xl mx-auto']}>
                                Dessa recept har fått högst betyg av hemmakockar precis som du. Upptäck de mest älskade godsakerna och se varför de har blivit favoriter.
                            </Paragraph>
                        </div>
                        <div className="flex flex-wrap -mx-3">
                            {topRatedRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. Guide Teaser Section */}
            <GuideTeaserSection />

            {/* 7. Testimonials */}
            <TestimonialSection />
            
            {/* 8. FAQ Section */}
            <FaqSection />

            {/* 9. Final Call to Action / About Teaser */}
            <section className="bg-primary text-white py-20 md:py-28">
                 <div className="max-w-3xl mx-auto text-center px-4">
                     <Image src="/images/stefan-lindberg-portrait.jpg" alt="Kocken Stefan Lindberg" width={120} height={120} className="rounded-full mx-auto mb-6 shadow-2xl border-4 border-white" />
                     <Header level={2} additionalClasses={['!font-display !text-3xl !font-bold !text-white']}>
                        Redo att börja?
                     </Header>
                     <Paragraph additionalClasses={['text-lg text-gray-300 leading-relaxed my-6']}>
                        Jag finns här för att guida dig. Utforska alla recept, läs mina guider, och tveka inte att ställa en fråga om du kör fast. Låt oss skapa något fantastiskt tillsammans!
                     </Paragraph>
                     <div className="flex justify-center items-center gap-4">
                        <Link href="/recept" passHref>
                           <Button label="Se alla recept" variant="secondary" />
                        </Link>
                         <Link href="/om-oss" passHref>
                           <Button label="Mer om mig" variant="primary" additionalClasses="bg-gray-600 hover:bg-gray-700" />
                        </Link>
                     </div>
                </div>
            </section>
        </Layout>
    );
};

// --- دالة جلب البيانات للصفحة (مُحسَّنة) ---
export async function getStaticProps() {
   const [recipesResponse, categoriesData, siteConfigData] = await Promise.all([
        getAllRecipes(),
        getCategoriesData(),
        getSiteConfigData()
    ]);

    const allRecipes = recipesResponse ? replaceUndefinedWithNull(recipesResponse.data) : [];
    
    // فرز الوصفات حسب تاريخ النشر (الأحدث أولاً)
    const sortedByDate = [...allRecipes].sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
    
    // فرز الوصفات حسب التقييم (الأعلى تقييمًا أولاً)
    const sortedByRating = [...allRecipes].sort((a, b) => {
        const ratingA = parseFloat(a.aggregateRating?.ratingValue || 0);
        const ratingB = parseFloat(b.aggregateRating?.ratingValue || 0);
        const countA = parseInt(a.aggregateRating?.ratingCount || 0);
        const countB = parseInt(b.aggregateRating?.ratingCount || 0);

        // إعطاء أولوية للتقييم، ثم لعدد التقييمات
        if (ratingB > ratingA) return 1;
        if (ratingA > ratingB) return -1;
        return countB - countA;
    });

    return {
        props: {
            // آخر 3 وصفات منشورة
            latestRecipes: sortedByDate.slice(0, 3),
            // أفضل 3 وصفات تقييمًا
            topRatedRecipes: sortedByRating.slice(0, 3),
            allRecipes,
            categories: categoriesData || [],
            siteConfig: siteConfigData || {},
        },
        revalidate: 60,
    };
}

export default HomePage;