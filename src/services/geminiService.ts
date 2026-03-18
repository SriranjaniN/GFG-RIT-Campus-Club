import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getMentorRecommendations(
  codingLevel: string,
  careerGoals: string,
  preferredDomain: string
) {
  const model = "gemini-3-flash-preview";
  const prompt = `As an AI Mentor for the GeeksforGeeks Campus Club at RIT, provide personalized recommendations for a student with the following profile:
  - Coding Level: ${codingLevel}
  - Career Goals: ${careerGoals}
  - Preferred Domain: ${preferredDomain}

  Suggest:
  1. Specific GeeksforGeeks courses or learning paths.
  2. Types of coding problems to focus on.
  3. Career advice for their specific domain.
  4. How to leverage the GFG RIT community.

  Format the response in clear Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't generate recommendations at this time. Please try again later.";
  }
}

export async function getLearningPath(domain: string, level: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Create a structured learning path for ${domain} at the ${level} level. 
  Include links to GeeksforGeeks resources where possible. 
  Focus on a step-by-step approach from basics to advanced topics.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate learning path.";
  }
}

export async function verifyCertification(imageBase64: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `As an AI verifier for GFG RIT Campus Club, analyze this image. 
  Determine if it is a valid GeeksforGeeks course completion certificate or a screenshot showing course completion on the GFG portal.
  
  Return a JSON object with:
  {
    "isValid": boolean,
    "courseName": string | null,
    "studentName": string | null,
    "confidence": number (0-1),
    "reason": string (explanation of why it is valid or invalid),
    "pointsAwarded": number (suggested points between 50-200 based on course difficulty)
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64
          }
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Verification Error:", error);
    return { isValid: false, reason: "Verification service failed." };
  }
}

export async function getAILearningPaths(interests: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `As an AI for GeeksforGeeks Campus Club RIT, recommend 4 specific learning paths from GeeksforGeeks based on these user interests: "${interests}".
  
  Return a JSON array of objects with the following structure:
  [
    {
      "title": "Path Title",
      "description": "Brief description of the path and why it matches the interest",
      "level": "Beginner/Intermediate/Advanced",
      "link": "https://www.geeksforgeeks.org/..."
    }
  ]
  
  Ensure the links are valid GeeksforGeeks URLs.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Learning Paths Error:", error);
    return [];
  }
}
