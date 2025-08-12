// components/Breadcrumbs.js

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ChevronRightIcon } from '@heroicons/react/solid';

const Breadcrumbs = ({ crumbs }) => {
    if (!crumbs || crumbs.length === 0) {
        return null;
    }

    // إنشاء Schema JSON-LD للـ Breadcrumbs
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': crumb.name,
            'item': crumb.url
        }))
    };

    return (
        <>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>
            <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <ol className="flex items-center space-x-2 text-sm">
                    {crumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
                            )}
                            <Link href={crumb.url} passHref>
                                <div className={`font-medium ${index === crumbs.length - 1 ? 'text-gray-500' : 'text-primary hover:text-secondary'}`}>
                                    {crumb.name}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumbs;