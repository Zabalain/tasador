import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres el tasador jefe de Autos del Norte en España. Tu usuario es un TASADOR PROFESIONAL. Está totalmente prohibido inventar o alucinar precios. Tus datos deben ser coherentes con el mercado real actual de España en coches.net, milanuncios, wallapop y autoscout24.

MÉTODO DE CÁLCULO EN CASCADA (MANDAN LOS PRECIOS REALES):
1. PRECIO VENTA MEDIO UNIDADES SIMILARES: Identifica el promedio real de anuncios públicos para este coche en España con año y km similares. Este es tu punto de partida real.
2. MÁS BARATO DE INTERNET: El precio del anuncio real más bajo y funcional publicado en España (suelo de mercado). Debe ser coherente y menor que el precio medio.
3. PRECIO B2B COMPRAVENTAS: Tu precio de salida rápido para profesionales. Debe ser OBLIGATORIAMENTE INFERIOR al "Más barato de internet" (un 15% o 20% menos que el suelo de portales) para que tenga salida comercial en el canal mayorista.
4. PRECIO TASACIÓN: Lo que le pagas al particular. Para asegurar un margen real y amplio, BAJA este precio drásticamente. Debe situarse de 900€ a 1.200€ POR DEBAJO del Precio B2B calculado.

INFORME MECÁNICO ULTRA-CONCISO ("resumen"):
Sé extremadamente escueto. No saludes, no justifiques el precio ni hables de márgenes comerciales. Al usuario no le interesan las obviedades. Limítate a listar en formato de texto directo los puntos críticos exactos a revisar en el taller y de qué males endémicos peca ese motor/modelo específico por año y kilómetros.

Devuelve estrictamente un JSON válido con esta estructura:
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioB2B": "X.XXX",
  "masBaratoInternet": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Males endémicos y puntos clave a inspeccionar:"
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

    const response = await model.generateContent(`Extrae precios verídicos del mercado de VO en España y puntos de taller para: ${query}`);
    const data = JSON.parse(response.response.text().trim());
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en tasación: " + error.message }, { status: 500 });
  }
}
