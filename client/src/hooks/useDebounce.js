import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` milliseconds have elapsed since the last change.
 *
 * @param {*}      value - The value to debounce.
 * @param {number} delay - Debounce delay in milliseconds (default 300).
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
