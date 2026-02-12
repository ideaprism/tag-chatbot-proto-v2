'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Bot, RotateCcw, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyButton } from './CopyButton';
import { useChat } from '@ai-sdk/react';

// 발명품 타입 정의
interface Invention {
    id: number; // DB returns number
    simple_title: string;
    simple_summary: string;
    drawing_url?: string;
    grade_id?: number;
}

// 발명품 카드 컴포넌트
function InventionCard({ invention }: { invention: Invention }) {
    const gradeNames: Record<number, string> = {
        1: '초등학교', 2: '중학교', 3: '고등학교', 4: '일반', 5: '대학교'
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group w-full">
            {invention.drawing_url && (
                <div className="relative overflow-hidden rounded-md mb-2 bg-gray-50 aspect-video flex items-center justify-center">
                    <img
                        src={invention.drawing_url}
                        alt={invention.simple_title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                </div>
            )}
            <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {invention.simple_title}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {invention.simple_summary}
            </p>
            <div className="flex gap-1 flex-wrap">
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {gradeNames[invention.grade_id || 0] || '기타'}
                </span>
            </div>
        </div>
    );
}

// 메시지 컴포넌트
function ChatMessage({ message }: { message: any }) {
    const isUser = message.role === 'user';

    // 툴 호출 결과 확인
    const toolAttributes = message.toolInvocations?.map((toolInvocation: any) => {
        if (toolInvocation.toolName === 'invention_search' && toolInvocation.state === 'result') {
            return toolInvocation.result;
        }
        return null;
    }).filter(Boolean);

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {/* 아바타 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-green-100'
                    }`}>
                    {isUser ? (
                        <span className="text-white text-xs font-bold">ME</span>
                    ) : (
                        <Bot className="w-5 h-5 text-green-600" />
                    )}
                </div>

                {/* 메시지 내용 */}
                <div className="flex flex-col w-full">
                    {/* 텍스트 내용 */}
                    {message.content && (
                        <div className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm ${message.toolInvocations?.length ? 'mb-4' : 'mb-2'} ${isUser
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white text-zinc-900 border border-gray-100 rounded-2xl rounded-tl-sm font-medium'
                            }`}>
                            <div className={`whitespace-pre-wrap prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 dark:prose-invert ${!isUser ? 'prose-zinc prose-p:text-zinc-900 prose-strong:text-zinc-900' : ''}`}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-400" />,
                                        code: ({ node, ...props }) => <code {...props} className="bg-black/10 rounded px-1 py-0.5" />
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Tool Results (Invention Cards) */}
                    {!isUser && toolAttributes?.map((result: any, idx: number) => (
                        result.success && result.items?.length > 0 && (
                            <div key={idx} className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {result.items.map((inv: any) => (
                                    <InventionCard key={inv.id} invention={inv} />
                                ))}
                            </div>
                        )
                    ))}

                    {/* Tool Loading State */}
                    {!isUser && message.toolInvocations?.some((t: any) => t.state !== 'result') && (
                        <div className="text-xs text-gray-400 italic ml-2 mt-1">
                            검색 중입니다... 🔍
                        </div>
                    )}

                    {!isUser && message.content && (
                        <div className="flex gap-2 mt-1 ml-1">
                            <CopyButton content={message.content} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 메인 채팅 컴포넌트
export default function ChatWindow() {
    const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
        api: '/api/chat',
        initialMessages: []
    });

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: '안녕하세요! 👋\n무엇을 도와드릴까요? 발명품 검색이나 궁금한 점을 물어봐주세요.',
                }
            ]);
        }
    }, []);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 스크롤을 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [input]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleReset = () => {
        setMessages([
            {
                id: 'new-welcome-' + Date.now(),
                role: 'assistant',
                content: '대화가 초기화되었습니다. \n새로운 주제로 다시 이야기해볼까요? 😊',
            }
        ]);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">IdeaPrism Chatbot (V2 Proto)</h3>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleReset}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="대화 초기화"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-6">
                        <div className="flex flex-row gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border border-green-50">
                                <Bot className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSubmit} className="relative flex items-end bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-inner">
                    <textarea
                        ref={textareaRef}
                        value={input || ''}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="궁금한 내용을 입력하세요..."
                        className="flex-1 pl-4 pr-12 py-3 bg-transparent border-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none min-h-[50px] max-h-32"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!(input || '').trim() || isLoading}
                        className="absolute w-8 h-8 flex items-center justify-center rounded-lg transition-none"
                        style={{
                            bottom: '8px',
                            right: '8px',
                            backgroundColor: ((input || '').trim() && !isLoading) ? '#2563eb' : '#e5e7eb',
                            color: ((input || '').trim() && !isLoading) ? '#ffffff' : '#9ca3af',
                            cursor: ((input || '').trim() && !isLoading) ? 'pointer' : 'default',
                            border: 'none'
                        }}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
