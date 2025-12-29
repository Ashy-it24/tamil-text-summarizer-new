import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SummarizeRequest {
  text: string;
  ratio?: number;
}

function extractiveSummarize(text: string, ratio: number = 0.3): string {
  const sentences = text
    .split(/[.!?।]\s+/)
    .filter(s => s.trim().length > 10);
  
  if (sentences.length <= 3) {
    return text;
  }
  
  const wordFreq = new Map<string, number>();
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    if (word.length > 2) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });
  
  const sentenceScores = sentences.map(sentence => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const score = sentenceWords.reduce((sum, word) => {
      return sum + (wordFreq.get(word) || 0);
    }, 0) / sentenceWords.length;
    return { sentence, score };
  });
  
  sentenceScores.sort((a, b) => b.score - a.score);
  
  const numSentences = Math.max(2, Math.ceil(sentences.length * ratio));
  const topSentences = sentenceScores.slice(0, numSentences);
  
  const sentenceIndices = topSentences.map(item => sentences.indexOf(item.sentence));
  sentenceIndices.sort((a, b) => a - b);
  
  return sentenceIndices.map(idx => sentences[idx]).join('. ') + '.';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, ratio = 0.3 }: SummarizeRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const summary = extractiveSummarize(text, ratio);
    const wordCountOriginal = text.split(/\s+/).length;
    const wordCountSummary = summary.split(/\s+/).length;

    return new Response(
      JSON.stringify({
        summary,
        wordCountOriginal,
        wordCountSummary,
        compressionRatio: ((1 - wordCountSummary / wordCountOriginal) * 100).toFixed(1)
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});