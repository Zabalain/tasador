import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// PROMPT REDISEÑADO CON LÓGICA DE EXTRACCIÓN Y CÁLCULO MATEMÁTICO ESTRICTO
const SYSTEM_PROMPT = `Eres un extractor de datos de vehículos y tasador B2B para España. 
Tu única misión es leer el texto del usuario, extraer las variables clave y calcular los precios mediante una fórmula matemática fija para garantizar que el mismo vehículo JAMÁS dé precios diferentes.

PASO 1: EXTRAE LOS DATOS
- Marca y Modelo.
- Año (Ej: 2013, 2023).
- Kilómetros (limpia el texto para obtener solo el número).

PASO 2: DETERMINA EL VALOR BASE DE MERCADO (PVP MEDIO REAL EN ESPAÑA)
Usa tu conocimiento del mercado de VO real en España (coches.net, wallapop) para fijar el PVP Medio de ese coche EXACTO con 100.000 km.
- Ej: Dacia Lodgy 2013 1.5dCi base (100k km) = 7.000€
- Ej: MG4 Standard 2023 base (100k km) = 18.500€

PASO 3: APLICA LA FÓRMULA MATEMÁTICA DE AJUSTE POR KILOMETRAJE
Suma o resta al valor base exactamente:
- Si tiene MENOS de 100.000 km: Suma un 5% por cada 20.000 km de menos.
- Si tiene MÁS de 100.000 km: Resta un 4% por cada 20.000 km de más.
El resultado de este cálculo matemático SERÁ el "precioVentaMedio". ¡No te lo inventes de forma aleatoria!

PASO 4: CÁLCULO EN CASCADA RESTRICTIVO (MÁRGENES DE COMPRAVENTA)
Partiendo del "precioVentaMedio" calculado en el Paso 3:
1. masBaratoInternet = precioVentaMedio * 0.82 (Un 18% menos que la media).
2. precioB2B = masBaratoInternet * 0.85 (Un 15% por debajo del suelo de internet para salida profesional rápida).
3. precioTasacion = precioB2B - 1000 (Exactamente 1.000€ menos para garantizar tu margen de taller y beneficio).

PASO 5: RESUMEN MECÁNICO ULTRA-CONCISO
Enumera de forma escueta y directa los puntos críticos de inspección en taller y fallos endémicos de ese motor/modelo. Cero rodeos comerciales.

Devuelve estrictamente un JSON válido:
{
  "necesitaAclaracion": false,
  "precioTasacion": "X.XXX",
  "precioB2B": "X.XXX",
  "masBaratoInternet": "X.XXX",
  "precioVentaMedio": "X.XXX",
  "rotacion": "ALTA" o "MEDIA" o "BAJA",
  "resumen": "Lista de puntos clave a revisar y averías típicas de este modelo."
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
      generationConfig: { responseMimeType: "application/json", temperature: 0.0 }, // Temperature 0.0 anula la aleatoriedad
      systemInstruction: SYSTEM_PROMPT
    });

    const response = await model.generateContent(`Extrae datos, procesa la fórmula matemática de tasación y lista averías para: ${query}`);
    const data = JSON.parse(response.response.text().trim());
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error en tasación: " + error.message }, { status: 500 });
  }
}
