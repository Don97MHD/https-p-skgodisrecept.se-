// pages/api/admin/pages.js
import fs from 'fs';
import path from 'path';

import { verifyToken } from '../../../lib/auth'; // <--- استيراد دالة التحقق الموحدة


const pageContentPath = path.join(process.cwd(), 'data', 'pageContent.json');

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const pageContent = JSON.parse(fs.readFileSync(pageContentPath, 'utf8'));
            res.status(200).json(pageContent);
        } catch (error) {
            res.status(500).json({ message: 'Kunde inte läsa sidinnehållsfilen.' });
        }
    } else if (req.method === 'POST') {
        try {
            const { pageKey, newContent } = req.body;
            if (!pageKey || !newContent) {
                return res.status(400).json({ message: 'Page key och nytt innehåll krävs.' });
            }

            const allContent = JSON.parse(fs.readFileSync(pageContentPath, 'utf8'));
            allContent[pageKey] = newContent;

            fs.writeFileSync(pageContentPath, JSON.stringify(allContent, null, 2));
            
            res.status(200).json({ message: `Sidan '${pageKey}' har uppdaterats!` });
        } catch (error) {
            res.status(500).json({ message: 'Fel vid uppdatering av sidinnehåll.', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Metod ${req.method} är inte tillåten`);
    }
}