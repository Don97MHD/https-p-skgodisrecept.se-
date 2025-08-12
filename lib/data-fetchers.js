// lib/data-fetchers.js
import replaceUndefinedWithNull from './sanitize';
import fs from 'fs';
import path from 'path';

// لا نستدعي mongodb هنا في الأعلى

// --- دوال الصفحات والتصنيفات (تعديل طفيف) ---
export async function getPagesData() {
    // استيراد ديناميكي عند الحاجة
    const { connectToDatabase } = await import('./mongodb.js');
    const { db } = await connectToDatabase();
    const data = await db.collection('pages').find({}).toArray();
    return replaceUndefinedWithNull(JSON.parse(JSON.stringify(data)));
}

export async function getCategoriesData() {
    // استيراد ديناميكي عند الحاجة
    const { connectToDatabase } = await import('./mongodb.js');
    const { db } = await connectToDatabase();
    const data = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    // تحويل البيانات لضمان عدم وجود أنواع بيانات غير صالحة
    return replaceUndefinedWithNull(JSON.parse(JSON.stringify(data)));
}


// --- الدالة المحدثة لجلب إعدادات الموقع (تعديل طفيف) ---
export async function getSiteConfigData() {
    const defaultConfigPath = path.join(process.cwd(), 'data', 'siteConfig.json');
    const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));

    let dbConfig = {};
    try {
        // استيراد ديناميكي عند الحاجة
        const { connectToDatabase } = await import('./mongodb.js');
        const { db } = await connectToDatabase();
        const dataFromDb = await db.collection('settings').findOne({ key: "main_settings" });
        if (dataFromDb) {
            dbConfig = dataFromDb;
        }
    } catch (error) {
        console.error("Could not fetch settings from DB, using local defaults. Error:", error);
    }

    const finalConfig = JSON.parse(JSON.stringify({
        ...defaultConfig,
        ...dbConfig
    }));
    
    return replaceUndefinedWithNull(finalConfig);
}