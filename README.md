# Valentine's Day Website 💖

เว็บไซต์วันวาเลนไทน์ที่สวยงาม มีเพลงประกอบ แอนิเมชั่น และปุ่มโต้ตอบ

## ฟีเจอร์

- 🎵 เพลงประกอบพื้นหลัง (สามารถเปิด/ปิดได้)
- 💖 แอนิเมชั่นหัวใจลอย
- 💕 ปุ่มส่งหัวใจพร้อมเอฟเฟกต์พิเศษ
- 💌 ข้อความพิเศษแบบ popup
- ✨ เอฟเฟกต์ sparkle ตามเมาส์
- 📱 Responsive design (รองรับทุกขนาดหน้าจอ)
- 🎨 ดีไซน์สวยงามด้วย glassmorphism และ gradient

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. (Optional) เพิ่มไฟล์เสียงในโฟลเดอร์ `public/audio/`:
   - `background_music.mp3` - เพลงประกอบพื้นหลัง
   - `button_click.mp3` - เสียงกดปุ่ม
   - `heart_sound.mp3` - เสียงหัวใจ

## การรัน

เริ่มต้น server:
```bash
npm start
```

เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

## โครงสร้างโปรเจค

```
valentine/
├── server.js              # Express server
├── package.json           # NPM configuration
├── public/
│   ├── index.html        # หน้าเว็บหลัก
│   ├── css/
│   │   └── style.css     # Styling
│   ├── js/
│   │   └── script.js     # JavaScript interactivity
│   ├── images/           # รูปภาพ (ถ้ามี)
│   └── audio/            # ไฟล์เสียง
│       └── README.md     # คำแนะนำเกี่ยวกับไฟล์เสียง
└── valentine.md          # เอกสารต้นฉบับ
```

## เทคโนโลยีที่ใช้

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Fonts**: Google Fonts (Pacifico, Poppins)
- **Design**: Glassmorphism, Gradient backgrounds, CSS Animations

## การปรับแต่ง

### เปลี่ยนสี
แก้ไขตัวแปร CSS ใน `public/css/style.css`:
```css
:root {
    --primary-pink: #ff69b4;
    --deep-pink: #ff1493;
    --romantic-red: #dc143c;
    /* ... */
}
```

### เปลี่ยนข้อความ
แก้ไขใน `public/index.html`

### เพิ่ม/ลดจำนวนหัวใจ
แก้ไขใน `public/js/script.js`:
```javascript
const numberOfHearts = 15; // เปลี่ยนตัวเลขนี้
```

## License

MIT License - ใช้งานได้อย่างอิสระ

---

Made with 💖 for Valentine's Day 2026
