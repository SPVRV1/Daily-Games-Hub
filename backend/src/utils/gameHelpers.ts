export const getTodayDate = (): string => {
    const d = new Date();
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth()).padStart(2, '0');
    const year = d.getUTCFullYear()
    return `${day}-${month}-${year}`
}