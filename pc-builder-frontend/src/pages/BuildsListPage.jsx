import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { CpuChipIcon, PlusIcon } from '@heroicons/react/24/solid';

const BuildsListPage = () => {
    const { user } = useAuth();
    const [builds, setBuilds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBuilds = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/builds/active');
                setBuilds(response.data.builds || []);
            } catch (err) {
                console.error("Failed to fetch builds:", err);
                setError(err.response?.data?.detail || 'Failed to load builds.');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchBuilds();
        }
    }, [user]);

    if (!user) {
        return <div className="p-10 text-center ui-muted">Please log in to view your builds.</div>;
    }

    return (
        <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.10]" />

            <div className="ui-container py-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-50">My Builds</h1>
                        <p className="ui-muted">Resume an existing build or start a new one from the catalog.</p>
                    </div>
                    <Link to="/catalog" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">
                        <PlusIcon className="h-5 w-5" />
                        New build
                    </Link>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center text-slate-200">Loading builds…</div>
                ) : error ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center text-red-200">{error}</div>
                ) : builds.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center">
                        <CpuChipIcon className="h-14 w-14 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-200">No builds yet. Start building your dream PC.</p>
                        <Link to="/catalog" className="mt-5 inline-flex bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">
                            Go to catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {builds.map(build => (
                            <div key={build._id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:bg-white/8 transition-all">
                                <h3 className="text-lg font-extrabold text-slate-50 mb-2">{build.name}</h3>
                                <div className="flex items-center justify-between text-sm ui-muted">
                                    <span>Components</span>
                                    <span className="text-slate-200 font-semibold">{build.components.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm ui-muted mt-1">
                                    <span>Status</span>
                                    <span className="text-slate-200 font-semibold">{build.status}</span>
                                </div>

                                <Link to={`/build/${build._id}`} className="mt-4 w-full bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">
                                    View build
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildsListPage;
