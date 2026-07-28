TOOLBOX — Free Tools Website
=============================

Folder kholna:
- Is folder ko VS Code mein directly open kar lein (File > Open Folder).
- "Live Server" extension install kar lein (VS Code extensions se) aur index.html
  par right-click karke "Open with Live Server" karein — website turant browser
  mein khul jayegi.
- Live Server na ho to seedha index.html par double-click karein, ye browser
  mein khul jayega (kuch tools jaise QR code aur PDF merge behtar chalte hain
  agar Live Server ya kisi local server se open kiya jaye).

Online publish karna (sab free hain):
1) Netlify (sabse aasan):
   - netlify.com par account banayein.
   - Is poore folder ko "Sites" section mein drag-and-drop kar dein.
   - Chand second mein live link mil jayega.

2) GitHub Pages:
   - Is folder ko naye GitHub repo mein upload karein.
   - Repo Settings > Pages mein jakar branch select karein aur Save karein.
   - Kuch minute mein "https://yourusername.github.io/repo-name" par live ho jayega.

3) Vercel:
   - vercel.com par account banayein, "Add New Project" karein, ye folder
     upload/import karein — deploy ho jayega.

Website ke andar kya hai:
- index.html            → home page (sab tools ki list)
- tools/*.html           → har tool ka apna page
- assets/css/style.css   → poori site ka design (ek hi file, fast loading)
- assets/js/*.js         → har tool ka apna JavaScript

Kaam karne wale tools:
1. Image Compressor   — images ko browser mein hi compress karta hai
2. PDF Merge           — multiple PDFs ko ek file mein jorta hai
3. QR Code Generator   — link, text, Wi-Fi ya email ke liye QR banata hai
4. Age Calculator      — exact age nikalta hai
5. BMI Calculator      — height/weight se BMI nikalta hai
6. Password Generator  — strong random passwords banata hai
7. Resume Builder      — form bhar kar live resume preview + PDF save
8. Invoice Generator   — line items add karke invoice + PDF save

Zaroori baat: sab kuch browser ke andar chalta hai — koi file ya data
kisi server par upload nahi hota, is liye ye tools free, private aur
fast hain.
