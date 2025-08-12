// components/CreamyDivider.js

import React from 'react';

const CreamyDivider = () => (
    // تم حذف text-primary لأن اللون سيتم التحكم به عبر التدرج اللوني
    <div className="w-full h-6 my-2" aria-hidden="true">
        <svg
            viewBox="0 0 100 10" // قمنا بتعديل viewBox قليلاً ليناسب الشكل الجديد
            preserveAspectRatio="none"
            className="w-full h-full"
        >
            {/* 
                بداية التعديل الرئيسي:
                1. <defs>: لتعريف التدرج اللوني.
                2. <linearGradient>: يحدد اتجاه ولون التدرج.
                3. <path>: يستخدم المسار الجديد لشكل أنصاف الدوائر ويطبق التدرج اللوني عليه.
            */}
            <defs>
                <linearGradient id="creamyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    {/* 
                        يبدأ التدرج من لون أفتح قليلاً من اللون الأساسي في الأعلى،
                        وينتهي باللون الأساسي الداكن في الأسفل، مما يعطي إحساساً بالعمق والظل.
                        اللون الأساسي هو #4A2C2A.
                    */}
                    <stop offset="0%" style={{ stopColor: '#6D4745', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4A2C2A', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            
            {/* 
                هذا المسار الجديد يرسم 5 أنصاف دوائر متتالية (scallops).
                A = أمر رسم القوس (Arc)
            */}
            <path 
                d="M 0 5 
                   A 10 5 0 0 1 20 5 
                   A 10 5 0 0 1 40 5 
                   A 10 5 0 0 1 60 5 
                   A 10 5 0 0 1 80 5 
                   A 10 5 0 0 1 100 5 
                   L 100 10 L 0 10 Z" 
                fill="url(#creamyGradient)" // تطبيق التدرج اللوني كـ "fill"
            />
            {/* نهاية التعديل الرئيسي */}
        </svg>
    </div>
);

export default CreamyDivider;