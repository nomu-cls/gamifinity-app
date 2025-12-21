import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Compass, Shield, Calendar, ChevronRight } from 'lucide-react';

interface SessionBookingChatProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userEmail?: string;
    userId: string;
    createdAt: string;
    brainType?: string;
    onBookingComplete?: () => void;
}

type ChatStep = 'greeting' | 'name' | 'email' | 'concern' | 'date' | 'confirm' | 'handoff';

interface Message {
    id: string;
    sender: 'crew' | 'user' | 'system';
    crewType?: 'sora' | 'mamoru' | 'shin' | 'piku';
    text: string;
    buttons?: { label: string; value: string }[];
}

const crewImages: Record<string, string> = {
    sora: '/characters/sora.png',
    mamoru: '/characters/mamoru.png',
    shin: '/characters/shin.png',
    piku: '/characters/piku.png',
};

const crewNames: Record<string, string> = {
    sora: 'ソラ',
    mamoru: 'マモル',
    shin: 'シン',
    piku: 'ピク',
};

export const SessionBookingChat: React.FC<SessionBookingChatProps> = ({
    isOpen,
    onClose,
    userName: initialName,
    userEmail: initialEmail,
    userId,
    createdAt,
    brainType,
    onBookingComplete,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentStep, setCurrentStep] = useState<ChatStep>('greeting');
    const [inputValue, setInputValue] = useState('');
    const [collectedData, setCollectedData] = useState({
        name: initialName || '',
        email: initialEmail || '',
        concern: '',
        selectedDate: '',
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate pricing based on registration time
    const hoursSinceBoarding = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const isIgnitionWindow = hoursSinceBoarding <= 48;
    const isNormalFlight = hoursSinceBoarding > 48 && hoursSinceBoarding <= 504;
    const currentPrice = isIgnitionWindow ? 5500 : isNormalFlight ? 16500 : 33000;
    const remainingHours = Math.max(0, Math.floor(48 - hoursSinceBoarding));

    // Default crew based on brain type
    const defaultCrew = brainType === 'left_3d' ? 'sora' : brainType === 'right_3d' ? 'mamoru' : brainType === 'left_2d' ? 'shin' : 'piku';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addCrewMessage(defaultCrew,
                `コマンダー、お待ちしておりました！\n${crewNames[defaultCrew]}です。\n\n🧭 魂のコンパス・セッションの予約を進めますね。`
            );
            setTimeout(() => {
                addCrewMessage(defaultCrew,
                    isIgnitionWindow
                        ? `✨ 今なら48時間限定の特別価格 ¥5,500 と限定特典付きです！\n（残り約${remainingHours}時間）`
                        : `現在のお申込み価格は ¥${currentPrice.toLocaleString()} です。`
                );
                setTimeout(() => {
                    if (!collectedData.name) {
                        addCrewMessage(defaultCrew, 'まずはお名前を教えていただけますか？');
                        setCurrentStep('name');
                    } else {
                        addCrewMessage(defaultCrew, `${collectedData.name}さん、ご連絡用のメールアドレスを確認させてください。`);
                        setCurrentStep('email');
                    }
                }, 1000);
            }, 1500);
        }
    }, [isOpen]);

    const addCrewMessage = (crew: string, text: string, buttons?: { label: string; value: string }[]) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'crew',
            crewType: crew as any,
            text,
            buttons,
        }]);
    };

    const addUserMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'user',
            text,
        }]);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const value = inputValue.trim();
        addUserMessage(value);
        setInputValue('');

        switch (currentStep) {
            case 'name':
                setCollectedData(prev => ({ ...prev, name: value }));
                setTimeout(() => {
                    addCrewMessage(defaultCrew, `${value}さん、ありがとうございます！\n連絡用のメールアドレスを教えていただけますか？`);
                    setCurrentStep('email');
                }, 500);
                break;

            case 'email':
                setCollectedData(prev => ({ ...prev, email: value }));
                setTimeout(() => {
                    addCrewMessage(defaultCrew,
                        `ありがとうございます！\n\nセッションでは、${value.split('@')[0]}さんが現在感じている課題や、期待していることをお聞きします。\n\n今、一番解決したいことは何ですか？`
                    );
                    setCurrentStep('concern');
                }, 500);
                break;

            case 'concern':
                setCollectedData(prev => ({ ...prev, concern: value }));
                setTimeout(() => {
                    addCrewMessage('shin',
                        `承知しました！その想いを大切にセッションを進めますね。\n\n次に、ご希望の日程を選んでください。`,
                        [
                            { label: '日程をUTAGEで選択', value: 'utage' },
                        ]
                    );
                    setCurrentStep('date');
                }, 500);
                break;
        }
    };

    const handleButtonClick = (value: string) => {
        if (currentStep === 'date' && value === 'utage') {
            addUserMessage('日程を選択する');
            setCollectedData(prev => ({ ...prev, selectedDate: 'utage' }));
            setTimeout(() => {
                // Show Mamoru for payment handoff
                addCrewMessage('mamoru',
                    `コマンダー、ここからは安全管理スペシャリストの私の出番です。\n\n🛡️ クレジットカード情報は、暗号化された最新システムで厳重に保護されます。\n\n私が責任を持って、安全な決済端末へエスコートします。どうぞ、ご安心を。`
                );
                setTimeout(() => {
                    addCrewMessage('mamoru',
                        isIgnitionWindow
                            ? `✨ この価格（¥5,500）と限定特典を受け取れるのは残り約${remainingHours}時間です。\n\n準備ができたら、下のボタンで決済ページへ進んでください。`
                            : `現在のお申込み価格は ¥${currentPrice.toLocaleString()} です。\n\n準備ができたら、下のボタンで決済ページへ進んでください。`,
                        [{ label: '安全な決済ページへ進む', value: 'payment' }]
                    );
                    setCurrentStep('handoff');
                }, 1500);
            }, 500);
        } else if (currentStep === 'handoff' && value === 'payment') {
            // Generate UTAGE URL with parameters
            const utageUrl = `https://utg.creative-life.jp/event/A0UUIOaWyfje/register?name=${encodeURIComponent(collectedData.name)}&email=${encodeURIComponent(collectedData.email)}&uid=${encodeURIComponent(userId)}`;
            window.open(utageUrl, '_blank');
            onBookingComplete?.();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Compass className="text-white" size={24} />
                        <div>
                            <p className="text-white font-bold">魂のコンパス・セッション</p>
                            <p className="text-white/70 text-xs">ブリーフィング中...</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white p-2">
                        <X size={20} />
                    </button>
                </div>

                {/* Price Banner */}
                {isIgnitionWindow && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-center">
                        <p className="text-white text-sm font-bold">
                            ⏰ 48時間限定 ¥5,500（残り約{remainingHours}時間）
                        </p>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'crew' && msg.crewType && (
                                <img
                                    src={crewImages[msg.crewType]}
                                    alt={crewNames[msg.crewType]}
                                    className="w-10 h-10 rounded-full object-cover mr-2 border-2 border-white/20"
                                />
                            )}
                            <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-violet-600' : 'bg-white/10'} rounded-2xl px-4 py-3`}>
                                {msg.sender === 'crew' && msg.crewType && (
                                    <p className="text-[10px] text-amber-400 font-bold mb-1">{crewNames[msg.crewType]}</p>
                                )}
                                <p className="text-white text-sm whitespace-pre-line">{msg.text}</p>
                                {msg.buttons && (
                                    <div className="mt-3 space-y-2">
                                        {msg.buttons.map((btn) => (
                                            <button
                                                key={btn.value}
                                                onClick={() => handleButtonClick(btn.value)}
                                                className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                            >
                                                {btn.value === 'payment' && <Shield size={16} />}
                                                {btn.value === 'utage' && <Calendar size={16} />}
                                                {btn.label}
                                                <ChevronRight size={16} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {['name', 'email', 'concern'].includes(currentStep) && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <input
                                type={currentStep === 'email' ? 'email' : 'text'}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={
                                    currentStep === 'name' ? 'お名前を入力...' :
                                        currentStep === 'email' ? 'メールアドレスを入力...' :
                                            '悩みや期待を自由に入力...'
                                }
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                            />
                            <button
                                onClick={handleSend}
                                className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-500 transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionBookingChat;
