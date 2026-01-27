import { GoogleGenAI } from "@google/genai";
import { TEMPLATE_GENERATION_PROMPT, IMAGE_ANALYSIS_PROMPT, GeneratedTemplate } from "./prompts";

export async function generateTemplate(
  userDescription: string
): Promise<GeneratedTemplate> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `${TEMPLATE_GENERATION_PROMPT}

사용자 요청: ${userDescription}`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini API error:", errorMessage);
    throw new Error(`Gemini API 호출 실패: ${errorMessage}`);
  }

  const text = response.text ?? "";

  if (!text) {
    throw new Error("AI가 빈 응답을 반환했습니다. 다시 시도해주세요.");
  }

  return parseTemplateResponse(text);
}

// 이미지에서 템플릿 생성
export async function generateTemplateFromImage(
  imageBase64: string,
  mimeType: string,
  additionalDescription?: string
): Promise<GeneratedTemplate> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let prompt = IMAGE_ANALYSIS_PROMPT;
  if (additionalDescription) {
    prompt += `\n\n사용자 추가 요청: ${additionalDescription}`;
  }

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini Vision API error:", errorMessage);
    throw new Error(`Gemini Vision API 호출 실패: ${errorMessage}`);
  }

  const text = response.text ?? "";

  if (!text) {
    throw new Error("AI가 빈 응답을 반환했습니다. 다시 시도해주세요.");
  }

  return parseTemplateResponse(text);
}

// AI 응답에서 JSON 파싱
function parseTemplateResponse(text: string): GeneratedTemplate {
  try {
    // 코드 블록 제거 (```json ... ```)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    const template = JSON.parse(jsonText.trim()) as GeneratedTemplate;
    return template;
  } catch (error) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI 응답을 파싱하는데 실패했습니다. 다시 시도해주세요.");
  }
}
