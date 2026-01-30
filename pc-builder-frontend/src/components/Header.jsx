import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { AcademicCapIcon, UserIcon, ArrowRightOnRectangleIcon, BoltIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useChat } from '../context/ChatContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { openChat } = useChat();
    const location = useLocation();

    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">
            <div className="ui-container">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-insetSoft">
                                <AcademicCapIcon className="h-6 w-6 text-indigo-300" />
                            </span>
                            <span>
                                PC <span className="text-gradient animate-gradient-shift">BUILDER</span> STUDIO
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="flex space-x-4 items-center">
                        {/* Option 1: Start Building/Go to Catalog */}
                        <Link
                            to={isAuthenticated ? "/catalog" : "/login"}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                        >
                            <BoltIcon className="h-5 w-5 mr-1" />
                            Start Building PC
                        </Link>

                        {/* Option 2: Access Chatbox (Placeholder) */}
                        <button
                            onClick={openChat}
                            className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                        >
                            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />
                            Compatibility Chat
                        </button>

                        {/* Conditional Auth Links */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/builds"
                                    className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                                >
                                    My Builds
                                </Link>
                                <Link
                                    to="/profile"
                                    className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                                >
                                    <UserIcon className="h-5 w-5 mr-1" />
                                    Profile
                                </Link>
                                <button
                                    onClick={logout}
                                    className="bg-red-500/90 text-white hover:bg-red-500 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Component for authenticated users */}
            {isAuthenticated && <Navigation />}
        </header>
    );
};

export default Header;
