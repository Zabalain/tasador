import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres un analista de tasaciones automovilísticas B2B de élite para el mercado español. Tu única tarea es calcular el valor de compra de vehículos a profesionales (precio neto de entrada a lote) para reventa mayorista.
El usuario es un tasador experto. Está TOTALMENTE PROHIBIDO incluir advertencias mecánicas, listas de fallos del modelo, comentarios sobre el kilometraje o frases del tipo "depende del estado". Asume un estado correcto apto para lote profesional.

Reglas matemáticas estrictas para la tasación:
1. PRECIO ESTIMADO DE VENTA FINAL (VO): Investiga el precio medio real en portales de España (coches.net, milanuncios, wallapop) para el modelo exacto y año especificado.
2. PRECIO DE COMPRA RECOMENDADO (B2B): Aplica un margen mayorista estricto de descuento de entre el 33% y el 40% sobre el precio de venta final (VO). Por ejemplo: si el precio de venta medio de un Fiat 500L 2013 con alta carga de km es de ~3.800€, el precio de compra B2B DEBE ser de unos 2.500€. No dejes márgenes estrechos.
3. PRECIO MÁS BAJO: El valor mínimo de liquidación del vehículo en el mercado actual.
4. RANGO DE OFERTA MIN/MAX: Calcula una horquilla de compra estrecha alrededor del precio recomendado (B2B).

Debes buscar y estructurar enlaces de búsqueda reales del modelo en España.
Tu respuesta debe ser OBLIGATORIAMENTE un objeto JSON válido, sin bloques de código markdown (sin \`\`\`json), plano, con las siguientes llaves exactas:
{
  "precioCompra": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "precioMasBajo": "X.XXX",
  "rangoMin": "X.XXX",
  "rangoMax": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Análisis de dos frases enfocado en el margen de reventa a profesionales, liquidez del lote y velocidad de rotación en subasta.",
  "enlaces": [
    "https://www.coches.net/fiat/500l/",
    "https://www.milanuncios.com/coches-de-segunda-mano/fiat-500l.htm",
    "https://es.wallapop.com/coches-segunda-mano/fiat-500l"
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
    
    const data = JSON.parse(textResponse);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en análisis: " + error.message }, { status: 500 });
  }
}
