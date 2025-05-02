export function formatNumber(value: string) {
    const num = value.replace(/\D/g, "") // remove non-digits
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}