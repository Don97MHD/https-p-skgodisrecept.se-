// lib/sanitize.js
// هذا الملف مهم لمنع أخطاء next.js serialization
function replaceUndefinedWithNull(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(replaceUndefinedWithNull);
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            value === undefined ? null : replaceUndefinedWithNull(value),
        ])
    );
}

export default replaceUndefinedWithNull;