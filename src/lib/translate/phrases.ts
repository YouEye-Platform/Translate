export interface Phrase {
  text: string;
  translation: string;
  lang: string;
  targetLang: string;
  categories: string[];
}

/** Curated phrase bank — rotates daily by day-of-year */
export const PHRASES: Phrase[] = [
  { text: "¿Cómo estás?", translation: "How are you?", lang: "es", targetLang: "en", categories: ["Greetings", "Common"] },
  { text: "Bonjour le monde", translation: "Hello world", lang: "fr", targetLang: "en", categories: ["Greetings"] },
  { text: "Wo ist der Bahnhof?", translation: "Where is the train station?", lang: "de", targetLang: "en", categories: ["Travel", "Common"] },
  { text: "Спасибо большое", translation: "Thank you very much", lang: "ru", targetLang: "en", categories: ["Common", "Politeness"] },
  { text: "お元気ですか", translation: "How are you?", lang: "ja", targetLang: "en", categories: ["Greetings", "Common"] },
  { text: "Buon appetito!", translation: "Enjoy your meal!", lang: "it", targetLang: "en", categories: ["Food", "Common"] },
  { text: "Quanto custa isso?", translation: "How much does this cost?", lang: "pt", targetLang: "en", categories: ["Travel", "Shopping"] },
  { text: "Waar is het toilet?", translation: "Where is the bathroom?", lang: "nl", targetLang: "en", categories: ["Travel"] },
  { text: "Tack så mycket", translation: "Thank you so much", lang: "sv", targetLang: "en", categories: ["Politeness", "Common"] },
  { text: "Miło cię poznać", translation: "Nice to meet you", lang: "pl", targetLang: "en", categories: ["Greetings"] },
  { text: "Bu ne kadar?", translation: "How much is this?", lang: "tr", targetLang: "en", categories: ["Shopping", "Travel"] },
  { text: "Hej, jag heter…", translation: "Hi, my name is…", lang: "sv", targetLang: "en", categories: ["Greetings", "Introduction"] },
  { text: "Je ne comprends pas", translation: "I don't understand", lang: "fr", targetLang: "en", categories: ["Common", "Travel"] },
  { text: "Können Sie mir helfen?", translation: "Can you help me?", lang: "de", targetLang: "en", categories: ["Travel", "Common"] },
  { text: "만나서 반갑습니다", translation: "Nice to meet you", lang: "ko", targetLang: "en", categories: ["Greetings"] },
  { text: "Buenas noches", translation: "Good night", lang: "es", targetLang: "en", categories: ["Greetings", "Common"] },
  { text: "Я не понимаю", translation: "I don't understand", lang: "ru", targetLang: "en", categories: ["Common", "Travel"] },
  { text: "Dove posso trovare un taxi?", translation: "Where can I find a taxi?", lang: "it", targetLang: "en", categories: ["Travel"] },
  { text: "S'il vous plaît", translation: "Please", lang: "fr", targetLang: "en", categories: ["Politeness", "Common"] },
  { text: "Ich hätte gern…", translation: "I would like…", lang: "de", targetLang: "en", categories: ["Food", "Common"] },
  { text: "很高兴认识你", translation: "Nice to meet you", lang: "zh", targetLang: "en", categories: ["Greetings"] },
  { text: "Por favor, la cuenta", translation: "The check, please", lang: "es", targetLang: "en", categories: ["Food", "Travel"] },
  { text: "Qu'est-ce que c'est?", translation: "What is this?", lang: "fr", targetLang: "en", categories: ["Common"] },
  { text: "Будь ласка", translation: "Please", lang: "uk", targetLang: "en", categories: ["Politeness", "Common"] },
  { text: "すみません", translation: "Excuse me", lang: "ja", targetLang: "en", categories: ["Politeness", "Common"] },
  { text: "Bis morgen!", translation: "See you tomorrow!", lang: "de", targetLang: "en", categories: ["Greetings", "Common"] },
  { text: "Cuánto tiempo sin verte", translation: "Long time no see", lang: "es", targetLang: "en", categories: ["Greetings"] },
  { text: "C'est la vie", translation: "That's life", lang: "fr", targetLang: "en", categories: ["Idioms"] },
  { text: "Piacere di conoscerti", translation: "Pleased to meet you", lang: "it", targetLang: "en", categories: ["Greetings"] },
  { text: "감사합니다", translation: "Thank you", lang: "ko", targetLang: "en", categories: ["Politeness", "Common"] },
  { text: "ขอบคุณครับ", translation: "Thank you", lang: "th", targetLang: "en", categories: ["Politeness", "Common"] },
  { text: "Hyvää päivää", translation: "Good day", lang: "fi", targetLang: "en", categories: ["Greetings"] },
  { text: "Bună ziua", translation: "Good day", lang: "ro", targetLang: "en", categories: ["Greetings"] },
  { text: "Selamat pagi", translation: "Good morning", lang: "id", targetLang: "en", categories: ["Greetings"] },
  { text: "God morgen", translation: "Good morning", lang: "no", targetLang: "en", categories: ["Greetings"] },
  { text: "Xin chào", translation: "Hello", lang: "vi", targetLang: "en", categories: ["Greetings"] },
];

/** Get today's phrase — rotates daily by day-of-year */
export function getPhraseOfTheDay(): Phrase {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return PHRASES[dayOfYear % PHRASES.length];
}
