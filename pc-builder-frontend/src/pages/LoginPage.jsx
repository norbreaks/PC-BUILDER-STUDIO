import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon, AcademicCapIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState({ username: false, password: false });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setTouched({ username: true, password: true });

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters long.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the login function from AuthContext, which handles API call and token storage
            await login(username, password);
            navigate('/'); // Redirect to the home page upon success
        } catch (err) {
            // Display specific error detail from the backend (e.g., "Incorrect username or password")
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field === 'username') setUsername(value);
        if (field === 'password') setPassword(value);
        setTouched({ ...touched, [field]: true });
        if (error) setError(null); // Clear error on input change
    };

    return (
        <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />

            <div className="ui-container py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left: Brand panel */}
                    <div className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 overflow-hidden relative">
                        <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 blur-2xl" />
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 w-fit mb-5">
                                <AcademicCapIcon className="h-4 w-4 text-indigo-300" />
                                Welcome back
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-50">
                                Continue your <span className="text-gradient animate-gradient-shift">build</span>.
                            </h1>
                            <p className="mt-3 ui-muted max-w-md">
                                Sign in to access your catalog, saved builds, and the AI compatibility chat.
                            </p>
                        </div>

                        <div className="relative mt-8 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <img src="/assets/gpu/2.jpg" alt="GPU" className="h-28 w-full object-cover" />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <img src="/assets/cpu/1.jpg" alt="CPU" className="h-28 w-full object-cover" />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <img src="/assets/ram/1.jpg" alt="RAM" className="h-28 w-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 animate-fade-up">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-50">Sign in</h2>
                                <p className="mt-1 ui-muted">
                                    New here?{' '}
                                    <Link to="/register" className="text-indigo-300 hover:text-indigo-200 font-semibold">
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                <ArrowRightOnRectangleIcon className="h-4 w-4 text-green-300" />
                                Secure login
                            </span>
                        </div>

                        {/* Login Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className={`ui-input ${touched.username && username.length < 3 ? 'border-red-500/40 focus:ring-red-400/60' : ''}`}
                                    placeholder="Enter your username"
                                />
                                {touched.username && username.length < 3 && (
                                    <p className="mt-2 text-xs text-red-200">Username must be at least 3 characters.</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className={`ui-input pr-12 ${touched.password && password.length < 6 ? 'border-red-500/40 focus:ring-red-400/60' : ''}`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 inline-flex items-center text-slate-400 hover:text-slate-200"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {touched.password && password.length < 6 && (
                                    <p className="mt-2 text-xs text-red-200">Password must be at least 6 characters.</p>
                                )}
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl py-3">
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>

                            <p className="text-xs ui-muted">
                                By signing in you agree to basic usage terms for this demo app.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
