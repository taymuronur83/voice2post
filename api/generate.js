import Anthropic from '@anthropic-ai/sdk';
import admin from 'firebase-admin';

// Firebase Admin SDK'sını başlatan kısım (Hiçbir şeyi silmeden ekledik)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel'deki \n karakterlerini gerçek alt satıra dönüştüren kritik ayar:
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    // Veritabanı veya Storage kullanacaksan buraya ekleyebilirsin
  });
}

const db = admin.firestore(); // Veritabanı erişimi için

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Metin bulunamadı.' });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", 
      max_tokens: 4000,
      temperature: 0.7,
      system: "Sen profesyonel bir sosyal medya uzmanısın. LinkedIn postu, Twitter akışı ve VideoScript JSON verisi üretirsin. VideoScript kısmını her zaman geçerli ve tam bir JSON objesi olarak vermeye odaklan.",
      messages: [
        {
          role: "user",
          content: `Şu metni içeriklere dönüştür: ${prompt}. 
          
          VideoScript kısmında 15 saniyelik bir animasyon akışı oluşturmak için 'storyline' dizisini (array) mutlaka ekle. Bu dizi konuyu özetleyen tam 4 aşamadan oluşmalı.
          
          Yanıt formatını kesinlikle bozma:
          LinkedIn: [Metin]
          Twitter: [Metin]
          VideoScript: {
            "title": "Ana Başlık",
            "sub": "Kısa Özet",
            "accentColor": "#3b82f6",
            "storyline": [
              "1. Sahne: Giriş ve Merak Uyandırıcı Cümle",
              "2. Sahne: Olayın Gelişimi ve Detaylar",
              "3. Sahne: Kritik Bilgi veya Detay",
              "4. Sahne: Sonuç ve Harekete Geçirici Mesaj"
            ],
            "animation": {"shakeIntensity": 2, "zoomScale": 1.2, "textSpeed": 1.5}
          }`
        }
      ],
    });

    const content = msg.content[0].text;
    
    const linkedin = content.match(/LinkedIn:\s*([\s\S]*?)(?=Twitter:|$)/)?.[1]?.trim();
    const twitter = content.match(/Twitter:\s*([\s\S]*?)(?=VideoScript:|$)/)?.[1]?.trim();
    const videoScriptRaw = content.match(/VideoScript:\s*(\{[\s\S]*\})/)?.[1]?.trim();
    const parsedVideoScript = videoScriptRaw ? JSON.parse(videoScriptRaw) : null;

    // Firebase'e veriyi kaydetme (Workflow'un çalışması için eklenen kısım)
    const postRef = await db.collection('posts').add({
      prompt,
      linkedin: linkedin || "",
      twitter: twitter || "",
      video_script: parsedVideoScript,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      id: postRef.id, // Oluşturulan postun IDsini döner
      linkedin: linkedin || "LinkedIn metni hazırlanamadı.",
      twitter: twitter || "Twitter metni hazırlanamadı.",
      video_script: parsedVideoScript
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
