export const setItem = (key, value) => {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
};

export const getItem = (key) => {
    const value = localStorage.getItem(key);

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

export const removeItem = (key) => {
    localStorage.removeItem(key);
};

export const clearStorage = () => {
    localStorage.clear();
};