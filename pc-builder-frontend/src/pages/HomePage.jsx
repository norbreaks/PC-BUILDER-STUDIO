import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { CpuChipIcon, ChatBubbleLeftRightIcon, UserIcon, ArrowRightOnRectangleIcon, AcademicCapIcon, BoltIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const HomePage = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { openChat } = useChat();
    const [featuredParts, setFeaturedParts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {

        // Simulate fetching featured parts (in a real app, this would be from API)
        const featured = [
            { category: "CPU", name: "AMD Ryzen 9 7950X3D", price: "₹49,717", image: "/assets/cpu/1.jpg" },
            { category: "GPU", name: "NVIDIA GeForce RTX 4090", price: "₹132,717", image: "/assets/gpu/2.jpg" },
            { category: "RAM", name: "G.Skill Trident Z5 RGB 32GB", price: "₹9,877", image: "/assets/ram/1.jpg" },
            { category: "Storage", name: "Samsung 990 Pro 2TB", price: "₹14,027", image: "/assets/storage/1.jpg" },
        ];
        setFeaturedParts(featured);
    }, []);

    const categories = [
        { name: "CPU", icon: CpuChipIcon, color: "text-red-500" },
        { name: "GPU", icon: CpuChipIcon, color: "text-green-500" }, // Use appropriate icon
        { name: "RAM", icon: CpuChipIcon, color: "text-blue-500" },
        { name: "Storage", icon: CpuChipIcon, color: "text-purple-500" },
        { name: "Motherboard", icon: CpuChipIcon, color: "text-yellow-500" },
        { name: "PowerSupply", icon: CpuChipIcon, color: "text-gray-500" },
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredParts.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredParts.length) % featuredParts.length);

    return (
        <div className="relative">
            {/* Background grid glow */}
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.18]" />

            {/* --- Hero Section --- */}
            <header className="relative overflow-hidden">
                <div className="ui-container py-16 sm:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="animate-fade-up">
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                    <BoltIcon className="h-4 w-4 text-indigo-300" />
                                    Real-time compatibility
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-300" />
                                    RAG AI assistant
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-purple-300" />
                                    Smart catalog search
                                </span>
                            </div>

                            <h1 className="ui-h1 text-slate-50">
                                Build a PC that <span className="text-gradient animate-gradient-shift">actually</span> fits.
                            </h1>
                            <p className="mt-5 text-base sm:text-lg ui-muted max-w-xl">
                                PC Builder Studio checks sockets, form-factors and power needs as you pick parts.
                                When you’re stuck, ask the AI assistant and keep building.
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to={isAuthenticated ? "/catalog" : "/login"}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
                                >
                                    Start building
                                    <ChevronRightIcon className="h-5 w-5" />
                                </Link>
                                <button onClick={openChat} className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">
                                    Ask the AI builder
                                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-10 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
                                    <div className="text-sm ui-muted">Checks</div>
                                    <div className="text-xl font-extrabold text-slate-50">Socket</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
                                    <div className="text-sm ui-muted">Validates</div>
                                    <div className="text-xl font-extrabold text-slate-50">Form-factor</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
                                    <div className="text-sm ui-muted">Estimates</div>
                                    <div className="text-xl font-extrabold text-slate-50">Wattage</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero imagery */}
                        <div className="relative lg:justify-self-end">
                            <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-r from-indigo-500/25 to-purple-500/25 blur-2xl" />
                            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                                <div className="relative grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-soft">
                                        <img src="/assets/gpu/2.jpg" alt="GPU" className="h-44 sm:h-56 w-full object-cover animate-fade-in" />
                                    </div>
                                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-soft">
                                        <img src="/assets/cpu/1.jpg" alt="CPU" className="h-44 sm:h-56 w-full object-cover animate-fade-in" />
                                    </div>
                                    <div className="col-span-2 rounded-2xl overflow-hidden border border-white/10 shadow-soft">
                                        <img src="/assets/ram/1.jpg" alt="RAM" className="h-44 sm:h-56 w-full object-cover animate-fade-in" />
                                    </div>
                                </div>

                                <div className="relative mt-5 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs ui-muted">Powered by</div>
                                        <div className="text-sm font-semibold text-slate-100">Compatibility + RAG</div>
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                        <span className="inline-block h-2 w-2 rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(34,197,94,0.18)]" />
                                        Live checks
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Categories --- */}
            <section className="ui-container py-10 sm:py-14">
                <div className="flex items-end justify-between gap-6 mb-6">
                    <div>
                        <h2 className="ui-h2 text-slate-50">Browse categories</h2>
                        <p className="ui-muted">Pick a component type and start adding to your build.</p>
                    </div>
                    <Link to={isAuthenticated ? "/catalog" : "/login"} className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl hidden sm:inline-flex">
                        Open catalog
                        <ChevronRightIcon className="h-5 w-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            to={isAuthenticated ? `/catalog?category=${cat.name}` : "/login"}
                            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 hover:bg-white/8 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                    <cat.icon className={`h-6 w-6 ${cat.color}`} />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-100 truncate">{cat.name}</div>
                                    <div className="text-xs ui-muted">Explore</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- Featured Parts Carousel --- */}
            {featuredParts.length > 0 && (
                <section className="ui-container pb-12">
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="ui-h2 text-slate-50">Featured picks</h2>
                                <p className="ui-muted">Handpicked parts to kickstart a strong build.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={prevSlide} className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl" aria-label="Previous">
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <button onClick={nextSlide} className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl" aria-label="Next">
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {featuredParts.map((part, index) => (
                                    <div key={index} className="w-full flex-shrink-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-6 sm:p-8">
                                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                                <img src={part.image} alt={part.name} className="w-full h-56 sm:h-72 object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 w-fit mb-3">{part.category}</span>
                                                <h3 className="text-2xl font-extrabold text-slate-50">{part.name}</h3>
                                                <p className="mt-3 text-3xl font-extrabold text-green-300">{part.price}</p>
                                                <div className="mt-6 flex gap-3">
                                                    <Link to={isAuthenticated ? "/catalog" : "/login"} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">
                                                        View in catalog
                                                        <ChevronRightIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button onClick={openChat} className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl">
                                                        Ask AI
                                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- Value props --- */}
            <section className="ui-container pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:bg-white/8 transition-all">
                        <ChatBubbleLeftRightIcon className="h-9 w-9 text-indigo-300" />
                        <h3 className="mt-3 text-lg font-bold text-slate-50">AI compatibility advice</h3>
                        <p className="mt-2 ui-muted">RAG answers grounded in your parts catalog and build state.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:bg-white/8 transition-all">
                        <UserIcon className="h-9 w-9 text-purple-300" />
                        <h3 className="mt-3 text-lg font-bold text-slate-50">Secure accounts</h3>
                        <p className="mt-2 ui-muted">Sign in to save builds and return anytime.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:bg-white/8 transition-all">
                        <CpuChipIcon className="h-9 w-9 text-green-300" />
                        <h3 className="mt-3 text-lg font-bold text-slate-50">Modern catalog UX</h3>
                        <p className="mt-2 ui-muted">Fast filtering, clear cards, and build overview in one place.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
