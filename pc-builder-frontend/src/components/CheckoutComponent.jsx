
// src/components/CheckoutComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const CheckoutComponent = ({ buildId, totalPrice }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const displayRazorpay = async () => {
        setIsProcessing(true);
        setError('');

        try {
            // 1. CALL FASTAPI TO CREATE RAZORPAY ORDER
            const response = await axios.post(`http://127.0.0.1:8000/payment/create-order/${buildId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const orderData = response.data;

            // 2. CONFIGURE CHECKOUT OPTIONS
            const options = {
                key: orderData.key_id,
                amount: orderData.amount, // Amount in paise
                currency: orderData.currency,
                name: orderData.name,
                order_id: orderData.order_id,
                description: `PC Build Payment - Build ID: ${buildId}`,
                handler: async (paymentResponse) => {
                    // This runs on successful payment and sends verification details to your backend
                    const verificationPayload = {
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_signature: paymentResponse.razorpay_signature,
                        build_id: buildId // Pass this for database lookup on your server
                    };

                    try {
                        // 3. CALL FASTAPI TO VERIFY PAYMENT SIGNATURE
                        const verificationResponse = await axios.post('http://127.0.0.1:8000/payment/verify-payment', verificationPayload, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                            }
                        });

                        // Success - redirect to success page with payment details
                        const successUrl = `/payment-success?buildId=${buildId}&payment_id=${paymentResponse.razorpay_payment_id}&order_id=${paymentResponse.razorpay_order_id}`;
                        window.location.href = successUrl;
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        setError('Payment verification failed. Please contact support if amount was deducted.');
                        alert("Payment failed verification. Please contact support.");
                    }
                },
                prefill: {
                    // Prefill with user's stored data
                    email: orderData.email,
                    contact: orderData.contact,
                },
                notes: {
                    build_id: buildId,
                    user_email: orderData.email
                },
                theme: {
                    color: "#6366f1", // Indigo color
                    background: "#0f172a",
                    hide_topbar: false
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                        console.log('Payment modal closed');
                    }
                }
            };

            // 4. OPEN THE RAZORPAY POPUP
            const paymentObject = new window.Razorpay(options);
            
            paymentObject.on('payment.failed', function (response) {
                console.error('Payment failed:', response);
                setError('Payment was cancelled or failed. Please try again.');
                setIsProcessing(false);
            });

            paymentObject.open();
        } catch (error) {
            console.error('Payment initiation error:', error);
            setError('Failed to initiate payment. Please check your connection and try again.');
            alert("Failed to initiate payment. Please try again.");
        } finally {
            // Don't set isProcessing to false here as the payment modal might still be open
            // It will be set to false when modal is dismissed or payment completes
        }
    };

    return (
        <div className="mt-6">
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Payment Info */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-slate-100">Secure Payment</span>
                </div>
                <p className="text-xs text-slate-400">
                    Your payment is processed securely by Razorpay. We don't store your card details.
                </p>
            </div>

            {/* Payment Button */}
            <button
                onClick={displayRazorpay}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-6 py-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3"
            >
                {isProcessing ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <CreditCardIcon className="w-5 h-5" />
                        Pay ₹{totalPrice.toFixed(2)} Securely
                    </>
                )}
            </button>

            {/* Test Payment Info for Development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-400 font-medium mb-1">Test Payment Details:</p>
                    <p className="text-xs text-slate-400">
                        Card: 4111 1111 1111 1111 | Exp: 12/25 | CVV: 123 | OTP: 123456
                    </p>
                </div>
            )}
        </div>
    );
};

export default CheckoutComponent;
