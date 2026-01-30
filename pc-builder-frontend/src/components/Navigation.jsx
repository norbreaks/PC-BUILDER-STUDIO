import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CpuChipIcon, WrenchScrewdriverIcon, UserIcon } from '@heroicons/react/24/solid';

const Navigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: HomeIcon },
        { path: '/catalog', label: 'Catalog', icon: CpuChipIcon },
        { path: '/builds', label: 'My Builds', icon: WrenchScrewdriverIcon },
        { path: '/profile', label: 'Profile', icon: UserIcon },
    ];

    return (
        <nav className="border-b border-white/10 bg-slate-950/40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30">
            <div className="ui-container">
                <div className="flex justify-center">
                    <div className="flex gap-2 py-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 border ${
                                        isActive
                                            ? 'bg-white/8 text-white border-white/12 shadow-insetSoft'
                                            : 'bg-transparent text-slate-300 border-transparent hover:bg-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 mr-2" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
