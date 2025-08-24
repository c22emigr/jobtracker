"use client";
import { useEffect, useState } from "react";


export function useDebounceValue<T>(value: T, delay = 200) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return() => clearTimeout(t);
    }, [value, delay]);
    
    return debounced;
}