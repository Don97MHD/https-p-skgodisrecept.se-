import fs from 'fs';
import path from 'path';

// هذه الدالة الآن موجودة في ملف منفصل خاص بالخادم
export const getTranslations = async () => {
    try {
        const siteConfigPath = path.join(process.cwd(), 'data', 'siteConfig.json');
        const translationsPath = path.join(process.cwd(), 'data', 'translations.json');

        const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
        const allTranslations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
        
        return {
            translations: allTranslations[siteConfig.language] || allTranslations['sv']
        };
    } catch (error) {
        console.error("Error reading translation files:", error);
        return { translations: {} };
    }
};