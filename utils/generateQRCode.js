// import QRCode from "qrcode";

// export const generateQRCode = async (url, options = {}) => {
//   try {
//     // Optimized QR code options for smaller file size
//     const defaultOptions = {
//       color: {
//         dark: options.darkColor || "#1F2937",      // Premium dark gray
//         light: options.lightColor || "#F3F4F6"     // Premium light gray
//       },
//       width: 300,           // Reduced from 400
//       margin: 2,            // Reduced from 3
//       errorCorrectionLevel: 'H',
//       type: 'image/png',
//       rendererOpts: {
//         quality: 0.85       // Reduced from 0.95
//       }
//     };

//     const qr = await QRCode.toDataURL(url, defaultOptions);
    
//     // Check if QR code was generated
//     if (!qr || !qr.startsWith('data:')) {
//       throw new Error("QR code generation failed - invalid output");
//     }

//     return qr;
//   } catch (error) {
//     console.error("QR Code Error:", error);
//     throw new Error("QR generation failed: " + error.message);
//   }
// };

// // Premium Color Presets
// export const QRColorPresets = {
//   // Premium Professional
//   premium_dark: { 
//     darkColor: "#1F2937", 
//     lightColor: "#F9FAFB" 
//   },
//   premium_blue: { 
//     darkColor: "#1E3A8A", 
//     lightColor: "#DBEAFE" 
//   },
//   premium_purple: { 
//     darkColor: "#6B21A8", 
//     lightColor: "#E9D5FF" 
//   },
//   premium_emerald: { 
//     darkColor: "#065F46", 
//     lightColor: "#D1FAE5" 
//   },
  
//   // Vibrant Presets
//   vibrant_neon: { 
//     darkColor: "#000000", 
//     lightColor: "#00FF88" 
//   },
//   vibrant_pink: { 
//     darkColor: "#EC4899", 
//     lightColor: "#FDF2F8" 
//   },
//   vibrant_orange: { 
//     darkColor: "#EA580C", 
//     lightColor: "#FEF3C7" 
//   },
  
//   // Elegant Presets
//   elegant_gold: { 
//     darkColor: "#78350F", 
//     lightColor: "#FEF3C7" 
//   },
//   elegant_rose: { 
//     darkColor: "#831843", 
//     lightColor: "#FDF2F8" 
//   },
//   elegant_slate: { 
//     darkColor: "#1E293B", 
//     lightColor: "#E2E8F0" 
//   },
  
//   // Original Presets
//   rainbow: { darkColor: "#FF1493", lightColor: "#00CED1" },
//   sunset: { darkColor: "#FF6B35", lightColor: "#FFD662" },
//   ocean: { darkColor: "#0066CC", lightColor: "#99CCFF" },
//   forest: { darkColor: "#1B5E20", lightColor: "#C8E6C9" },
//   purple: { darkColor: "#6A1B9A", lightColor: "#E1BEE7" },
//   sunset2: { darkColor: "#D32F2F", lightColor: "#FFEB3B" },
//   ocean2: { darkColor: "#1565C0", lightColor: "#BBDEFB" },
//   mint: { darkColor: "#00695C", lightColor: "#B2DFDB" }
// };



import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";

export const generateStyledQR = async ({
  url,
  logoPath = null,
  centerText = null,
  darkColor = "#6B21A8",
  lightColor = "#FFFFFF",
}) => {
  const size = 500;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  
  console.log("Hello bhai mere qr ke details  URL",url)
  console.log("Hello bhai mere qr ke details  URL",logoPath)
  console.log("Hello bhai mere qr ke details  URL",centerText)
  // 1️⃣ Generate QR (high quality)
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    width: size,
  });

  // 2️⃣ Draw white rounded center box
  const boxSize = 120;
  const x = (size - boxSize) / 2;
  const y = (size - boxSize) / 2;

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(x, y, boxSize, boxSize, 20);
  ctx.fill();

  // 3️⃣ Logo OR Text
  if (logoPath) {
    try {
      console.log("Attempting to load logo from:", logoPath);
      const logo = await loadImage(logoPath);
      ctx.drawImage(logo, x + 15, y + 15, boxSize - 30, boxSize - 30);
      console.log("Logo loaded successfully");
    } catch (logoError) {
      console.warn("Failed to load logo, using fallback text:", logoError.message);
      // Fallback to center text if logo loading fails
      ctx.fillStyle = darkColor;
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(centerText || "QR", size / 2, size / 2);
    }
  } else if (centerText) {
    ctx.fillStyle = darkColor;
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(centerText, size / 2, size / 2);
  }

  return canvas.toDataURL("image/png");
};
