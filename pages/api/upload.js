// pages/api/upload.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '../../lib/auth';

export const config = {
    api: {
        bodyParser: false,
    },
};

// 👇 تحديد المسار الجديد خارج مجلد public
const uploadDir = path.join(process.cwd(), 'uploads', 'recipes');

// التأكد من وجود المجلد عند بدء تشغيل الخادم
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const form = formidable({
        uploadDir: uploadDir,
        keepExtensions: true,
        filename: (name, ext, part) => {
            const sanitizedName = part.originalFilename.replace(/[\s&/\\?#|*<>:"']/g, '_');
            return `${Date.now()}_${sanitizedName}`;
        }
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ error: 'Error parsing the file upload.' });
        }

        const file = files.file?.[0];
        if (!file) {
            return res.status(400).json({ error: "No file uploaded." });
        }
        
        // 👇 الأهم: الرابط الذي نرجعه ليس مسارًا مباشرًا، بل هو رابط لواجهة API جديدة
        // سنقوم بإنشائها في الخطوة التالية. نحن نستخدم اسم الملف فقط.
        const fileName = path.basename(file.filepath);
        const publicUrl = `/api/images/${fileName}`;
        
        res.status(200).json({ url: publicUrl });
    });
}