# 🧠 Chatbot Architecture Design (Conversational Flow)

## 1. Core Philosophy: "Ask Before You Search"
Instead of blindly searching for every keyword, the Agent will act as an intelligent intermediary. It clarifies ambiguous requests to ensure high-precision results.

> **User**: "비 올 때 쓰는 거 찾아줘"
> **Bad Bot**: (Search '비', '쓰는 거') -> Irrelevant results.
> **Good Bot (Target)**: "비 올 때 쓰는 물건이라면 '우산'이나 '우비' 같은 것을 말씀하시는 건가요?"
> **User**: "응 우산"
> **Good Bot**: (Call Tool: `invention_search('우산')`) -> Precise results.

## 2. Updated 4-Node Structure

### Node 1: Chat Trigger
- **Role**: Receives user input from the UI.
- **Data**: Passes `{ message: string, history: Message[] }` to the Agent.

### Node 2: AI Agent (The Brain)
- **Model**: OpenAI GPT-4o (via Vercel AI SDK).
- **Duties**:
  1. **Analyze Context**: Look at the conversation history.
  2. **Decide Action**:
     - *Ambiguous?* -> Ask a clarifying question (No Tool).
     - *Clear?* -> Call `invention_search` Tool.
     - *Chitchat?* -> Just reply.
  3. **Synthesize**: When Tool returns data, summarize it naturally in Korean.

### Node 3: Tool (Supabase Edge Function)
- **Name**: `invention_search`
- **Input**: `{ keyword: string, filters?: { grade?: string, problem?: string } }`
- **Logic**:
  - Performs **Hybrid Search** (Keyword + Vector Similarity) on `inventions` table.
  - Returns `count`, `items[]` (Title, Summary, Image), and `stats` (Grade distribution).
- **Environment**: Independent Deno Runtime.

### Node 4: Window Buffer Memory
- **Implementation**: The `messages` array managed by Vercel AI SDK (`useChat` hook).
- **Capacity**: Last 10-20 turns to maintain context for follow-up questions.

---

## 3. Implementation Steps (Revised)

### Step 1: Tool Construction (The Hands)
- Build `supabase/functions/invention-search`.
- Ensure it accepts structured JSON and returns rich metadata (stats + items).

### Step 2: Agent Logic (The Brain)
- Configure `app/api/chat/route.ts` with Vercel AI SDK.
- **System Prompt Engineering**:
  ```text
  You are the intelligent helper of IdeaPrism.
  Your goal is to help students find invention ideas.
  
  [Rules]
  1. If the user's request is vague (e.g., "stuff for rain"), DO NOT search immediately.
     Ask: "Do you mean [Specific Keyword]?"
  2. Only call the 'invention_search' tool when the intent is clear.
  3. Always answer in friendly Korean.
  4. When showing results, summarize the stats first (e.g., "Total 5 items found.") and then list the top items.
  ```

### Step 3: UI Connection (The Face)
- Update `ChatWindow.tsx` to handle the streaming text and tool invocations seamlessly.
- Ensure the "Clarifying Question" from the bot looks like a normal message.
