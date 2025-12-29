import { useState, useEffect } from 'react';
import { FileText, Languages, Volume2, Loader2, History, Sparkles, Copy, Check } from 'lucide-react';
import { supabase, Summary } from './lib/supabase';
import { summarizeText, translateText, speakText, stopSpeaking } from './lib/api';

function App() {
  const [inputText, setInputText] = useState('');
  const [summaryResult, setSummaryResult] = useState<{
    summary: string;
    wordCountOriginal: number;
    wordCountSummary: number;
    compressionRatio: string;
  } | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [speakingTamil, setSpeakingTamil] = useState(false);
  const [speakingEnglish, setSpeakingEnglish] = useState(false);
  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  useEffect(() => {
    loadRecentSummaries();
  }, []);

  async function loadRecentSummaries() {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data && !error) {
      setRecentSummaries(data);
    }
  }

  async function handleSummarize() {
    if (!inputText.trim()) return;

    setLoading(true);
    setSummaryResult(null);
    setTranslatedText('');

    try {
      const result = await summarizeText(inputText);
      setSummaryResult(result);

      await supabase.from('summaries').insert({
        original_text: inputText,
        summarized_text: result.summary,
        word_count_original: result.wordCountOriginal,
        word_count_summary: result.wordCountSummary,
      });

      loadRecentSummaries();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTranslate() {
    if (!summaryResult?.summary) return;

    setTranslating(true);
    try {
      const result = await translateText(summaryResult.summary);
      setTranslatedText(result.translatedText);

      const { data } = await supabase
        .from('summaries')
        .select('id')
        .eq('summarized_text', summaryResult.summary)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        await supabase
          .from('summaries')
          .update({ translated_text: result.translatedText })
          .eq('id', data.id);
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setTranslating(false);
    }
  }

  function handleSpeakTamil() {
    if (speakingTamil) {
      stopSpeaking();
      setSpeakingTamil(false);
    } else {
      try {
        if (summaryResult?.summary) {
          speakText(summaryResult.summary, 'ta-IN');
          setSpeakingTamil(true);
        }
      } catch (error) {
        alert('Error: ' + (error as Error).message);
      }
    }
  }

  function handleSpeakEnglish() {
    if (speakingEnglish) {
      stopSpeaking();
      setSpeakingEnglish(false);
    } else {
      try {
        if (translatedText) {
          speakText(translatedText, 'en-US');
          setSpeakingEnglish(true);
        }
      } catch (error) {
        alert('Error: ' + (error as Error).message);
      }
    }
  }

  function copyToClipboard(text: string, isTranslation: boolean = false) {
    navigator.clipboard.writeText(text).then(() => {
      if (isTranslation) {
        setCopiedTranslation(true);
        setTimeout(() => setCopiedTranslation(false), 2000);
      } else {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      }
    });
  }

  function loadFromHistory(summary: Summary) {
    setInputText(summary.original_text);
    setSummaryResult({
      summary: summary.summarized_text,
      wordCountOriginal: summary.word_count_original,
      wordCountSummary: summary.word_count_summary,
      compressionRatio: ((1 - summary.word_count_summary / summary.word_count_original) * 100).toFixed(1),
    });
    setTranslatedText(summary.translated_text || '');
    setShowHistory(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-4 rounded-3xl shadow-2xl transform hover:scale-110 transition-transform">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-orange-300 bg-clip-text text-transparent">
              Tamil Summarizer
            </h1>
          </div>
          <p className="text-cyan-100 text-xl font-light">
            AI-Powered News Summarization with Translation & Text-to-Speech
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <label className="block text-sm font-bold text-cyan-300 mb-4 uppercase tracking-wider">
                Paste Tamil News Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="உங்கள் தமிழ் செய்தி உரையை இங்கே ஒட்டவும்..."
                className="w-full h-64 p-5 bg-slate-800/50 border-2 border-cyan-400/30 rounded-2xl focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 outline-none transition-all resize-none text-white placeholder-slate-400"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-cyan-300">
                  {inputText.split(/\s+/).filter(w => w).length} words
                </span>
                <button
                  onClick={handleSummarize}
                  disabled={!inputText.trim() || loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl hover:from-cyan-300 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/50 font-bold text-sm uppercase tracking-wider transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Summarize Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {recentSummaries.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 backdrop-blur-xl bg-white/10 border border-white/20 text-cyan-300 rounded-2xl hover:bg-white/20 hover:border-cyan-300/50 transition-all shadow-lg font-bold uppercase tracking-wider text-sm"
              >
                <History className="w-5 h-5" />
                {showHistory ? 'Hide History' : 'Recent Summaries'}
              </button>
            )}

            {showHistory && (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-cyan-300 mb-4 uppercase tracking-wider">History</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentSummaries.map((summary) => (
                    <button
                      key={summary.id}
                      onClick={() => loadFromHistory(summary)}
                      className="w-full text-left p-4 bg-slate-800/30 hover:bg-cyan-500/20 border border-cyan-400/20 rounded-xl transition-all"
                    >
                      <p className="text-sm text-white line-clamp-2">
                        {summary.original_text}
                      </p>
                      <p className="text-xs text-cyan-300 mt-2 font-medium">
                        {new Date(summary.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {summaryResult && (
              <>
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 border border-cyan-400/30 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <label className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                      Tamil Summary
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(summaryResult.summary)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-white/20 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-medium"
                      >
                        {copiedSummary ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleSpeakTamil}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider ${
                          speakingTamil
                            ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/50'
                            : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 shadow-lg shadow-green-500/30'
                        }`}
                      >
                        <Volume2 className={`w-4 h-4 ${speakingTamil ? 'animate-pulse' : ''}`} />
                        {speakingTamil ? 'Stop' : 'Speak'}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-800/40 border border-cyan-400/20 rounded-2xl min-h-[220px] text-white leading-relaxed">
                    {summaryResult.summary}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/30 rounded-2xl transform hover:scale-105 transition-transform">
                      <p className="text-3xl font-black bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
                        {summaryResult.wordCountOriginal}
                      </p>
                      <p className="text-xs text-cyan-300 mt-2 font-bold uppercase">Original</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/30 rounded-2xl transform hover:scale-105 transition-transform">
                      <p className="text-3xl font-black bg-gradient-to-r from-green-300 to-green-400 bg-clip-text text-transparent">
                        {summaryResult.wordCountSummary}
                      </p>
                      <p className="text-xs text-cyan-300 mt-2 font-bold uppercase">Summary</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-400/30 rounded-2xl transform hover:scale-105 transition-transform">
                      <p className="text-3xl font-black bg-gradient-to-r from-orange-300 to-orange-400 bg-clip-text text-transparent">
                        {summaryResult.compressionRatio}%
                      </p>
                      <p className="text-xs text-cyan-300 mt-2 font-bold uppercase">Reduced</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTranslate}
                    disabled={translating}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 font-bold uppercase tracking-wider transform hover:scale-105 active:scale-95"
                  >
                    {translating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="w-5 h-5" />
                        Translate to English
                      </>
                    )}
                  </button>
                </div>

                {translatedText && (
                  <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-400/30 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <label className="text-sm font-bold text-green-300 uppercase tracking-wider">
                        English Translation
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyToClipboard(translatedText, true)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-white/20 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-medium"
                        >
                          {copiedTranslation ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleSpeakEnglish}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider ${
                            speakingEnglish
                              ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/50'
                              : 'bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-300 hover:to-cyan-400 shadow-lg shadow-blue-500/30'
                          }`}
                        >
                          <Volume2 className={`w-4 h-4 ${speakingEnglish ? 'animate-pulse' : ''}`} />
                          {speakingEnglish ? 'Stop' : 'Speak'}
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-800/40 border border-green-400/20 rounded-2xl min-h-[180px] text-white leading-relaxed">
                      {translatedText}
                    </div>
                  </div>
                )}
              </>
            )}

            {!summaryResult && (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
                <div className="bg-gradient-to-br from-cyan-400/20 to-blue-500/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-400/30">
                  <FileText className="w-16 h-16 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-black text-cyan-300 mb-3 uppercase tracking-wider">
                  Ready to Summarize
                </h3>
                <p className="text-cyan-100 text-lg">
                  Paste Tamil news text and click Summarize to begin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
