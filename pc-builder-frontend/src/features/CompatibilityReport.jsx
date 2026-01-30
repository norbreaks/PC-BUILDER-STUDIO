// src/features/CompatibilityReport.jsx
import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const iconMap = {
    success: { icon: CheckCircleIcon, color: 'text-green-300', bg: 'bg-green-500/10', border: 'border-green-500/25' },
    warning: { icon: ExclamationTriangleIcon, color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25' },
    error: { icon: XCircleIcon, color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/25' },
};

const CompatibilityReport = ({ report }) => {
    // Default to success if no report or issues exist
    const status = report?.status || 'success';
    const issues = report?.issues || [];

    const { icon: StatusIcon, color, bg, border } = iconMap[status] || iconMap.success;

    const getStatusText = (s) => {
        switch(s) {
            case 'success': return 'Compatibility Check Passed! ✅';
            case 'warning': return 'Potential Issues Found. Review Warnings. ⚠️';
            case 'error': return 'Critical Errors Detected. Fix Components! 🛑';
            default: return 'Status Unknown';
        }
    }

    return (
        <div className={`p-5 rounded-2xl border ${border} ${bg}`}>
            <div className="flex items-center space-x-3">
                <StatusIcon className={`h-8 w-8 ${color}`} />
                <h4 className={`text-lg sm:text-xl font-extrabold ${color}`}>{getStatusText(status)}</h4>
            </div>

            {issues.length > 0 && (
                <ul className="mt-4 space-y-3 pl-2">
                    {issues.map((issue, index) => (
                        <li key={index} className={`flex items-start text-sm ${issue.type === 'error' ? 'text-red-200 font-medium' : 'text-yellow-200'}`}>
                            {issue.type === 'error' ? (
                                <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-red-300 mt-0.5" />
                            ) : (
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-300 mt-0.5" />
                            )}
                            {issue.message}
                        </li>
                    ))}
                </ul>
            )}

            {status === 'success' && issues.length === 0 && (
                 <p className="mt-2 ui-muted">Your selected components are fully compatible based on current checks.</p>
            )}
        </div>
    );
};

export default CompatibilityReport;
