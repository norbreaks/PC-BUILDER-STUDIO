import React, { useState, useRef, useEffect } from 'react';
import { useBuild } from '../context/BuildContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { PaperAirplaneIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';

const RAGChat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const { currentBuild } = useBuild();
    const { isAuthenticated } = useAuth();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (!isAuthenticated) {
            const errorMessage = { role: 'assistant', content: 'Please log in to use the AI assistant.' };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            setIsTyping(true);
            const buildContext = currentBuild ? `Current build has ${currentBuild.components?.length || 0} parts.` : 'No build yet.';
            const response = await apiClient.post(
                '/ask',
                { question: `${input}\n\nBuild context: ${buildContext}` },
                { baseURL: 'http://127.0.0.1:8000' }
            );
            setIsTyping(false);
            const aiMessage = { role: 'assistant', content: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setIsTyping(false);
            const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please ensure the backend and Ollama are running and try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${isFullScreen ? 'p-0' : 'p-4'}`}>
            <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur flex flex-col transition-all duration-300 overflow-hidden ${isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[78vh] rounded-2xl'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center border border-white/10 shadow-glow">
                            <span className="text-white font-extrabold text-xs">AI</span>
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-50">PC Builder Assistant</h2>
                            <p className="text-xs ui-muted">Ask about compatibility, upgrades, and bottlenecks.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2"
                        >
                            {isFullScreen ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
                        </button>
                        <button onClick={onClose} className="bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/10">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-300/80 py-10">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-glow">
                                    <span className="text-white font-bold text-xl">⌁</span>
                                </div>
                                <h3 className="text-lg font-extrabold mb-2 text-slate-50">Welcome</h3>
                                <p className="text-sm ui-muted">Ask anything about PC building, compatibility or recommendations.</p>
                            </div>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] sm:max-w-lg px-4 py-3 rounded-2xl border shadow-soft ${
                                msg.role === 'user'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-white/10 rounded-br-sm'
                                    : 'bg-slate-950/30 text-slate-100 border-white/10 rounded-bl-sm'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-slate-950/30 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10 shadow-soft">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-slate-950/20">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask about compatibility, recommendations..."
                                className="ui-input pr-12"
                                disabled={isLoading}
                            />
                            {input.trim() && (
                                <button
                                    onClick={() => setInput('')}
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RAGChat;
