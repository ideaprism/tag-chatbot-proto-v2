import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define grade names mapping
const GRADE_MAP: Record<number, string> = {
    1: '초등학교',
    2: '중학교',
    3: '고등학교',
    4: '일반',
    5: '대학교'
};

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();
    console.log('[Debug] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[Debug] Supabase Key (start):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));

    const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: `
      You are '지노(Zino)', a technical lead and invention search assistant.
      
      [Interaction Logic]
      1. If the user's intent to search is vague (e.g., "I have an idea about baseball"), do NOT call 'invention_search' immediately.
      2. Instead, ask for a specific search keyword (e.g., "야구 관련 아이디어를 어떤 키워드로 검색해볼까요? '글러브'로 검색하면 될까요?") and wait for the user to say "Yes" or confirm.
      3. ONLY call 'invention_search' when the search intent is clear or confirmed by the user.

      [Response Guidelines - After Search]
      1. ALWAYS follow this order in your response:
         - First, state the total count clearly: "총 [count]건의 검색 결과가 있습니다. ⚙️"
         - Mention a brief insight based on the 'stats' (e.g., degree of inventions in specific grades).
         - Say "상세 내용은 아래 카드를 확인해 보십시오."
      2. Do NOT list the invention titles or summaries in your text response (since they appear as cards).
      3. Maintain a logical, professional, yet helpful tone in Korean.
      4. If no results are found, suggest related keywords logically.
    `,
        messages,
        tools: {
            invention_search: tool({
                description: 'Search for inventions using a keyword. Returns a list of inventions and statistics.',
                parameters: z.object({
                    keyword: z.string(),
                }),
                execute: async ({ keyword }) => {
                    console.log(`[Tool] Searching for: ${keyword}`);

                    // Perform text search on simple_title and simple_summary
                    const { data, error, count } = await supabase
                        .from('inventions')
                        .select('id, simple_title, simple_summary, drawing_url, grade_id', { count: 'exact' })
                        .or(`simple_title.ilike.%${keyword}%,simple_summary.ilike.%${keyword}%`)
                        .limit(3); // Limited to 3 items as requested

                    if (error) {
                        console.error('[Tool] Supabase Error:', error);
                        return {
                            success: false,
                            error: 'Database search failed.'
                        };
                    }

                    // Calculate Stats (Optional but useful for summary)
                    const gradeStats: Record<string, number> = {};
                    data?.forEach((inv: any) => {
                        const gName = GRADE_MAP[inv.grade_id] || '기타';
                        gradeStats[gName] = (gradeStats[gName] || 0) + 1;
                    });

                    return {
                        success: true,
                        count: count || 0,
                        items: data,
                        stats: { grades: gradeStats }
                    };
                },
            }),
        },
        maxSteps: 5,
    });

    return result.toDataStreamResponse();
}
