import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres un analista de datos de mercado automovilístico B2B en España. Tu objetivo es tasar un vehículo destinado a la reventa entre profesionales del sector VO (compraventas). 
El usuario es un tasador experto. Está TERMINANTEMENTE PROHIBIDO incluir advertencias mecánicas, comentarios sobre el kilometraje del tipo "depende de", "hay que revisar", consejos de mantenimiento o listas de puntos débiles mecánicos. Asume estado correcto.

Debes analizar anuncios reales en portales españoles (coches.net, milanuncios, wallapop) y calcular los valores neto comerciales. 
Tu respuesta debe ser OBLIGATORIAMENTE un objeto JSON válido, sin bloques de código markdown (sin \`\`\`json), plano, con las siguientes llaves exactas:
{
  "precioCompra": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "precioMasBajo": "X.XXX",
  "rangoMin": "X.XXX",
  "rangoMax": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Máximo dos frases analizando únicamente la liquidez del modelo en lote profesional y velocidad de salida hacia subasta o reventa.",
  "enlaces": [
    "https://www.coches.net/...",
    "https://www.milanuncios.com/...",
    "https://es.wallapop.com/..."
  ]
}`;

export async function POST(req) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Falta la GEMINI_API_KEY en Vercel." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: SYSTEM_PROMPT
    });

    const response = await model.generateContent(query);
    const textResponse = response.response.text().trim();
    
    // Parseamos la respuesta para asegurar que viaja como JSON limpio hacia la web
    const data = JSON.parse(textResponse);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en análisis: " + error.message }, { status: 500 });
  }
}
