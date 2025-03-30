export const randGen = (type) => {
    if (type === "string") {
        return Math.random().toString(36).substring(7);
    } else if (type === "int") {
        return Math.floor(Math.random() * 100000);
    }
    return null;
};
