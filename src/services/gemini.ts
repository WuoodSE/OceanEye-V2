import type { SatelliteCapture, PollutionAnalysis } from '@/types';
import { generateFallbackAnalysis } from '@/data/fallbackData';

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  (import.meta.env.GEMINI_API_KEY as string) ||
  'AQ.Ab8RN6LsFDhoFFfNxb27vvuji-im3_fHTl5lP0xYzOLO9ivuDQ';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are OceanEye, an AI marine pollution detection system analyzing satellite imagery of coastal waters.
Analyze the provided satellite capture metadata and return ONLY a JSON object with this exact schema:
{
  "pollutionDetected": boolean,
  "pollutionType": "Oil Spill" | "Plastic Debris" | "Chemical Runoff" | "Algal Bloom" | "Sediment Plume" | "Thermal Discharge" | null,
  "area_sqkm": number,
  "coordinates": { "lat": number, "lng": number },
  "boundingBox": { "north": number, "south": number, "east": number, "west": number },
  "severity": "Low" | "Medium" | "High" | "Critical",
  "responsePriority": "Low" | "Medium" | "High" | "Urgent",
  "confidenceScore": number (0-100),
  "environmentalImpactSummary": string,
  "aiRecommendations": string[]
}
Return ONLY the JSON, no markdown, no explanation.`;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export async function analyzeCaptureWithGemini(capture: SatelliteCapture): Promise<PollutionAnalysis> {
  const userPrompt = `Analyze this satellite capture for marine pollution:
- Zone: ${capture.zoneName}
- Source: ${capture.source}
- Timestamp: ${capture.timestamp}
- Center Coordinates: ${capture.coordinates.lat}, ${capture.coordinates.lng}
- Bounding Box: N${capture.boundingBox.north}, S${capture.boundingBox.south}, E${capture.boundingBox.east}, W${capture.boundingBox.west}
- Acquisition Log: ${capture.acquisitionLog}

Based on the coastal characteristics of this region, simulate a realistic pollution analysis result. Return the JSON object.`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status}, using fallback analysis.`);
      return generateFallbackAnalysis(capture);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      console.warn('Gemini API error:', data.error.message);
      return generateFallbackAnalysis(capture);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.warn('Gemini returned empty response, using fallback.');
      return generateFallbackAnalysis(capture);
    }

    const parsed = JSON.parse(text);

    return {
      id: `ana-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      captureId: capture.id,
      timestamp: new Date().toISOString(),
      pollutionDetected: parsed.pollutionDetected ?? false,
      pollutionType: parsed.pollutionType ?? null,
      areaSqKm: parsed.area_sqkm ?? parsed.areaSqKm ?? 0,
      coordinates: parsed.coordinates ?? capture.coordinates,
      boundingBox: parsed.boundingBox ?? capture.boundingBox,
      geojsonPolygon: parsed.geojsonPolygon ?? null,
      severity: parsed.severity ?? 'Low',
      responsePriority: parsed.responsePriority ?? 'Low',
      confidenceScore: parsed.confidenceScore ?? 0,
      environmentalImpactSummary: parsed.environmentalImpactSummary ?? 'Analysis completed.',
      aiRecommendations: parsed.aiRecommendations ?? ['Monitor zone for changes.'],
      isFallback: false,
    };
  } catch (err) {
    console.warn('Gemini analysis failed, using fallback:', err);
    return generateFallbackAnalysis(capture);
  }
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.length > 10;
}
