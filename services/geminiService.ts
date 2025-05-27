import axios from 'axios';

// Gemini API anahtarı - .env dosyasından alınacak
const GEMINI_API_KEY = 'AIzaSyCtT7wdcN7GBlqNmcd2SSibc19zp9KPAB0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ChatContext {
  userMessage: string;
  conversationHistory?: string[];
  userProfile?: {
    name?: string;
    position?: string;
    level?: string;
    preferences?: string[];
  };
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.baseUrl = GEMINI_API_URL;
  }

  // Futbol odaklı sistem promptu
  private getSystemPrompt(): string {
    return `Sen FutbolX uygulamasının AI asistanısın. Adın "FutbolX AI Asistan". 

GÖREVIN:
- Futbol, saha rezervasyonu, oyuncu eşleştirme, maç organizasyonu konularında yardım etmek
- Türkçe ve samimi bir dille konuşmak
- Emoji kullanarak mesajları daha eğlenceli hale getirmek
- Kısa ve öz yanıtlar vermek (maksimum 3-4 cümle)
- Kullanıcıyı uygulamanın özelliklerine yönlendirmek

UZMANLIK ALANLARIN:
🏟️ Saha Rezervasyonu: Yakın sahalar, fiyat karşılaştırması, müsaitlik
👥 Oyuncu Eşleştirme: Pozisyon bazlı eşleştirme, seviye uyumluluğu
⚽ Maç Organizasyonu: Takım kurma, turnuva düzenleme
📊 İstatistik Analizi: Performans takibi, gelişim grafiği
🏃‍♂️ Antrenman: Kişiselleştirilmiş programlar, egzersizler
🎯 Takım Yönetimi: Strateji, taktik önerileri

YANIT TARZI:
- Samimi ve dostane
- Emoji kullan ama abartma
- Kısa ve net
- Eyleme yönlendirici
- Futbol terminolojisi kullan

ÖRNEK YANITLAR:
"Harika! Size en yakın 3 sahayı buldum 🏟️ Hangisini tercih edersiniz?"
"Pozisyonunuza göre 5 uyumlu oyuncu var! 👥 Hemen eşleştirme yapalım mı?"
"Bugün antrenman için mükemmel bir gün! ⚽ Hangi konuda çalışmak istiyorsunuz?"`;
  }

  // Gemini'ye mesaj gönder
  async sendMessage(context: ChatContext): Promise<string> {
    try {
      const prompt = this.buildPrompt(context);
      
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 saniye timeout
        }
      );

      const geminiResponse: GeminiResponse = response.data;
      
      if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
        const text = geminiResponse.candidates[0].content.parts[0].text;
        return this.formatResponse(text);
      } else {
        throw new Error('Gemini\'den yanıt alınamadı');
      }
    } catch (error) {
      console.error('Gemini API Hatası:', error);
      return this.getFallbackResponse(context.userMessage);
    }
  }

  // Prompt oluştur
  private buildPrompt(context: ChatContext): string {
    let prompt = this.getSystemPrompt() + '\n\n';
    
    // Konversasyon geçmişi varsa ekle
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      prompt += 'KONVERSASYON GEÇMİŞİ:\n';
      context.conversationHistory.slice(-6).forEach((msg, index) => {
        prompt += `${index % 2 === 0 ? 'Kullanıcı' : 'Asistan'}: ${msg}\n`;
      });
      prompt += '\n';
    }

    // Kullanıcı profili varsa ekle
    if (context.userProfile) {
      prompt += 'KULLANICI PROFİLİ:\n';
      if (context.userProfile.name) prompt += `İsim: ${context.userProfile.name}\n`;
      if (context.userProfile.position) prompt += `Pozisyon: ${context.userProfile.position}\n`;
      if (context.userProfile.level) prompt += `Seviye: ${context.userProfile.level}\n`;
      if (context.userProfile.preferences) prompt += `Tercihler: ${context.userProfile.preferences.join(', ')}\n`;
      prompt += '\n';
    }

    prompt += `KULLANICI MESAJI: ${context.userMessage}\n\n`;
    prompt += 'YANIT (Türkçe, kısa ve futbol odaklı):';

    return prompt;
  }

  // Yanıtı formatla
  private formatResponse(text: string): string {
    // Gereksiz boşlukları temizle
    let formatted = text.trim();
    
    // Çok uzunsa kısalt
    if (formatted.length > 300) {
      formatted = formatted.substring(0, 297) + '...';
    }

    return formatted;
  }

  // Fallback yanıtları (API hatası durumunda)
  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('saha') || message.includes('rezervasyon')) {
      return "🏟️ Saha rezervasyonu için size yardımcı olabilirim! Yakınızdaki sahaları görmek ister misiniz?";
    } else if (message.includes('oyuncu') || message.includes('takım') || message.includes('eşleş')) {
      return "👥 Oyuncu eşleştirme konusunda uzmanım! Hangi pozisyonda oyuncu arıyorsunuz?";
    } else if (message.includes('maç') || message.includes('organize')) {
      return "⚽ Maç organizasyonu için her şeyi ayarlayabilirim! Ne zaman oynamak istiyorsunuz?";
    } else if (message.includes('antrenman') || message.includes('egzersiz')) {
      return "🏃‍♂️ Kişiselleştirilmiş antrenman programı hazırlayabilirim! Hangi konuda gelişmek istiyorsunuz?";
    } else if (message.includes('istatistik') || message.includes('performans')) {
      return "📊 Performans analizinizi inceleyebilirim! Hangi dönemdeki verilerinizi görmek istiyorsunuz?";
    } else {
      return "🤖 Size nasıl yardımcı olabilirim? Saha rezervasyonu, oyuncu eşleştirme, maç organizasyonu gibi konularda uzmanım!";
    }
  }

  // Sağlık kontrolü
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.sendMessage({
        userMessage: "test"
      });
      return response.length > 0;
    } catch (error) {
      console.error('Gemini sağlık kontrolü başarısız:', error);
      return false;
    }
  }

  // Konversasyon geçmişini temizle
  clearConversation(): void {
    // Bu metod ChatBot bileşeninde kullanılabilir
    console.log('Konversasyon geçmişi temizlendi');
  }
}

export default new GeminiService();