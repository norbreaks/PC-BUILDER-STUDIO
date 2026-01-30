// src/pages/CatalogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import PartCard from '../features/PartCard'; // Create this component later
import FilterSidebar from '../features/FilterSidebar'; // Create this component later
import { useBuild } from '../context/BuildContext';
import { useAuth } from '../context/AuthContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const CatalogPage = () => {
    const { currentBuild, isLoading: isBuildLoading } = useBuild(); // Use build state for context
    const { user, logout } = useAuth();
    const [parts, setParts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for filtering and pagination
    const [filters, setFilters] = useState({
        category: 'CPU', // Default to showing CPUs
        sort_by: 'price',
        sort_order: -1, // Descending price (most expensive first)
        limit: 20,
        skip: 0,
    });
    const [searchInput, setSearchInput] = useState('');

    // --- Data Fetching Logic ---

    // Function to fetch the available categories (CPU, GPU, etc.)
    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/parts/categories');
            setCategories(response.data.categories);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    // Function to fetch the PC parts based on current filters
    const fetchParts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Build the query string from the filters state object
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });
            const response = await apiClient.get(`/parts?${queryParams.toString()}`);
            setParts(response.data);
        } catch (err) {
            console.error("Failed to fetch parts:", err);
            setError(err.response?.data?.detail || 'Failed to load components.');
            setParts([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Dependency array: Re-run when filters change

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchParts();
    }, [fetchParts]);

    // Handler for updating filters from the sidebar
    const handleFilterChange = (newFilter) => {
        // Reset skip/page when category or sort changes
        setFilters(prev => ({
            ...prev,
            ...newFilter,
            skip: 0,
        }));
    };

    // Handler for search
    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            search: searchInput,
            skip: 0,
        }));
    };

    // Handler for category tab change
    const handleCategoryChange = (category) => {
        setFilters(prev => ({
            ...prev,
            category,
            skip: 0,
        }));
    };

    // Example handler for pagination (Next Page)
    const handleNextPage = () => {
        setFilters(prev => ({
            ...prev,
            skip: prev.skip + prev.limit,
        }));
    };

    return (
        <div className="min-h-screen relative">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.10]" />

            <div className="ui-container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
                    {/* Sidebar */}
                    <div className="lg:sticky lg:top-24">
                        <FilterSidebar categories={categories} currentFilters={filters} onFilterChange={handleFilterChange} />
                    </div>

                    {/* Main */}
                    <main className="min-w-0">
                        <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50">Catalog</h1>
                                <p className="ui-muted">Search, filter and add parts to your current build.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">Signed in as <span className="font-bold text-slate-100">{user?.username}</span></span>
                                <button onClick={logout} className="bg-red-500/90 text-white hover:bg-red-500 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">Logout</button>
                            </div>
                        </header>

                        {/* Search */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search parts by name, manufacturer, socket..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="ui-input pl-11"
                                    />
                                </div>
                                <button onClick={handleSearch} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl py-3">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 mb-6 overflow-x-auto">
                            <div className="flex gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all ${
                                            filters.category === cat
                                                ? 'bg-white/10 text-white border-white/15'
                                                : 'bg-transparent text-slate-300 border-transparent hover:bg-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-4 mb-4">
                            <h2 className="text-xl font-extrabold text-slate-50">
                                {filters.category ? `${filters.category} Catalog` : 'PC Parts Catalog'}
                            </h2>
                            <span className="text-xs ui-muted">Showing {parts.length} items</span>
                        </div>

                        {isLoading ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center text-slate-200">Loading components…</div>
                        ) : error ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center text-red-200">{error}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                {parts.map(part => (
                                    <PartCard key={part._id} part={part} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center mt-8 gap-3">
                            <button
                                onClick={() => handleFilterChange({ skip: Math.max(0, filters.skip - filters.limit) })}
                                disabled={filters.skip === 0}
                                className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={parts.length < filters.limit}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                            >
                                Next
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;
