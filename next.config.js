// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {

        dangerouslyAllowSVG: true,


    },

    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        return config;
    },
     async redirects() {
        return [
            {
                source: '/mockatryffel',
                destination: '/recept/mockatryffel',
                permanent: true,
            },
            {
                source: '/marsipanlimpa',
                destination: '/recept/marsipanlimpa',
                permanent: true,
            },
            {
                source: '/tryffel-med-mandel-och-vanilj',
                destination: '/recept/tryffel-med-mandel-och-vanilj',
                permanent: true,
            },
            {
                source: '/vit-chokladtryffel-med-lime',
                destination: '/recept/vit-chokladtryffel-med-lime',
                permanent: true,
            },
            {
                source: '/not-frukt-chokladbollar',
                destination: '/recept/not-frukt-chokladbollar',
                permanent: true,
            },
            {
                source: '/citronfudge',
                destination: '/recept/citronfudge',
                permanent: true,
            },
            {
                source: '/paskagg-arrak',
                destination: '/recept/paskagg-arrak',
                permanent: true,
            },
        ];
    },

};

module.exports = nextConfig;