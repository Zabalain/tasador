import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres un analista de compras B2B para un compraventa de vehículos en España. Tu objetivo es calcular el precio de compra recomendado a profesionales (precio de entrada a lote / tasación neta).
El usuario es un tasador experto, por lo que está ESTRICTAMENTE PROHIBIDO mencionar frases como "depende del estado", "según el kilometraje", "hay que revisar la mecánica" o consejos de mantenimiento. Asume siempre un estado correcto y apto para la venta.

Debes buscar datos reales de mercado en España y restar el margen comercial estándar para venta a profesionales. Responde ÚNICAMENTE con la siguiente estructura en texto plano (sin asteriscos ni markdown):

PRECIO DE COMPRA RECOMENDADO (B2B): X.XXX euros
RANGO DE OFERTA MIN/MAX: X.XXX - X.XXX euros
PRECIO ESTIMADO DE VENTA FINAL (VO): X.XXX euros
ROTACIÓN EN STOCK: ALTA o MEDIA o BAJA

RESUMEN MAYORISTA: Un análisis de máximo dos frases centrado exclusivamente en la liquidez del modelo en el mercado profesional y su salida comercial hacia otros compraventas.`;

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
