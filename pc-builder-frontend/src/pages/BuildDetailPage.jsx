// src/pages/BuildDetailPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBuild } from '../context/BuildContext';
import BuildDetailTable from '../features/BuildDetailTable';
import CompatibilityReport from '../features/CompatibilityReport';
import CheckoutComponent from '../components/CheckoutComponent';

const BuildDetailPage = () => {
    const { buildId } = useParams();
    const { buildDetails, fetchBuildDetails, removeComponent, isLoading: isBuildLoading } = useBuild();
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBuildDetails(buildId);
    }, [buildId, fetchBuildDetails]);

    const handleRemovePart = async (partId) => {
        const result = await removeComponent(partId);
        if (result.success) {
            fetchBuildDetails(buildId);
        } else {
            setError(result.error || 'Failed to remove component.');
        }
    };

    const totalPrice = useMemo(() => {
        if (!buildDetails?.parts) return 0;
        return buildDetails.parts.reduce((sum, part) => sum + part.price, 0);
    }, [buildDetails]);

    if (isBuildLoading) {
        return <div className="p-10 text-center text-xl">Loading PC Build Configuration...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
    }

    if (!buildDetails?.build) {
        return <div className="p-10 text-center text-gray-500">Build not found.</div>;
    }

    return (
        <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.10]" />

            <div className="ui-container py-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50">
                                {buildDetails.build.name || `PC Build #${buildId.slice(0, 6)}`}
                            </h1>
                            <p className="mt-2 text-sm ui-muted">Build ID: {buildId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
                                Live compatibility
                            </span>
                        </div>
                    </div>
                </div>

                <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 mb-6">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-extrabold text-slate-50">Compatibility status</h2>
                    </div>
                    <CompatibilityReport report={buildDetails.compatibility} />
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-extrabold text-slate-50">Selected components</h2>
                        <span className="text-xs ui-muted">{(buildDetails.parts || []).length} items</span>
                    </div>
                    <BuildDetailTable parts={buildDetails.parts || []} onRemove={handleRemovePart} />

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-solid p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="text-xs ui-muted">Grand total</div>
                            <div className="text-3xl font-extrabold text-green-300">₹{totalPrice.toFixed(2)}</div>
                        </div>
                        <CheckoutComponent buildId={buildId} totalPrice={totalPrice} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BuildDetailPage;
