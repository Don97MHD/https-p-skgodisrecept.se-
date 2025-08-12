// tailwind.config.js

module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './layouts/**/*.{js,ts,jsx,tsx}',
        './templates/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            // --- بداية التعديل الرئيسي ---
            // هنا لوحة الألوان العصرية والجديدة
            colors: {
                primary: '#3D403D',       // أخضر زيتي عميق للنصوص والعناوين
                secondary: '#D97706',    // برتقالي محروق دافئ للأزرار والروابط
                background: '#F5F5DC', // بيج كريمي فاتح للخلفية العامة
                surface: '#FFFFFF',       // أبيض نقي لبطاقات الوصفات
                
                // ألوان مساعدة (يتم استخدامها في أماكن قليلة مثل الحدود)
                'surface-secondary': '#F0F0E1',
                'gray-extra-light': '#E7E6D7',
            },
            // --- نهاية التعديل الرئيسي ---
        },
        fontFamily: {
            display: ['var(--font-playfair)', 'serif'],
            body: ['var(--font-inter)', 'sans-serif'],
            cursive: ['var(--font-dancing)', 'cursive'],
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/line-clamp'),
    ],
};