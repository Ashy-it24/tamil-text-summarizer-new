const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function summarizeText(text: string, ratio: number = 0.3) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/summarize-tamil`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, ratio }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Summarization failed');
  }

  return response.json();
}

export async function translateText(text: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/translate-tamil`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, sourceLang: 'ta', targetLang: 'en' }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Translation failed');
  }

  return response.json();
}

export function speakText(text: string, lang: string = 'ta-IN') {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.lang.startsWith(lang.split('-')[0]) && voice.lang.includes(lang.split('-')[1])
    ) || voices.find(voice => voice.lang.startsWith(lang.split('-')[0])) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesis.speak(utterance);
  } else {
    throw new Error('Text-to-speech not supported in this browser');
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
