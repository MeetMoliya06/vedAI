const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function describeImages() {
  const imageDir = "/Users/meetmoliya/Desktop/freelance/vedaAI/refernce_image";
  const files = fs.readdirSync(imageDir).filter(f => f.endsWith(".png"));
  
  const contents = ["Please describe the UI design, color scheme, layout, and user flow shown in these Figma reference images in detail so I can accurately implement them in CSS and React. Focus on specific design details like colors, shapes, typography, empty states vs filled states, and how the split pane looks."];
  
  for (const file of files) {
    const filePath = path.join(imageDir, file);
    const data = fs.readFileSync(filePath);
    contents.push({
      inlineData: {
        data: data.toString("base64"),
        mimeType: "image/png"
      }
    });
    contents.push(`Image: ${file}`);
  }

  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro",
    contents: contents
  });

  console.log(response.text());
}

describeImages().catch(console.error);
