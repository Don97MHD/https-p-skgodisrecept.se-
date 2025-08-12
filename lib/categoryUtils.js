// lib/categoryUtils.js

export const categoryData = {
    // المفتاح هو 'marangtarta'
    marangtarta: {
        slug: 'marangtarta',
        filterTerm: 'marängtårta',
        name: 'Marängtårtor',
        headline: 'Marängtårtor – Den Stora Guiden',
        meta_description: 'Din kompletta guide till marängtårta! Hitta de bästa recepten för krispiga, sega och ljuvliga marängtårtor.',
        body: 'Välkommen till den ultimata guiden för alla som älskar marängtårta! Här reder vi ut begreppen och dyker djupt ner i älskade klassiker.'
    },
    // المفتاح هو 'tarta-i-langpanna'
    'tarta-i-langpanna': {
        slug: 'tarta-i-langpanna',
        filterTerm: 'långpannekaka',
        name: 'Tårtor i Långpanna',
        headline: 'Tårta i Långpanna: Din Guide till Kalasbak',
        meta_description: 'Hitta de bästa recepten på tårtor i långpanna. Perfekt när du ska baka till många för kalas, fest eller fika.',
        body: 'Att baka till många behöver inte vara krångligt! Långpannan är din bästa vän när det vankas kalas eller stort fika på jobbet.'
    },
    // المفتاح هو 'kladdkaka'
    kladdkaka: {
        slug: 'kladdkaka',
        filterTerm: 'kladdkaka',
        name: 'Kladdkakor',
        headline: 'Kladdkaka – Sveriges Kladdigaste Favorit',
        meta_description: 'Din kompletta guide till Kladdkaka! Upptäck klassiska recept och allt du behöver veta för att lyckas.',
        body: 'Välkommen till den ultimata guiden för alla kladdkakeälskare! Här har vi samlat allt du behöver veta om denna seglivade favorit.'
    },
    // المفتاح هو 'cheesecake'
    cheesecake: {
        slug: 'cheesecake',
        filterTerm: 'cheesecake',
        name: 'Cheesecakes',
        headline: 'Cheesecake – Krämig Perfektion',
        meta_description: 'Hitta de bästa recepten på cheesecake! Från klassisk New York style till no-bake varianter.',
        body: 'Välkommen till vår hyllning av en av världens mest älskade desserter – cheesecaken!'
    },
    // ----> هذا هو المفتاح المهم <----
    // المفتاح هو 'tartor-och-festkakor'
    'tartor-och-festkakor': {
        slug: 'tartor-och-festkakor',
        filterTerm: 'tårta',
        name: 'Tårtor & Festkakor',
        headline: 'Tårtor & Festkakor för Alla Tillfällen',
        meta_description: 'Här hittar du recept på klassiska tårtor och festkakor som passar perfekt till födelsedagar och firanden.',
        body: 'Från den ikoniska Prinsesstårtan till en saftig Morotskaka – här finns tårtorna som blir festens mittpunkt.'
    },
    // المفتاح هو 'bullar-och-fika'
    'bullar-och-fika': {
        slug: 'bullar-och-fika',
        filterTerm: 'fika',
        name: 'Bullar & Fika',
        headline: 'Klassiskt Svenskt Fikabröd',
        meta_description: 'Upptäck recepten på älskat svenskt fikabröd, från saftiga kanelbullar till enkla chokladbollar.',
        body: 'Inget säger fika som doften av hembakat! Här hittar du våra bästa recept på klassiskt kaffebröd.'
    }
};

// دالة مساعدة لإنشاء روابط الصفحات
export const getCategoryPageLink = (slug, pageNumber) => {
    const page = parseInt(pageNumber, 10);
    if (page <= 1) {
        return `/kategori/${slug}`;
    }
    return `/kategori/${slug}/list/${page}`;
};
