// components/Footer.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = ({ siteConfig }) => {
    const siteTitle = siteConfig?.title || "Påskgodis Recept";

    return (
        <footer className="bg-surface border-t border-gray-extra-light">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    <div className="space-y-4 md:col-span-2">
                        <Link href="/" passHref>
                            <div className="cursor-pointer inline-block">
                                <Image
                                    src="/assets/paskgodis-logo.png"
                                    alt={`${siteTitle} Logotyp`}
                                    width={180}
                                    height={60}
                                />
                            </div>
                        </Link>
                        <p className="text-primary text-base max-w-sm">
                            Din guide till det perfekta påskgodiset. Recept och tekniker skapade med passion av kocken Stefan Lindberg.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Utforska</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link href="/recept"><div className="text-base text-gray-600 hover:text-secondary">Alla Recept</div></Link></li>
                            <li><Link href="/om-oss"><div className="text-base text-gray-600 hover:text-secondary">Om Stefan</div></Link></li>
                            <li><Link href="/kontakta-oss"><div className="text-base text-gray-600 hover:text-secondary">Kontakta Oss</div></Link></li>
                        </ul>
                    </div>
                    
                    {/* --- بداية التعديل الرئيسي --- */}
                    <div>
                        <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Information</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link href="/integritetspolicy"><div className="text-base text-gray-600 hover:text-secondary">Integritetspolicy</div></Link></li>
                            <li><Link href="/anvandarvillkor"><div className="text-base text-gray-600 hover:text-secondary">Användarvillkor</div></Link></li>
                        </ul>
                    </div>
                    {/* --- نهاية التعديل الرئيسي --- */}

                </div>

                <div className="mt-12 border-t border-gray-extra-light pt-8">
                    <p className="text-base text-gray-500 text-center">
                        © {new Date().getFullYear()} {siteTitle}. Alla rättigheter förbehållna.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;