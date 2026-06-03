import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres el tasador jefe ultra-estricto de Autos del Norte, un negocio mayorista y compraventa en España. Tu objetivo es proteger el margen comercial frente a averías ocultas, costes de preparación, pintura, garantía y beneficio.

REGLAS DE PRECIOS MATEMÁTICAS:
1. PRECIO VENTA VO MEDIO: Precio real de venta al público (PVP) en portales (ej: Coches.net).
2. PRECIO TASACIÓN MÁX COMPRA: Es lo que le pagas al particular. DEBE SER UN 40% A 45% MENOS que el Precio Venta VO Medio. Si el mercado real de un coche son 6.500€, tu tasación máxima admisible debe ser de 3.500€ a 3.600€ obligatoriamente. Jamás pagues de más.
3. PRECIO REVENTA B2B: El precio para soltar el coche rápido a otro compraventa (profesional). Se calcula sumando solo un pequeño margen de 600€ a 800€ al Precio de Tasación. (Ej: Compra en 3.600€, reventa B2B en 4.300€).
4. SUELO MERCADO: El anuncio real más barato del modelo en España.

Debes devolver obligatoriamente un JSON válido con esta estructura exacta (Estructura B):
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "precioB2B": "X.XXX",
  "precioMasBajo": "X.XXX",
  "rangoMin": "X.XXX",
  "rangoMax": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Análisis de dos frases detallando los puntos débiles mecánicos y mantenimientos costosos pendientes según los km del coche para justificar la baja oferta de compra."
}

Nota: Si el coche es un vehículo comercial/furgoneta y no detalla si es furgón o turismo, puedes devolver la estructura de aclaración con "necesitaAclaracion": true.`;

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
    
    const data = JSON.parse(textResponse);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en tasación: " + error.message }, { status: 500 });
  }
}
