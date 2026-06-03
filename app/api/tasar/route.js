import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres un tasador experto y estricto para un negocio mayorista/compraventa de vehículos en España (Autos del Norte). Tu objetivo es asegurar el beneficio comercial protegiendo el margen frente a averías, gastos de preparación, transferencia y garantía.

CALIBRACIÓN DE PRECIOS ULTRA-ESTRICTA:
1. PRECIO VENTA VO MEDIO: Es el precio real de venta al público (PVP) en portales. Para el Dacia Lodgy 2013 161k km es aprox 6.000€-7.000€.
2. PRECIO TASACIÓN RECOMENDADO: Es lo que le pagas al particular. DEBE SER UN 40% O 45% MENOS que el Precio Venta VO Medio (para un coche de 6.500€ de mercado, la tasación debe rondar estrictamente los 3.500€ - 3.700€). Jamás des tasaciones elevadas.
3. PRECIO REVENTA B2B (COMPRAVENTAS): El precio de salida rápida para quitártelo de encima entre profesionales, que suele ser el precio de tasación + un pequeño margen de 500€ a 800€, o un 25% menos del valor de mercado de particulares.
4. SUELO MERCADO: El anuncio real más barato funcional en España.

REGLA CRÍTICA PARA COMERCIALES Y FURGONETAS (Berlingo, Rifter, Trafic, etc.):
Si el usuario introduce un comercial/furgoneta y NO especifica variante, frena y usa la estructura A.

Debes devolver un JSON válido con una de estas dos estructuras:

ESTRUCTURA A (Aclaración):
{
  "necesitaAclaracion": true,
  "pregunta": "Variante exacta requerida para ajustar margen comercial:",
  "opciones": ["Versión Furgón / Industrial", "Versión Combi / Mixta", "Versión Pasajeros / Turismo", "Versión Pasajeros Premium / Familiar"]
}

ESTRUCTURA B (Tasación Directa):
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "precioB2B": "X.XXX",
  "precioMasBajo": "X.XXX",
  "rangoMin": "X.XXX",
  "rangoMax": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Análisis de dos frases con los puntos débiles mecánicos, averías endémicas y mantenimientos caros según año y km para justificar la baja tasación al cliente."
}

Devuelve SOLO el JSON, sin texto de relleno.`;

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
