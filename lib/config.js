// lib/config.js
const config = {
    siteMetadata: {
        title: 'bakatårta.se',
        description: 'Din guide till den perfekta kakan. Beprövade recept på svenska klassiker av Elsa Lundström.',
        siteUrl: 'https://bakatarta.se', // هام: استخدم نطاقك الفعلي عند النشر
    },
    blog: {
        postPerPage: 9, // عدد الوصفات التي تظهر في كل صفحة قائمة
    },
    author: { // لـ Schema.org
        "@type": "Person",
        "name": "Elsa Lundström",
        "url": "https://bakatarta.se/om-oss"
    }
};
export default config;