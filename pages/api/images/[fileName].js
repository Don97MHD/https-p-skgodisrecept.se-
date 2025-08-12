// pages/api/images/[fileName].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const { fileName } = req.query;

    // بناء المسار الكامل للملف المطلوب داخل مجلد uploads
    const filePath = path.join(process.cwd(), 'uploads', 'recipes', fileName);

    // التحقق من وجود الملف لمنع أي محاولة للوصول إلى ملفات أخرى على الخادم
    if (fs.existsSync(filePath)) {
        // قراءة الملف كـ stream لتحسين الأداء مع الملفات الكبيرة
        const imageStream = fs.createReadStream(filePath);
        
        // تحديد نوع المحتوى بناءً على امتداد الملف
        const extension = path.extname(fileName).toLowerCase();
        let contentType = 'application/octet-stream'; // نوع افتراضي
        if (extension === '.jpg' || extension === '.jpeg') {
            contentType = 'image/jpeg';
        } else if (extension === '.png') {
            contentType = 'image/png';
        } else if (extension === '.gif') {
            contentType = 'image/gif';
        } else if (extension === '.webp') {
            contentType = 'image/webp';
        }

        res.setHeader('Content-Type', contentType);
        
        // إرسال الـ stream إلى الـ response
        imageStream.pipe(res);
    } else {
        // إذا لم يتم العثور على الملف، أرجع خطأ 404
        res.status(404).json({ message: 'Image not found.' });
    }
}