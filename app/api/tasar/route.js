import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres el tasador jefe ultra-estricto de Autos del Norte, un negocio mayorista y compraventa en España. Tu objetivo es proteger el margen comercial frente a averías ocultas, costes de preparación, pintura, garantía y beneficio.

REGLAS DE PRECIOS MATEMÁTICAS Y COHERENCIA:
1. PRECIO TASACIÓN (Particular): Es lo que le ofreces al particular para comprarle el coche. DEBE SER UN 40% A 45% MENOS que el valor medio de mercado. Para un vehículo funcional normal de 6.500€ de mercado, la tasación debe rondar los 3.500€ - 3.700€. Jamás des valores altos.
2. PRECIO B2B PRECIO COMPRAVENTAS: Lo que le pides a otro profesional si decides revenderlo rápido en el canal mayorista. Es el precio de tasación + un pequeño margen comercial (aprox. de 600€ a 900€ más). Debe ser siempre menor que el precio de venta medio del mercado de particulares.
3. MAS BARATO DE INTERNET: El anuncio real más económico (suelo de mercado) para una unidad funcional y transferible en España.
4. PRECIO VENTA MEDIO UNIDADES SIMILARES: El promedio de precios de venta al público en portales para unidades de igual año y kilometraje aproximado. Debe ser lógicamente superior al "más barato de internet".

Debes devolver obligatoriamente un JSON válido con esta estructura exacta (Estructura B):
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioB2B": "X.XXX",
  "masBaratoInternet": "X.XXX",
  "precioVentaMedio": "X.XXX",
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
