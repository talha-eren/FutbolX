const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// .env dosyasını yükle
dotenv.config();

// Sabit transporter oluştur - uygulama başladığında bir kez çağrılır
let transporter = null;

// E-posta gönderimi için transporter oluştur
const createTransporter = () => {
  if (transporter) {
    return transporter; // Zaten oluşturulmuşsa yeniden kullan
  }
  
  console.log('Mailtrap transporter oluşturuluyor...');
  
  // Mailtrap transporter oluştur - test amaçlı e-posta gönderimi
  transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "4d8b3d9e2e8a8d",
      pass: "4f5d3e7e2d6a3b"
    }
  });
  
  console.log('Mailtrap transporterı oluşturuldu');
  return transporter;
};

// Şifre sıfırlama e-postası gönder
const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    console.log('Şifre sıfırlama e-postası gönderiliyor:', email);
    console.log('Sıfırlama kodu:', resetCode);
    
    // Transporter oluştur
    const transport = createTransporter();
    
    // E-posta içeriği
    const mailOptions = {
      from: '"FutbolX" <futbolx@example.com>',
      to: email,
      subject: 'FutbolX - Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">FutbolX</h1>
            <p style="font-size: 18px; color: #333;">Şifre Sıfırlama</p>
          </div>
          
          <p>Merhaba,</p>
          <p>FutbolX hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0; color: #4CAF50;">${resetCode}</h2>
          </div>
          
          <p>Bu kod 1 saat boyunca geçerlidir.</p>
          <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
            <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            <p>&copy; ${new Date().getFullYear()} FutbolX. Tüm hakları saklıdır.</p>
          </div>
        </div>
      `
    };
    
    console.log('Mailtrap ile e-posta gönderiliyor...');
    
    // E-posta gönderimi
    return new Promise((resolve, reject) => {
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('E-posta gönderilirken hata:', error);
          console.error('Hata detayları:', error.message);
          reject(error);
          return false;
        } 
        
        console.log('Şifre sıfırlama e-postası gönderildi:', info.messageId);
        console.log('Mailtrap üzerinden gönderildi, test e-postasını görmek için Mailtrap.io adresine gidin.');
        resolve(true);
        return true;
      });
    });
  } catch (error) {
    console.error('E-posta gönderimi sırasında beklenmeyen hata:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail
};
