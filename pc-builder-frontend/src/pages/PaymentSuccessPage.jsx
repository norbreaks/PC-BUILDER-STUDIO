
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ArrowLeftIcon, EyeIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/solid';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const [buildDetails, setBuildDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const buildId = searchParams.get('buildId');
    const paymentId = searchParams.get('payment_id');
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        // Simulate fetching build details (in real app, this would be an API call)
        const fetchBuildDetails = async () => {
            try {
                // For demo purposes, we'll create mock build details
                // In production, you'd fetch this from your backend
                const mockBuildDetails = {
                    name: "Gaming PC Build",
                    price: 45000,
                    components: 8,
                    orderId: orderId || 'order_mock123',
                    paymentId: paymentId || 'pay_mock456',
                    date: new Date().toLocaleDateString()
                };
                
                setTimeout(() => {
                    setBuildDetails(mockBuildDetails);
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error('Error fetching build details:', error);
                setLoading(false);
            }
        };

        if (buildId) {
            fetchBuildDetails();
        } else {
            setLoading(false);
        }
    }, [buildId, orderId, paymentId]);

    if (loading) {
        return (
            <div className="ui-container py-16">
                <div className="max-w-md mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="text-slate-400 mt-4">Loading payment details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ui-container py-16">
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="ui-h1 text-slate-50 mb-2">Payment Successful!</h1>
                    <p className="ui-muted">
                        Your PC build has been finalized and payment has been processed successfully.
                    </p>
                </div>

                {/* Payment Details Card */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5" />
                        Payment Details
                    </h2>
                    
                    {buildDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm ui-muted">Build Name</p>
                                    <p className="text-slate-100 font-medium">{buildDetails.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm ui-muted">Total Amount</p>
                                    <p className="text-slate-100 font-medium">₹{buildDetails.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm ui-muted">Components</p>
                                    <p className="text-slate-100 font-medium">{buildDetails.components} items</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm ui-muted">Order ID</p>
                                    <p className="text-slate-100 font-mono text-sm">{buildDetails.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-sm ui-muted">Payment ID</p>
                                    <p className="text-slate-100 font-mono text-sm">{buildDetails.paymentId}</p>
                                </div>
                                <div>
                                    <p className="text-sm ui-muted">Payment Date</p>
                                    <p className="text-slate-100 font-medium flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        {buildDetails.date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {buildId && (
                        <Link
                            to={`/build/${buildId}`}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 inline-flex items-center justify-center gap-2"
                        >
                            <EyeIcon className="w-5 h-5" />
                            View Your Build
                        </Link>
                    )}
                    <Link
                        to="/builds"
                        className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 inline-flex items-center justify-center gap-2"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to My Builds
                    </Link>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Your PC build order has been confirmed and sent to our assembly team</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>You'll receive email updates about your build progress</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Estimated assembly time: 3-5 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Track your order status in your account dashboard</span>
                        </li>
                    </ul>
                </div>

                {/* Support Info */}
                <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-center">
                    <p className="text-sm ui-muted">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@pcbuilder.com" className="text-indigo-400 hover:text-indigo-300">
                            support@pcbuilder.com
                        </a>
                        {' '}or call{' '}
                        <a href="tel:+911234567890" className="text-indigo-400 hover:text-indigo-300">
                            +91 123-456-7890
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
