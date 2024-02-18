export const escapeHtml = (unsafe: string) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export const webAppUrl = `${process.env.HOST}/webapp`
export const base64PngPrefix = "data:image/png;base64,"