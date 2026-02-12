# Tag Chatbot Prototype Tasks

- [x] **Environment Setup**
    - [x] Create Next.js Project (`tag-chatbot-proto`)
    - [x] Configure Tailwind CSS & Typography
    - [x] Install Dependencies (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `lucide-react`, etc.)
    - [x] Configure `.env.local` (Supabase, OpenAI)

- [x] **Supabase Edge Function**
    - [x] Create `invention-search` Function
    - [x] Implement Hybrid Search Logic (mocked/direct db query for prototype)
    - [x] Implement Stats Calculation

- [x] **AI Agent Implementation**
    - [x] Create `app/api/chat/route.ts`
    - [x] Configure Vercel AI SDK (`streamText`)
    - [x] Define System Prompt (Conversational Flow)
    - [x] Implement `invention_search` Tool

- [x] **UI Integration**
    - [x] Create/Update `ChatWindow.tsx`
    - [x] Implement `useChat` Hook
    - [x] Render Search Results (Cards)
    - [x] Handle Tool Invocations
    - [x] Fix UI Crashes (Input Safety)

- [ ] **Verification**
    - [x] Server Startup
    - [x] API Connectivity Check
    - [ ] Manual User Testing (Conversational Flow)
