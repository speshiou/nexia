export const escapeHtml = (unsafe: string) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export const webAppUrl = `${process.env.HOST}/webapp`
export const base64PngPrefix = "data:image/png;base64,"

export function dateStamp() {
    const today = new Date()
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns zero-based index
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
}