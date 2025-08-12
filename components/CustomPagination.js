// components/CustomPagination.js
import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

const CustomPagination = ({ currentPage, numPages, basePath = '/recept' }) => {
    const isFirst = currentPage === 1;
    const isLast = currentPage === numPages;
    const prevPage = basePath === '/recept' ? (currentPage - 1 === 1 ? '/recept' : `/recept/list/${currentPage - 1}`) : `/kategori/${basePath.split('/')[2]}/list/${currentPage - 1}`;
    const nextPage = `${basePath}/list/${currentPage + 1}`;

    if (numPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center items-center mt-12 md:mt-16 space-x-4">
            {!isFirst && (
                <Link href={prevPage}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface text-primary rounded-lg shadow-md hover:bg-gray-extra-light transition-colors cursor-pointer">
                        <ChevronLeftIcon className="h-5 w-5" />
                        <span>Föregående</span>
                    </div>
                </Link>
            )}

            <span className="text-sm font-semibold text-gray-700">
                Sida {currentPage} av {numPages}
            </span>

            {!isLast && (
                <Link href={nextPage}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface text-primary rounded-lg shadow-md hover:bg-gray-extra-light transition-colors cursor-pointer">
                        <span>Nästa</span>
                        <ChevronRightIcon className="h-5 w-5" />
                    </div>
                </Link>
            )}
        </div>
    );
};

export default CustomPagination;