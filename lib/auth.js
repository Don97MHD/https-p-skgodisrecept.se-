// lib/auth.js
import { ObjectId } from 'mongodb'; // قد نحتاجه لاحقًا

// هذا هو التوكن السري المستخدم. يجب أن يكون هو نفسه المستخدم في /api/auth.
export const ADMIN_TOKEN = 'BakatartaSecretAdminToken_For_Session_2025_XYZ';

export function verifyToken(req) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        console.error("API Auth Error: Missing Authorization header.");
        return false;
    }

    // يجب أن يكون التنسيق "Bearer [TOKEN]"
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.error("API Auth Error: Invalid token format.");
        return false;
    }

    const token = tokenParts[1];
    
    if (token !== ADMIN_TOKEN) {
        console.error("API Auth Error: Token mismatch.");
        return false;
    }
    
    return true;
}