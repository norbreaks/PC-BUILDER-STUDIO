// src/features/PartCard.jsx (Ensure this file is created)
import React, { useState } from 'react';
import { useBuild } from '../context/BuildContext';
import { CpuChipIcon, ComputerDesktopIcon, CircleStackIcon, ServerStackIcon, RectangleStackIcon, BoltIcon } from '@heroicons/react/24/solid';
import { getPartImageUrl } from '../utils/partAssets';

const PartCard = ({ part }) => {
    const { addComponent, removeComponent, currentBuild, isLoading } = useBuild();

    const [localError, setLocalError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    // Function to get category icon
    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'cpu':
                return CpuChipIcon;
            case 'motherboard':
                return ComputerDesktopIcon;
            case 'ram':
                return CircleStackIcon;
            case 'storage':
                return ServerStackIcon;
            case 'gpu':
                return RectangleStackIcon;
            case 'psu':
                return BoltIcon;
            default:
                return ComputerDesktopIcon;
        }
    };

    const CategoryIcon = getCategoryIcon(part.category);

    // Check if this part is currently in the build (important for single-instance parts like CPU, GPU)
    const isAlreadyInBuild = currentBuild?.components.some(item => item.part_id === part._id);

    const handleAdd = async () => {
        setLocalError(null);
        setIsAdding(true);

        // Call the central function which sends the data to the FastAPI backend
        const result = await addComponent(part._id, part.category);

        if (!result.success) {
            // Display the specific compatibility error message from the backend
            setLocalError(result.error);
        }
        setIsAdding(false);
    };

    const handleRemove = async () => {
        setLocalError(null);
        setIsRemoving(true);

        const result = await removeComponent(part._id);

        if (!result.success) {
            setLocalError(result.error);
        }
        setIsRemoving(false);
    };

    const imageUrl = getPartImageUrl(part);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 flex flex-col justify-between hover:bg-white/8 transition-all duration-200 hover:-translate-y-0.5">
            <div>
                <div className="flex items-center mb-3">
                    <div className="bg-white/5 p-2 rounded-xl mr-3 border border-white/10">
                        <CategoryIcon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">{part.category}</span>
                </div>

                <div className="relative w-full h-40 rounded-2xl mb-4 overflow-hidden border border-white/10 bg-white/5">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={part.name}
                            className="w-full h-full object-cover scale-[1.02]"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <CategoryIcon className="h-12 w-12 text-slate-500" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>

                <h3 className="text-base font-extrabold text-slate-50 mb-1 line-clamp-2">{part.name}</h3>
                <p className="text-sm ui-muted mb-2">{part.manufacturer}</p>
                <p className="text-2xl font-extrabold text-green-300 mb-4">₹{part.price.toFixed(2)}</p>

                <div className="space-y-2 text-sm">
                    {part.socket && (
                        <div className="flex justify-between">
                            <span className="ui-muted">Socket</span>
                            <span className="font-medium text-slate-100">{part.socket}</span>
                        </div>
                    )}
                    {part.ram_type && (
                        <div className="flex justify-between">
                            <span className="ui-muted">RAM Type</span>
                            <span className="font-medium text-slate-100">{part.ram_type}</span>
                        </div>
                    )}
                    {part.form_factor && (
                        <div className="flex justify-between">
                            <span className="ui-muted">Form Factor</span>
                            <span className="font-medium text-slate-100">{part.form_factor}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 space-y-2">
                {isAlreadyInBuild ? (
                    <button
                        onClick={handleRemove}
                        disabled={isRemoving || isLoading}
                        className="w-full bg-red-500/90 text-white hover:bg-red-500 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl py-3"
                    >
                        {isRemoving ? 'Removing...' : 'Remove from Build'}
                    </button>
                ) : (
                    <button
                        onClick={handleAdd}
                        disabled={isAdding || isLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl py-3"
                    >
                        {isAdding ? 'Adding...' : isLoading ? 'Preparing build...' : `Add ${part.category}`}
                    </button>
                )}

                {localError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-xs" role="alert">
                        {localError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartCard;
