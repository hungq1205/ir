export const CATEGORIES = [
    'All',
    'Tin tức', 
    'Thời sự', 
    'Giao thông', 
    'Dân sinh', 
    'Chính trị', 
    'Việc làm', 
    'Đầu tư', 
    'Khám phá', 
    'Quỹ Hy vọng', 
    'Nông nghiệp',
] as const;

export function toUnicodeEscape(val: string) {
    return val.replace(/[\s\S]/g, (char) => {
        const code = char.charCodeAt(0);
        return code > 127 ? '\\u' + code.toString(16).padStart(4, '0') : char;
    });
}