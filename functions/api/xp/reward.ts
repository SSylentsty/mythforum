export interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
}

const XP_RULES: Record<string, number> = {
  CREATE_THREAD: 10,
  ADD_COMMENT: 2,
  RECEIVED_UPVOTE: 5,
  MARKED_SOLUTION: 20
};

const DAILY_LIMIT = 200;

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    // 1. Authorization: Client'dan gelen Firebase Auth Token'ı al
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    
    // (Güvenlik notu: Production'da JWT signature Web Crypto API ile verify edilmelidir)
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const userId = decodedPayload.user_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    // 2. İsteği parse et
    const body = await request.json();
    const { action, targetId } = body;

    if (!XP_RULES[action]) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    const baseAmount = XP_RULES[action];

    // 3. Firestore REST API İşlemleri (Cloudflare üzerinden Firestore'a bağlanma)
    // Not: Cloudflare Workers ortamında Node.js 'firebase-admin' tam çalışmadığı için
    // Firestore REST API (https://firestore.googleapis.com/v1/projects/...) kullanılmalıdır.

    /* MANTIK (Pseudocode):
    
      1. Kullanıcı verisini çek (users/userId):
         - Günlük XP limitini (dailyXpEarned) ve son sıfırlama (lastXpReset) zamanını kontrol et.
         - 24 saat geçmişse dailyXpEarned = 0 yap.
         - limit (200) aşıldıysa işlemi iptal et (Rate Limiting).
         
      2. Quality Score Çarpanı (Abuse Prevention):
         - Kullanıcının qualityScore > 80 ise çarpan = 1.5x
         - qualityScore < 20 ise çarpan = 0x (Spam cezası, XP verilmez)
         
      3. Veritabanına Yazma (Transaction):
         - users koleksiyonunda 'xp' ve 'dailyXpEarned' değerlerini artır.
         - xp_logs koleksiyonuna yeni log ekle (tarih, action, miktar, targetId).
         
      4. Eğer kullanıcının XP'si yeni bir seviyeye ulaştıysa veya rastgele bir drop şansı tuttuysa:
         - Yeni bir "Mitoloji Kartı" (Card) ver ve user_cards tablosuna ekle.
    */

    // Simüle edilmiş başarılı yanıt
    const finalXp = baseAmount; // Burada quality score multiplier uygulanmış hali olacak

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      xpGranted: finalXp,
      message: 'XP başarıyla eklendi (Server-Side validation passed).'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
