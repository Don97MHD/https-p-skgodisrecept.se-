// components/SearchWidget.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SearchIcon } from '@heroicons/react/outline';

const SearchWidget = ({ allRecipesData, placeholder = "Sök recept..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = allRecipesData.filter(recipe => 
            (recipe.name && recipe.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (recipe.description && recipe.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (recipe.keywords && recipe.keywords.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (recipe.ingredients && recipe.ingredients.some(ing => ing.product && ing.product.toLowerCase().includes(lowerCaseSearchTerm)))
        );
        setSearchResults(filtered.slice(0, 5));
    }, [searchTerm, allRecipesData]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleResultClick = (slug) => {
        setSearchTerm('');
        setSearchResults([]);
        setIsFocused(false);
        router.push(`/recept/${slug}`);
    };
    
    const handleSearchSubmit = (e) => {
        // إذا كان الاستدعاء من حدث فأرة، نمنع السلوك الافتراضي
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (searchTerm.trim()) {
            router.push(`/sok?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setSearchResults([]);
            setIsFocused(false);
        }
    };

    return (
        <div className="relative w-full md:max-w-md">
            <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-secondary focus:border-secondary sm:text-sm"
                        placeholder={placeholder}
                        type="search"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        // التأخير البسيط هنا مهم لإعطاء الوقت الكافي للنقرة
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)} 
                        autoComplete="off"
                    />
                </div>
            </form>

            {isFocused && searchTerm && searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((recipe) => (
                        <li
                            key={recipe.id}
                            // --- بداية التعديل الرئيسي ---
                            // استبدال onClick بـ onMouseDown
                            onMouseDown={() => handleResultClick(recipe.slug)}
                            // --- نهاية التعديل الرئيسي ---
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                        >
                            {recipe.name}
                        </li>
                    ))}
                     {searchResults.length > 0 && (
                        <li
                            // --- بداية التعديل الرئيسي ---
                            // استبدال onClick بـ onMouseDown
                            onMouseDown={handleSearchSubmit}
                            // --- نهاية التعديل الرئيسي ---
                            className="px-4 py-3 text-center bg-gray-50 hover:bg-gray-200 cursor-pointer text-sm font-semibold text-secondary"
                        >
                            Visa alla resultat för "{searchTerm}"
                        </li>
                    )}
                </ul>
            )}
            {isFocused && searchTerm && searchResults.length === 0 && (
                 <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg p-4 text-sm text-gray-500">
                    Inga direkta träffar. Prova en bredare sökning.
                </div>
            )}
        </div>
    );
};

export default SearchWidget;