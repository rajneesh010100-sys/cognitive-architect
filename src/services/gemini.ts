import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `ROLE:
You are an adaptive cognitive architect designing a learning engine for a physician who prefers deep systems-level understanding over surface memorization.

LEARNER PROFILE:
- Consultant-level medical background
- Prefers mechanism-based reasoning
- Gets bored with generic summaries
- Enjoys philosophical connections to biology and systems
- Wants structured progression with increasing difficulty
- Values clinical application and edge-case reasoning
- Prefers concise but intellectually dense content
- Responds well to challenge-based learning

CONSTRAINTS:
- Avoid textbook fluff
- Avoid basic definitions unless essential
- Assume advanced baseline knowledge
- Keep explanations sharp and logically structured
- Include India-relevant clinical nuance where applicable
- Create cognitive tension, not passive reading.
- MANDATORY: Cross-reference core principles with Harrison's Principles of Internal Medicine.
- MANDATORY: Integrate and explicitly cite the absolute latest clinical research, trials, and updated guidelines. Use your search tool to verify recent data.
- MANDATORY: Output must be highly modular, representing a system map with nodes and edges.`;

export async function generateModuleImage(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `A highly detailed, professional 3D medical illustration of ${topic}. Cinematic lighting, macro photography style, clean dark background, highly educational, visually striking, textbook quality.`,
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Failed to generate image:", error);
  }
  return undefined;
}

export async function generateModule(topic: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `OBJECTIVE:
Design a visual system map and layered learning module on "${topic}".

STRUCTURE:
1. System Nodes & Edges:
Create a network diagram of the topic.
Each node has a level (1-6):
- Level 1: Concept overview (big picture components)
- Level 2: Mechanism deep dive (cellular/molecular)
- Level 3: Clinical integration (symptoms, drugs, interventions)
- Level 4: Advanced/edge cases (rare complications)
- Level 5: Latest research & trials
- Level 6: Future directions & unknowns
For each node, provide:
- Short explanation (max 4-5 lines)
- One key mechanism
- One clinical correlation
- One "why this matters" insight

2. Micro-Interactions:
Provide 5 interactive elements:
- 2 'sequence' (e.g., drag to sequence a pathway, provide 4-5 steps in correct order)
- 2 'reveal' (e.g., click to reveal a physiological consequence)
- 1 'quiz' (e.g., a quick 1-2 line pop-up question with answer)

3. Compression Panel:
- Summarize the system in exactly 5 lines (array of 5 strings).
- Explain the entire system as a single flow (string).
- Provide one unifying philosophical/biological principle (string).

4. Decision Cases:
Provide 5 real-world clinical cases with incomplete data, forcing diagnostic reasoning.
Each case should have 3 options, only 1 correct, with consultant-level feedback for each option.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                level: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                mechanism: { type: Type.STRING },
                clinicalCorrelation: { type: Type.STRING },
                insight: { type: Type.STRING }
              },
              required: ['id', 'label', 'level', 'explanation', 'mechanism', 'clinicalCorrelation', 'insight']
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                label: { type: Type.STRING }
              },
              required: ['id', 'source', 'target']
            }
          },
          microInteractions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                consequence: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ['id', 'type', 'question']
            }
          },
          compression: {
            type: Type.OBJECT,
            properties: {
              fiveLines: { type: Type.ARRAY, items: { type: Type.STRING } },
              flow: { type: Type.STRING },
              unifyingPrinciple: { type: Type.STRING }
            },
            required: ['fiveLines', 'flow', 'unifyingPrinciple']
          },
          decisionCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                presentation: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      isCorrect: { type: Type.BOOLEAN },
                      feedback: { type: Type.STRING }
                    },
                    required: ['id', 'text', 'isCorrect', 'feedback']
                  }
                }
              },
              required: ['id', 'presentation', 'options']
            }
          }
        },
        required: ['nodes', 'edges', 'microInteractions', 'compression', 'decisionCases']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateDeepDive(nodeLabel: string, query: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Topic/Node: ${nodeLabel}
Query: ${query}

Provide a highly detailed, consultant-level deep dive into this specific node based on the user's query.
If the query asks for latest research or new drugs, use your search tool to find the absolute latest clinical trials, FDA approvals, or emerging mechanisms.
If the query asks for molecular details, provide a step-by-step pathway breakdown.
Keep the response concise, highly structured, and intellectually dense. Avoid basic definitions.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text || 'No information retrieved.';
}

export async function answerGlobalQuery(topic: string, query: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Topic: ${topic}
Query: ${query}

Provide a highly detailed, consultant-level answer to the user's query regarding the topic. Use the search tool if necessary to find the latest clinical guidelines or research. Keep the response concise, highly structured, and intellectually dense.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text || 'No information retrieved.';
}

export async function evaluateAnswer(topic: string, question: string, answer: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Topic: ${topic}
Question/Case: ${question}
Learner's Answer: ${answer}

Evaluate the learner's answer. Provide concise, consultant-level feedback. Point out any missed traps or flawed reasoning.
Cross-reference your feedback with Harrison's Principles of Internal Medicine and the latest clinical guidelines where relevant.
Score the answer from 0 to 10 based on clinical reasoning, mechanism understanding, and completeness.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          score: { type: Type.NUMBER }
        },
        required: ['feedback', 'score']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}
