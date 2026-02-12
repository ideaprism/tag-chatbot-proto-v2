'use client';

import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center py-10 px-6 bg-white dark:bg-black">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TAG Chatbot Prototype</h1>
          <p className="text-gray-500">독립 개발 환경에서 챗봇 로직을 고도화합니다.</p>
        </div>

        <div className="relative w-full max-w-2xl h-[700px] border border-gray-200 rounded-2xl shadow-xl overflow-hidden bg-gray-50">
          {/* 여기서는 ChatWindow가 내부적으로 fixed 레이아웃이므로 
                독립 실행 환경에 맞게 내부 스타일을 조금 수정하거나 그대로 봅니다. */}
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}
