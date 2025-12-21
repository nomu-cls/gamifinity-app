import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Star, Code, ArrowRight } from 'lucide-react';
import { UserStory } from '../lib/supabase';

interface Props {
    story: UserStory;
    onClose: () => void;
}

const BoardingPass: React.FC<Props> = ({ story, onClose }) => {
    const [scanLine, setScanLine] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setScanLine(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const brainType = story.brain_type ? story.brain_type.toUpperCase().replace('_', ' ') : 'N/A';
    const isCommander = story.user_phase === 'commander';
    const seatNumber = isCommander ? "COCKPIT-01" : "SEAT-1A";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                    transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.5)] border border-blue-500/30 font-sans"
                >
                    {/* Holographic overlay effect */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                    {/* Scan line effect */}
                    {scanLine && (
                        <motion.div
                            initial={{ top: 0 }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 w-full h-1 bg-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,1)] z-10"
                        />
                    )}

                    {/* Header */}
                    <div className="relative p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-blue-400">
                            <Plane className="w-6 h-6 rotate-45" />
                            <span className="font-mono tracking-widest text-sm font-bold">GALACTIC PASS</span>
                        </div>
                        <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="relative p-8 space-y-8">
                        <div className="space-y-2">
                            <p className="text-blue-200/60 text-xs font-mono uppercase tracking-wider">Passenger</p>
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white"
                            >
                                {story.name || 'Dreamer'}
                            </motion.h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-blue-200/60 text-xs font-mono uppercase tracking-wider">Seat</p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-xl font-mono text-blue-400 font-bold tracking-widest"
                                >
                                    {seatNumber}
                                </motion.p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-200/60 text-xs font-mono uppercase tracking-wider">Status</p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.0 }}
                                    className="text-xl text-white font-bold"
                                >
                                    {isCommander ? 'COMMANDER' : 'FUTURIST'}
                                </motion.p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-end">
                                <div>
                                    {story.brain_type ? (
                                        <>
                                            <p className="text-blue-200/60 text-xs font-mono uppercase tracking-wider">Brain Type</p>
                                            <h3 className="text-lg font-bold text-white mt-1">{brainType}</h3>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-amber-400/80 text-xs font-mono uppercase tracking-wider">First Mission</p>
                                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 mt-1">
                                                DISCOVER YOUR TYPE
                                            </h3>
                                            <p className="text-[10px] text-white/50 mt-1">脳タイプ診断を完了しよう</p>
                                        </>
                                    )}
                                </div>
                                {story.brain_type ? (
                                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400/20" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full border-2 border-amber-400/50 border-dashed animate-spin" style={{ animationDuration: '8s' }} />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                            <div className="bg-white p-2 rounded-sm shadow-inner">
                                <Code className="w-16 h-16 text-black" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] text-gray-400 font-mono leading-tight">
                                    TICKET ID: {story.id ? story.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}<br />
                                    ISSUED: {new Date().toLocaleDateString()}
                                </p>
                                <p className="text-xs text-blue-300">Welcome Aboard. Your journey to your true self begins now.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="relative p-6 bg-black/40 border-t border-white/10 flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-full w-full flex items-center justify-center space-x-2 transition-colors relative overflow-hidden group"
                        >
                            <span className="relative z-10 tracking-widest text-lg">ENGAGE</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BoardingPass;
