# Tag Chatbot Prototype Implementation Plan v2

## Project Goal
Implement a "Conversational Search Agent" that clarifies user intent before executing search tools.

## User Review Required
> [!IMPORTANT]
> The existing Edge Function code is missing from the workspace. This plan involves creating a **NEW** specific Edge Function (`invention-search`) optimized for this conversational flow.

## Proposed Changes (Prototype Environment)

### Component: New Edge Function (Tool)
#### [NEW] `supabase/functions/invention-search/index.ts`
- **Input**: `{ keyword: string }`
- **Logic**:
  - Uses `pgvector` or `text_search` to find relevant inventions.
  - Returns `count`, `items[]`, and `stats`.

### Component: Next.js AI Agent (Brain)
#### [NEW] `tag-chatbot-proto/app/api/chat/route.ts`
- **Tech**: Vercel AI SDK (`streamText`) + OpenAI.
- **System Prompt**:
  - "You are an intelligent assistant for IdeaPrism."
  - "If the user query is vague, ask for clarification first."
  - "Only call `invention_search` when the keyword is specific."
- **Tools**:
  - `invention_search`: Connects to the new Edge Function.

### Component: React UI (Interface)
#### [MODIFY] `tag-chatbot-proto/components/ChatWindow.tsx`
- Ensure `useChat` handles tool invocations properly.
- Verify that "Clarifying Questions" appear as natural text messages.
- Verify that "Search Results" are rendered as cards.

## Verification Scenarios
1. **Ambiguous Query**: "비 오는 날" -> Agent: "비 오는 날 쓸 물건을 찾으시나요?"
2. **Specific Query**: "우산" -> Agent: (Calls Tool) -> "우산 관련 발명품 5건을 찾았습니다."
3. **Context**: "그 중 첫 번째 거 설명해줘" -> Agent: (Remembering context) "첫 번째 발명품은..."
