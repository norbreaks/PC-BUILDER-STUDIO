// src/features/BuildDetailTable.jsx
import React from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { getPartImageUrl } from '../utils/partAssets';

const BuildDetailTable = ({ parts, onRemove }) => {
    return (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Part
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Component Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Key Spec
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Price
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Remove</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-slate-950/20 divide-y divide-white/10">
                    {parts.map((part) => (
                        <tr key={part._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                    {getPartImageUrl(part) ? (
                                        <img src={getPartImageUrl(part)} alt={part.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-slate-400">{part.category[0]}</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-300">
                                {part.category}
                            </td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-slate-100">
                                {part.name}
                            </td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-slate-300/80">
                                {/* Display a relevant spec for quick identification */}
                                {part.socket || part.ram_type || part.form_factor || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-300 text-right">
                                ₹{part.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onRemove(part._id)}
                                    className="text-red-200 hover:text-white transition-colors p-2 rounded-xl hover:bg-red-500/20"
                                    title={`Remove ${part.name}`}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BuildDetailTable;
