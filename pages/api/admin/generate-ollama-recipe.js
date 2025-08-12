// pages/api/admin/generate-ollama-recipe.js

const verifyToken = (req) => req.headers.authorization?.split(' ')[1] === 'fake-secure-token';

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { messages, aiApiUrl } = req.body;

    if (!messages || !aiApiUrl) {
        return res.status(400).json({ message: 'AI API URL och meddelanden krävs.' });
    }

    try {
        const response = await fetch(`${aiApiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama3", // أو أي موديل آخر تستخدمه
                messages: messages,
                stream: false,
                format: "json", // هام جداً لضمان الحصول على JSON
            }),
            // قد تحتاج إلى زيادة المهلة للطلبات الطويلة
            // signal: AbortSignal.timeout(60000) // 60 ثانية
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Ollama server error:", errorBody);
            throw new Error(`Ollama server fel: ${response.status}`);
        }

        const data = await response.json();
        
        // استخراج محتوى JSON من الرد
        const jsonContent = JSON.parse(data.message.content);

        res.status(200).json(jsonContent);

    } catch (error) {
        console.error("Error communicating with Ollama server:", error);
        res.status(500).json({ message: "Misslyckades med att generera recept från din AI-server.", details: error.message });
    }
}