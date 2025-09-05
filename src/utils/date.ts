export function starOfWeek(d = new Date(), weekStartsOn: 0 | 1 = 1 ) {
    const day = d.getDay(); // 0 to 6
    const diff = (day - weekStartsOn + 7) % 7;
    const res = new Date(d);
    res.setHours(0,0,0,0);
    res.setDate(res.getDate() - diff);
    return res;
}

export function addDays(date: Date, n:number) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

export function isoDateOnly(d: Date) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() +1).padStart(2, "0");
    const day = String(d.getUTCDay()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function sameYMD(a: string | null, b: string) {
    if (!a) return false;
    return a.slice(0, 10) === b;
}