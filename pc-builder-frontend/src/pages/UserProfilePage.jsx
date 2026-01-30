import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const UserProfilePage = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return <div className="p-10 text-center ui-muted">Please log in to view your profile.</div>;
    }

    return (
        <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.10]" />

            <div className="ui-container py-8">
                <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-50">Profile</h1>
                            <p className="ui-muted">Account details for your PC Builder Studio session.</p>
                        </div>
                        <button onClick={logout} className="bg-red-500/90 text-white hover:bg-red-500 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">Logout</button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                    <UserIcon className="h-6 w-6 text-indigo-300" />
                                </span>
                                <div>
                                    <div className="text-xs ui-muted">Username</div>
                                    <div className="text-lg font-extrabold text-slate-50">{user.username}</div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                    <EnvelopeIcon className="h-6 w-6 text-purple-300" />
                                </span>
                                <div>
                                    <div className="text-xs ui-muted">Email</div>
                                    <div className="text-lg font-extrabold text-slate-50">{user.email || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
