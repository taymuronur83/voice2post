import { getInputProps } from 'remotion';
// ... senin diğer importların varsa burada kalsın (React vb.)

export const MyVideo = () => {
    // Vercel'den gönderdiğimiz "script" verisini burada yakalıyoruz
    // Eğer koddaki isim 'text' ise text, 'script' ise script olarak karşıla
    const { text } = getInputProps(); 

    return (
        <div style={{ 
            flex: 1, 
            backgroundColor: 'white', // Arka plan rengini sen belirleyebilirsin
            justifyContent: 'center', 
            alignItems: 'center', 
            display: 'flex',
            fontSize: '40px', // Yazı boyutu
            textAlign: 'center',
            padding: '20px'
        }}>
            {/* Vercel'den gelen metin burada görünecek */}
            {text || "Video Hazırlanıyor..."}
        </div>
    );
};
