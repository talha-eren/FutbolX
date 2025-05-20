@echo off
echo FutbolX Uygulaması Başlatılıyor...

:: Talha Eren kullanıcısını admin yap
echo Talha Eren kullanıcısı admin yetkisi veriliyor...
call npm run make-admin

:: Uygulamayı başlat
echo Uygulama başlatılıyor...
call npm run dev

pause 