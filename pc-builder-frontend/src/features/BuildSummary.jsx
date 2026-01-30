// src/features/BuildSummary.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBuild } from '../context/BuildContext';
import { getPartImageUrl } from '../utils/partAssets';

const BuildSummary = () => {
    const { currentBuild, buildDetails, fetchBuildDetails, isLoading: isBuildLoading } = useBuild();

    useEffect(() => {
        if (currentBuild?._id || currentBuild?.id) {
            fetchBuildDetails();
        }
    }, [currentBuild, fetchBuildDetails]);

    if (isBuildLoading) {
        return (
            <div className="text-center p-4 text-gray-500">
                Loading build...
            </div>
        );
    }

    const isEmpty = !buildDetails?.parts?.length;
    const totalPrice = buildDetails?.totals?.price || 0;
    const buildId = currentBuild?._id || currentBuild?.id;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-base font-bold text-slate-50 mb-1">
                {currentBuild?.name || 'New Build'}
            </h3>
            <p className="text-xs ui-muted mb-3">Your current selected components</p>

            {isEmpty ? (
                <p className="text-slate-300/80 italic">Start by adding a CPU or Motherboard.</p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {buildDetails.parts.map((part) => (
                        <div key={part._id} className="flex items-center justify-between text-sm text-slate-200">
                            <div className="flex items-center space-x-2 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                    {getPartImageUrl(part) ? (
                                        <img src={getPartImageUrl(part)} alt={part.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-slate-400 flex items-center justify-center h-full w-full">{part.category[0]}</span>
                                    )}
                                </div>
                                <span className="font-medium truncate">{part.name}</span>
                            </div>
                            <span className="text-green-300 font-semibold">₹{part.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="border-t border-white/10 mt-4 pt-3">
                <p className="flex justify-between text-lg font-extrabold text-slate-50">
                    <span>Est. Total:</span>
                    <span className="text-green-300">₹{totalPrice.toFixed(2)}</span>
                </p>
                <p className="text-xs ui-muted mt-1">* Based on catalog prices</p>
            </div>

            {!isEmpty && (
                <Link
                    to={`/build/${buildId}`}
                    className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl py-2"
                >
                    Review Build ({buildDetails?.totals?.count || buildDetails?.parts?.length} items)
                </Link>
            )}
        </div>
    );
};

export default BuildSummary;
