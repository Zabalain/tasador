import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres el tasador experto e implacable de Autos del Norte en España. Tu misión es analizar el mercado real de VO sin inventar precios y ofrecer un diagnóstico mecánico preventivo del vehículo.

PROCESO OBLIGATORIO DE AUDITORÍA DE MERCADO:
Analiza los precios de venta al público (PVP) reales en España dentro de las plataformas: coches.net, milanuncios, wallapop y autoscout24 para el año y kilómetros solicitados.

APLICACIÓN ESTRICTA DE MÁRGENES COMERCIALES (BAJAR TASACIÓN):
1. MÁS BARATO DE INTERNET: El precio del anuncio real más bajo, transferible y funcional en cualquiera de los 4 portales para este modelo.
2. PVP MEDIO SIMILARES: El precio promedio real de venta al público en estas 4 webs.
3. PRECIO B2B COMPRAVENTAS: Valor de salida rápido para el canal mayorista. Debe ser obligatoriamente INFERIOR al precio "Más barato de internet" (entre un 15% y un 20% menos que el suelo de internet).
4. PRECIO TASACIÓN: Lo que le pagas al particular. Para asegurar tu margen, baja este precio drásticamente. Debe situarse entre 900€ y 1.200€ POR DEBAJO del Precio B2B calculado.

INSTRUCCIÓN CRÍTICA PARA EL RESUMEN MECÁNICO:
En el campo "resumen", NO justifiques el precio ni hables de dinero. Debes aportar un texto técnico y profesional con las recomendaciones de mantenimiento, los puntos críticos a revisar en el taller y las averías típicas/endémicas de ese modelo específico considerando su año y kilometraje (ej: problemas de distribución, desgaste de inyectores, turbo, embrague, válvula EGR, etc.).

Debes devolver obligatoriamente un JSON válido con esta estructura:
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioB2B": "X.XXX",
  "masBaratoInternet": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Texto técnico detallado con los puntos clave a revisar en el taller, mantenimientos costosos inminentes por kilometraje y averías típicas de este modelo."
}

Nota: Si falta información crítica o el modelo es un comercial/furgoneta ambiguo, usa "necesitaAclaracion": true.`;

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

    const response = await model.generateContent(`Analiza de forma real el mercado de VO en España en portales profesionales y genera las alertas mecánicas para: ${query}`);
    const textResponse = response.response.text().trim();
    
    const data = JSON.parse(textResponse);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en tasación: " + error.message }, { status: 500 });
  }
}
