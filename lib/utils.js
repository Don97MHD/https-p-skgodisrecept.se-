// lib/utils.js
export const getRecipePageLink = (pageNumber) => {
    const page = parseInt(pageNumber, 10);
    if (page <= 1) {
        return '/recept';
    }
    return `/recept/list/${page}`;
};