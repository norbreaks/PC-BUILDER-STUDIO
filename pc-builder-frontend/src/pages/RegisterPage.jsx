import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient'; // Directly use the API client for registration
import { UserPlusIcon, AcademicCapIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState({ username: false, password: false, confirmPassword: false });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Note: The signup route is at /auth/signup (without the /api/v1 prefix)
            await apiClient.post('/auth/signup', { username, password }, {
                 baseURL: 'http://127.0.0.1:8000', // Override to hit the /auth prefix correctly
            });

            // Success: Redirect to login page
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            // Check for specific backend errors (e.g., username already exists)
            setError(err.response?.data?.detail || 'Registration failed. Please check details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />

            <div className="ui-container py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left: Brand panel */}
                    <div className="hidden lg:flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 overflow-hidden relative">
                        <div className="absolute -inset-10 bg-gradient-to-r from-green-500/10 to-indigo-500/15 blur-2xl" />
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 w-fit mb-5">
                                <UserPlusIcon className="h-4 w-4 text-green-300" />
                                Create a new account
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-50">
                                Save builds. Compare parts. <span className="text-gradient animate-gradient-shift">Ship</span> faster.
                            </h1>
                            <p className="mt-3 ui-muted max-w-md">
                                Register once and keep your builds across sessions. The AI chat will use your current build context.
                            </p>
                        </div>

                        <div className="relative mt-8 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <img src="/assets/storage/1.jpg" alt="Storage" className="h-36 w-full object-cover" />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <img src="/assets/gpu/3.jpg" alt="GPU" className="h-36 w-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 animate-fade-up">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-50">Create account</h2>
                                <p className="mt-1 ui-muted">
                                    Already have one?{' '}
                                    <Link to="/login" className="text-indigo-300 hover:text-indigo-200 font-semibold">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                <AcademicCapIcon className="h-4 w-4 text-indigo-300" />
                                PC Builder Studio
                            </span>
                        </div>

                        {/* Registration Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="reg-username" className="block text-sm font-medium text-slate-200 mb-2">Username</label>
                                <input
                                    id="reg-username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => setTouched({ ...touched, username: true })}
                                    className={`ui-input ${touched.username && username.length < 3 ? 'border-red-500/40 focus:ring-red-400/60' : ''}`}
                                    placeholder="Choose a username"
                                />
                                {touched.username && username.length < 3 && (
                                    <p className="mt-2 text-xs text-red-200">Username must be at least 3 characters.</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        id="reg-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, password: true })}
                                        className={`ui-input pr-12 ${touched.password && password.length < 6 ? 'border-red-500/40 focus:ring-red-400/60' : ''}`}
                                        placeholder="Create a password"
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

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-200 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                                        className={`ui-input pr-12 ${touched.confirmPassword && confirmPassword !== password ? 'border-red-500/40 focus:ring-red-400/60' : ''}`}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 px-3 inline-flex items-center text-slate-400 hover:text-slate-200"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {touched.confirmPassword && confirmPassword !== password && (
                                    <p className="mt-2 text-xs text-red-200">Passwords do not match.</p>
                                )}
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl py-3">
                                <UserPlusIcon className="h-5 w-5" />
                                {isSubmitting ? 'Registering...' : 'Create account'}
                            </button>

                            <p className="text-xs ui-muted">
                                Passwords are stored/validated by the backend (demo). Use a unique password in real projects.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
