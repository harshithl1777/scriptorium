export const generateEmptyStringObject = (keys: string[]): object => {
    return keys.reduce((o, key) => ({ ...o, [key]: '' }), {});
};
