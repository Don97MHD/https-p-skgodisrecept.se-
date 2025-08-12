// pages/kontakta-oss.js
import React from 'react';
import Layout from '../layouts/layout';
import { Header, Paragraph } from 'flotiq-components-react';
import { MailIcon, ChevronDownIcon, AnnotationIcon, BriefcaseIcon, HeartIcon } from '@heroicons/react/outline';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getPagesData, getCategoriesData, getSiteConfigData } from '../lib/data-fetchers';

// قسم مخصص للأسئلة الشائعة في صفحة التواصل
const ContactFaqSection = () => {
    const faqs = [
        { q: "Får jag använda dina bilder eller recept på min egen blogg?", a: "Tack för att du frågar! Allt innehåll är upphovsrättsskyddat. Om du vill dela ett recept, vänligen länka tillbaka till originalsidan istället för att kopiera innehållet. Bilder får inte användas utan skriftligt tillstånd." },
        { q: "Jag har testat ett recept men det fungerade inte, vad gjorde jag för fel?", a: "Vad tråkigt att höra! Det bästa sättet att få hjälp är att ställa din fråga direkt i kommentarsfältet under det specifika receptet. Då kan andra med samma fråga också se svaret." },
        { q: "Är du öppen för samarbeten med företag?", a: "Absolut! Om du representerar ett varumärke som passar min nisch och mina läsare, är du varmt välkommen att kontakta mig via e-post för att diskutera ett potentiellt samarbete." },
    ];
    return (
        <div className="bg-background py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Header level={2} additionalClasses={['!font-display !text-3xl !font-bold !text-primary']}>
                        Innan du skriver...
                    </Header>
                    <Paragraph additionalClasses={['mt-4 text-lg text-gray-600']}>
                        Här är svar på några vanliga frågor som kanske kan hjälpa dig direkt.
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


const ContactUsPage = ({ content, allRecipes, categories, siteConfig }) => {
    const email = "stefan@påskgodisrecept.se"; // <-- تحديث البريد الإلكتروني هنا

    if (!content) {
        return (
            <Layout allRecipesForSearch={allRecipes || []} categories={categories || [] }  siteConfig={siteConfig}>
                <div className="text-center py-20">
                    <p>Innehållet för den här sidan kunde inte laddas.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout 
            title={content.title} 
            description={content.meta_description} 
            allRecipesForSearch={allRecipes}
            categories={categories}
            siteConfig={siteConfig}
        >
            {/* --- قسم المقدمة --- */}
            <div className="bg-surface pt-16 md:pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Header level={1} additionalClasses={['!font-display !text-4xl md:!text-6xl !font-bold !text-primary']}>
                        {content.headline}
                    </Header>
                    <div className="mt-6 prose prose-xl max-w-none mx-auto text-gray-700"
                         dangerouslySetInnerHTML={{ __html: content.body }} />
                </div>
            </div>
            
            {/* --- قسم قنوات الاتصال --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-surface p-8 rounded-lg shadow-md">
                        <AnnotationIcon className="h-12 w-12 text-secondary mx-auto mb-4"/>
                        <h3 className="text-2xl font-bold font-display text-primary">Frågor om recept?</h3>
                        <p className="text-gray-600 mt-2">Det bästa stället att ställa frågor om ett specifikt recept är i kommentarsfältet under receptet. Då kan alla ta del av svaret!</p>
                    </div>
                     <div className="bg-surface p-8 rounded-lg shadow-md">
                        <BriefcaseIcon className="h-12 w-12 text-secondary mx-auto mb-4"/>
                        <h3 className="text-2xl font-bold font-display text-primary">Samarbeten & Press</h3>
                        <p className="text-gray-600 mt-2">För affärsförfrågningar, samarbeten eller press, vänligen kontakta mig direkt via e-post.</p>
                        <a href={`mailto:${email}`} className="text-secondary font-semibold mt-4 inline-block hover:underline">{email}</a>
                    </div>
                     <div className="bg-surface p-8 rounded-lg shadow-md">
                        <HeartIcon className="h-12 w-12 text-secondary mx-auto mb-4"/>
                        <h3 className="text-2xl font-bold font-display text-primary">Bara säga hej?</h3>
                        <p className="text-gray-600 mt-2">Följ mig gärna på sociala medier! Där delar jag med mig av tips, trix och en inblick bakom kulisserna.</p>
                        {/* يمكنك إضافة روابط وسائل التواصل هنا لاحقًا */}
                         <div className="flex justify-center space-x-4 mt-4">
                            <a href="#" className="text-gray-500 hover:text-secondary">Instagram</a>
                            <a href="#" className="text-gray-500 hover:text-secondary">Facebook</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- قسم الأسئلة الشائعة --- */}
            <ContactFaqSection />

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

    const contactPageContent = pagesData.find(p => p.key === 'contact') || null;

    if (!contactPageContent) {
        return { notFound: true };
    }

    return {
        props: {
            allRecipes: replaceUndefinedWithNull(allRecipesResponse?.data) || [],
            content: contactPageContent,
            categories: categoriesData || [],
            siteConfig: siteConfigData || {},
        },
        revalidate: 3600,
    };
}

export default ContactUsPage;