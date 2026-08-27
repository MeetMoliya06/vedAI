import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const qpFiles = formData.getAll("questionPaper") as File[];
    const asFiles = formData.getAll("answerSheet") as File[];

    if (!qpFiles.length || !asFiles.length) {
      return NextResponse.json(
        { error: "Both question paper and answer sheet are required." },
        { status: 400 }
      );
    }

    // Convert Files to base64
    const fileToGenerativePart = async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      };
    };

    const qpParts = await Promise.all(qpFiles.map(fileToGenerativePart));
    const asParts = await Promise.all(asFiles.map(fileToGenerativePart));

    const prompt = `
You are an expert AI assessment grader.
I have provided images for a Question Paper (first set of images) and a Student's handwritten Answer Sheet (second set of images).

Task:
1. Extract all questions from the question paper in their printed order. Treat labelled sub-parts (like 11(a) and 11(b)) as separate entries.
2. Find the corresponding student's handwritten answer for each question from the answer sheet.
3. Grade the answer based on the question (evaluate if it's correct, give a score out of 10, and provide short feedback).
4. Provide the EXACT bounding box coordinates of where the student's handwritten answer is located on the answer sheet image. Return coordinates as [ymin, xmin, ymax, xmax] normalized between 0 and 1000 (meaning multiply the ratio by 1000).

Return the output EXACTLY matching this JSON schema:
{
  "questions": [
    {
      "id": "String (e.g. '1', '2(a)')",
      "question_text": "String (the extracted question)",
      "student_answer": "String (the extracted handwritten answer, or null if not answered)",
      "is_correct": "Boolean",
      "score": "Number (0 to 10)",
      "feedback": "String (brief explanation of grading)",
      "bounding_box": [ymin, xmin, ymax, xmax] // Array of 4 numbers (0-1000) representing the answer's location on the answer sheet, or null if not found
    }
  ],
  "summary": {
    "total_score": "Number",
    "max_score": "Number",
    "feedback": "String (overall feedback)"
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [prompt, ...qpParts, "--- ANSWER SHEET ---", ...asParts],
      config: {
        responseMimeType: "application/json",
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(textResponse);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error processing assessment:", error);
    return NextResponse.json(
      { error: "Failed to process assessment", details: error.message },
      { status: 500 }
    );
  }
}
