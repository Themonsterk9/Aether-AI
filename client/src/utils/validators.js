export const isEmail = (email = "") => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isPasswordValid = (password = "") => {
    return password.length >= 8;
};