import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ContentBlock } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getLearningSteps = async (method: string, difficulty: string): Promise<ContentBlock[]> => {
    try {
        const prompt = `You are an expert Rubik's Cube tutor. Create a comprehensive, article-style guide to solve a 3x3 Rubik's Cube using the '${method}' method, tailored for a '${difficulty}' level learner. Structure the guide with clear headings for major stages and subheadings for smaller steps. Be verbose, beginner-friendly, and explicitly describe cube orientation (e.g., 'Hold the cube with the white center piece facing up').

Format the output as a single JSON object with a "guide" key. The value of "guide" should be an array of content blocks. Each block is an object with a "type" and "content" property.
The "type" can be one of: "h2" (for main headings), "h3" (for subheadings), "p" (for paragraphs), or "algorithm".
For "algorithm" blocks, the content should be the algorithm in standard notation, or "N/A" if not applicable.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        guide: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['h2', 'h3', 'p', 'algorithm'] },
                                    content: { type: Type.STRING },
                                },
                                required: ["type", "content"]
                            }
                        }
                    },
                    required: ["guide"]
                }
            }
        });
        
        const parsedResponse = JSON.parse(response.text);
        const guide: ContentBlock[] = parsedResponse.guide;

        if (!guide || guide.length === 0) {
            throw new Error("AI returned no guide content.");
        }
        
        return guide;

    } catch (error) {
        console.error("Error fetching learning guide from Gemini:", error);
        // FIX: Corrected the syntax for throwing a new Error.
        throw new Error("Failed to communicate with the AI model to create the learning guide.");
    }
};

export const solveFromImages = async (base64ImageDatas: string[], method: string): Promise<ContentBlock[]> => {
    try {
        const imageParts = base64ImageDatas.map(data => ({
            inlineData: {
                mimeType: 'image/jpeg',
                data: data.split(',')[1], // Remove the data URL prefix
            },
        }));

        const textPart = {
            text: `CRITICAL TASK: You are a world-class Rubik's Cube solving AI. Your only job is to analyze the 6 provided images that show the complete state of a user's scrambled cube. Based *only* on these images, you must generate a personalized, step-by-step guide to solve the cube completely, starting from the exact state shown.

The 6 images are in this precise order: White (Up), Green (Front), Red (Left), Blue (Back), Orange (Right), and Yellow (Down).

Your output MUST be a single JSON object with a 'solution' key. The value of "solution" must be an array of content blocks, each with a "type" and "content" property ("type" can be "h2", "h3", "p", or "algorithm").

ABSOLUTELY ESSENTIAL RULES FOR THE SOLUTION CONTENT:
1.  **Personalized Solution:** DO NOT provide a generic or full beginner's guide. The guide must be a direct solution path from the specific scrambled state in the images to the solved state. Every step must be relevant to the provided cube.
2.  **Correct Starting Point:** The first step you provide must be the correct first action to take on the cube as shown in the images.
3.  **Orientation First:** Before any algorithms, your very first step must be a clear instruction on how to hold the cube (e.g., 'Hold the cube with the white center facing up and the green center facing you.') for the first sequence of moves.
4.  **Method Adherence:** The entire solution must strictly follow the '${method}' method.
5.  **Structured and Clear:** Use headings ('h2'), subheadings ('h3'), paragraphs ('p'), and algorithms ('algorithm') to make the guide easy to follow. Explain the goal of each stage before giving the moves.`,
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        solution: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['h2', 'h3', 'p', 'algorithm'] },
                                    content: { type: Type.STRING },
                                },
                                required: ["type", "content"]
                            }
                        }
                    },
                    required: ["solution"]
                }
            }
        });
        
        const parsedResponse = JSON.parse(response.text);
        const solution: ContentBlock[] = parsedResponse.solution;

        if (!solution || solution.length === 0) {
            throw new Error("AI returned no solution content.");
        }
        
        return solution;


    } catch (error) {
        console.error("Error solving from images with Gemini:", error);
        throw new Error("Failed to analyze the cube images with the AI model.");
    }
};