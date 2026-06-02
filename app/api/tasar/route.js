import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres un comprador y profesional de coches en España. Responde en texto plano:
PRECIO VENTA MEDIO: X.XXX euros
RANGO: X.XXX - X.XXX euros
RESUMEN: Breve comentario de mercado.`;

export async function POST(req) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ result: "Falta la GEMINI_API_KEY en Vercel." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const response = await model.generateContent(query);
    return NextResponse.json({ result: response.response.text() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
