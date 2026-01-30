// src/features/FilterSidebar.jsx (UPDATED)
import React from 'react';
import BuildSummary from './BuildSummary'; // NEW IMPORT
import { AdjustmentsHorizontalIcon, BarsArrowDownIcon, CpuChipIcon } from '@heroicons/react/24/solid';

const FilterSidebar = ({ categories, currentFilters, onFilterChange }) => {

    // Handler for category selection
    const handleCategoryChange = (e) => {
        onFilterChange({ category: e.target.value });
    };

    // Handler for sort selection
    const handleSortChange = (e) => {
        const [sort_by, sort_order] = e.target.value.split(':');
        onFilterChange({ sort_by, sort_order: parseInt(sort_order) });
    };

    return (
        <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6 flex flex-col gap-6">

            {/* --- Category Selector --- */}
            <div className="flex-shrink-0">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Component Category</h3>
                <select
                    onChange={handleCategoryChange}
                    value={currentFilters.category || ''}
                    className="ui-select"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* --- Sorting Selector --- */}
            <div className="flex-shrink-0">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Sort By</h3>
                <select
                    onChange={handleSortChange}
                    value={`${currentFilters.sort_by}:${currentFilters.sort_order}`}
                    className="ui-select"
                >
                    <option value="price:-1">Price: High to Low</option>
                    <option value="price:1">Price: Low to High</option>
                    <option value="name:1">Name: A to Z</option>
                </select>
            </div>

            {/* --- PC BUILD SUMMARY (Main Component) --- */}
            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-50 mb-3">Build Overview</h3>
                <BuildSummary /> {/* Renders the actual build data */}
            </div>

        </aside>
    );
};

export default FilterSidebar;
