export function normalizePersianDigits(input: string): string {
    if (!input) return input;

    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

    return input
        .split('')
        .map(ch => {
            const persianIndex = persianDigits.indexOf(ch);
            if (persianIndex !== -1) return persianIndex.toString();

            const arabicIndex = arabicDigits.indexOf(ch);
            if (arabicIndex !== -1) return arabicIndex.toString();

            return ch;
        })
        .join('');
}