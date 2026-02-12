# Chatbot Prototype Implementation Plan (Independent Environment)

## Project Goal
Implement a streamlined 4-node chatbot architecture (Trigger, Agent, Tool, Memory) within the `tag-chatbot-proto` environment to prototype invention search capabilities before porting to the main project.

## User Review Required
> [!IMPORTANT]
> This plan focuses on the `tag-chatbot-proto` directory. The main `ideaprism_sdg2` project will not be affected until the verification phase is complete.

## Proposed Changes

### Component: Environment Setup
#### [NEW] `tag-chatbot-proto/.env.local`
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are consistent with the main project.
- Add `OPENAI_API_KEY` for the Agent Node (if not already present/managed by Vercel AI SDK).

### Component: Supabase Edge Function (Tool Node)
#### [NEW] `supabase/functions/invention-search/index.ts`
- Implement a Deno-based Edge Function.
- Logic:
  - Accept `POST` request with `{ keyword: string }`.
  - Perform full-text search or ILIKE query on `inventions` table (and potentially `patents` table if needed).
  - Return a JSON object with:
    - `count`: Total number of results.
    - `items`: Top 5-10 matched items (Title, Summary, ID).
    - `statistics`: Simple aggregation (e.g., by grade or problem type) if possible.

### Component: Next.js AI Agent (Agent Node)
#### [NEW] `tag-chatbot-proto/app/api/chat/route.ts`
- Convert existing route to use **Vercel AI SDK** (`ai`, `@ai-sdk/openai`).
- **System Prompt**:
  - Role: Ideaprism Helper.
  - Tone: Korean, helpful, natural.
  - Tool Usage: Explicit instruction to use `invention_search` when the user asks for inventions.
- **Tools**:
  - `invention_search`: Defines the schema (zod) and the `execute` function that calls the Edge Function.
- **Memory**:
  - The `messages` array passed from the client will serve as the "Window Buffer Memory".
  - The `streamText` function automatically manages this context.

### Component: UI Integration (Chat Trigger)
#### [MODIFY] `tag-chatbot-proto/components/ChatWindow.tsx`
- Ensure the `useChat` hook (or custom fetch logic) correctly handles the streaming response from the new Agent.
- If the Agent returns structured data (e.g., a list of inventions), ensure the UI can render it as cards (using the existing `InventionCard` component).

## Verification Plan

### Automated Tests
- **Edge Function Test**:
  - Use `curl` or Postman to send a request to `invention-search` with a sample keyword.
  - Verify JSON response structure and data accuracy.

### Manual Verification
1. **Start the Prototype**:
   - Run `npm run dev` in `tag-chatbot-proto`.
2. **Access Web Interface**:
   - Open `http://localhost:3000`.
3. **Scenario 1: General Chat**
   - User: "안녕, 넌 누구니?"
   - Expected: Agent responds in Korean as "Ideaprism Helper".
4. **Scenario 2: Invention Search**
   - User: "우산 관련 발명품 찾아줘."
   - Expected:
     - Agent calls `invention_search` tool (visible in logs).
     - Edge Function returns data.
     - Agent answers: "우산 관련 발명품은 총 N건이 검색되었습니다. 대표적으로..." followed by a list or cards.
5. **Scenario 3: Context Memory**
   - User: "그 중에서 첫 번째 거 좀 더 자세히 말해줘."
   - Expected: Agent remembering previous search results and elaborating.
