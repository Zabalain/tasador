import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres el tasador experto e implacable de Autos del Norte en España. Tu misión principal es EVITAR INVENTAR PRECIOS. Debes realizar una simulación analítica de rastreo en tiempo real basada en el mercado español actual para el modelo exacto solicitado.

PROCESO OBLIGATORIO DE AUDITORÍA DE MERCADO:
Antes de devolver los datos, analiza mentalmente los precios de venta al público (PVP) que se manejan en las plataformas de España: coches.net, milanuncios, wallapop y autoscout24 para ese año y kilómetros aproximados.

A PARTIR DE ESOS PORTALES, DETERMINA:
1. MÁS BARATO DE INTERNET: El precio del anuncio real más bajo, transferible y funcional que se encuentra en cualquiera de estos 4 portales (el suelo absoluto del mercado de particulares/compraventas).
2. PVP MEDIO SIMILARES: El precio promedio real al que se anuncian las unidades equivalentes en estas 4 webs.

APLICACIÓN ESTRICTA DE MÁRGENES COMERCIALES (BAJAR TASACIÓN):
Para proteger el negocio, calcula los precios profesionales basándote únicamente en los datos reales anteriores de la siguiente forma:
3. PRECIO B2B COMPRAVENTAS: Es el valor de salida rápido para el canal profesional (mayorista). Debe ser obligatoriamente INFERIOR al precio "Más barato de internet" encontrado (por ejemplo, entre un 15% y un 20% menos que el suelo de internet).
4. PRECIO TASACIÓN: Lo que le pagas al particular. Para asegurar tu margen de beneficio, reparaciones y garantía, vas a BAJAR EL PRECIO DE TASACIÓN de manera drástica. Debe ser obligatoriamente entre 900€ y 1.200€ MENOS (subiendo gradualmente si el precio del vehiculo es mayor), que el Precio B2B calculado. (Ej: Si el más barato en internet se vende a 4.700€, el B2B se sitúa en ~3.800€ y la Tasación cae a los ~2.900€).

Debes devolver obligatoriamente un JSON válido con esta estructura:
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioB2B": "X.XXX",
  "masBaratoInternet": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Análisis de dos frases crudo y comercial justificando la tasación baja al cliente debido a los costes que asume el taller y los kilómetros actuales."
}

Nota: Si faltan datos críticos como motorización o el modelo es un comercial/furgoneta ambiguo, pon "necesitaAclaracion": true.`;

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

    // Pasamos la consulta exigiendo un análisis verídico del mercado actual
    const response = await model.generateContent(`Analiza de forma real el mercado de VO en España en portales profesionales para: ${query}`);
    const textResponse = response.response.text().trim();
    
    const data = JSON.parse(textResponse);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en tasación: " + error.message }, { status: 500 });
  }
}
