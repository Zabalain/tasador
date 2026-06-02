import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres un comprador y vendedor profesional de vehículos usados en España. Trabajas en el canal B2B (mayorista para compraventas). 
Tu tono es directo, profesional y comercial. No uses frases complacientes ni advertencias mecánicas obvias.

REGLA CRÍTICA PARA COMERCIALES, FURGONETAS Y MULTIVAN (Berlingo, Rifter, Trafic, Vivaro, Transporter, Partner, etc.):
Estos vehículos varían drásticamente de precio según su homologación y acabado. Si el usuario escribe un modelo de este tipo y NO especifica la versión, estás OBLIGADO a detener la tasación y preguntar para recalcular.

Debes devolver un JSON válido con una de estas dos estructuras exactas:

ESTRUCTURA A (Si necesitas aclarar la versión/acabado):
{
  "necesitaAclaracion": true,
  "pregunta": "Este modelo varía significativamente según su enfoque. Selecciona o especifica la variante exacta para no errar en la tasación:",
  "opciones": [
    "Versión Furgón / Industrial (Solo carga, panelada)",
    "Versión Combi / Mixta (Pasajeros + Carga básica, acabados sencillos)",
    "Versión Pasajeros / Turismo (Acabado básico/medio, ej: Active/Allure/Feel)",
    "Versión Pasajeros Premium / Familiar (Acabado alto/VIP, ej: GT/Shine/SpaceClass)"
  ]
}

ESTRUCTURA B (Si la información ya es clara o el usuario ya seleccionó la variante):
{
  "necesitaAclaracion": false,
  "precioCompra": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "precioMasBajo": "X.XXX",
  "rangoMin": "X.XXX",
  "rangoMax": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Análisis conciso de dos frases enfocado en el valor neto B2B y liquidez del lote."
}

Para tasaciones directas (Estructura B): Aplica siempre un margen de compra B2B agresivo (descuento del 33% al 40% frente al mercado de VO de particulares) para asegurar el margen del próximo compraventa.`;

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

export async function POST(req) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Falta la GEMINI_API_KEY en Vercel." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
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
