import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export const aiRouter = express.Router();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function stripDataUrlPrefix(base64Data: string): { mimeType: string; data: string } {
  const match = base64Data.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return {
    mimeType: 'image/jpeg',
    data: base64Data.replace(/^data:[^;]+;base64,/, ''),
  };
}

/**
 * 1. AI Virtual Outfit Try-On Endpoint
 * Note: Realistic photorealistic garment synthesis requires an active paid image-generation model key.
 * When unavailable, returns synthesisAvailable: false honestly along with a real Gemini Vision
 * silhouette, undertone, drape, and tailoring compatibility assessment for the uploaded photo.
 */
aiRouter.post('/virtual-tryon', async (req: Request, res: Response) => {
  try {
    const { userPhotoBase64, product } = req.body;

    if (!userPhotoBase64 || typeof userPhotoBase64 !== 'string') {
      res.status(400).json({ error: 'Please upload your photograph first.' });
      return;
    }
    if (!product || !product.name) {
      res.status(400).json({ error: 'Please select an outfit from the collection.' });
      return;
    }

    const ai = getGeminiClient();
    const synthesisAvailable = false; // Image generation requires a paid image model key

    if (!ai) {
      res.json({
        synthesisAvailable: false,
        aiAnalysisAvailable: false,
        fallbackReason:
          'Realistic AI image synthesis and live Gemini API access are not currently configured on this server. Showing an honest side-by-side comparison preview and styling guide.',
        assessment: {
          harmonySummary: `The ${product.name} (${product.material}) offers rich heritage texture suitable for festive and ceremonial occasions.`,
          drapeTip: `For ${product.subcategory}, crisp pleating and balanced jewelry weight keep the silhouette poised and proportionate.`,
          tailoringNote: 'Select Made-to-Measure tailoring in the Customization Studio to match shoulder width and sleeve length.',
          occasionFit: 'Ideal for weddings, evening receptions, and traditional celebrations.',
        },
      });
      return;
    }

    const { mimeType, data } = stripDataUrlPrefix(userPhotoBase64);

    const prompt = `You are a professional Indian couture stylist at MUDRA.
The customer uploaded their portrait photo and wants to try on this garment:
- Outfit: ${product.name}
- Category: ${product.category} / ${product.subcategory}
- Material & Fabric: ${product.material} (${product.fabricDetails || ''})
- Available Colors: ${(product.availableColors || []).map((c: { name: string }) => c.name).join(', ')}

Be respectful, accurate, and constructive. Do NOT invent measurements or claim you generated an image.
Provide a concise styling & fit compatibility assessment for pairing this portrait with the selected outfit.
Return valid JSON with keys: harmonySummary, drapeTip, tailoringNote, occasionFit.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            harmonySummary: { type: Type.STRING },
            drapeTip: { type: Type.STRING },
            tailoringNote: { type: Type.STRING },
            occasionFit: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());

    res.json({
      synthesisAvailable,
      aiAnalysisAvailable: true,
      fallbackReason:
        'Photorealistic AI outfit rendering requires a paid image-generation model key, which is currently disabled. Displaying an honest side-by-side comparison preview alongside live Gemini portrait styling analysis.',
      assessment: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/virtual-tryon:', error);
    const product = req.body?.product;
    res.json({
      synthesisAvailable: false,
      aiAnalysisAvailable: false,
      fallbackReason:
        'Photorealistic AI rendering is unavailable right now. Showing an honest side-by-side comparison preview.',
      assessment: {
        harmonySummary: `${product?.name || 'Selected attire'} pairs heritage craft with timeless celebratory presence.`,
        drapeTip: 'Balance heavy zari or embroidery borders with structured tailoring and complementary gold accents.',
        tailoringNote: 'Use our bespoke tailoring option for personalized neckline depth and sleeve fit.',
        occasionFit: 'Recommended for weddings, receptions, and sacred cultural gatherings.',
      },
    });
  }
});

/**
 * 2. AI Colour Combination Studio Endpoint
 * Analyzes uploaded design image or selected product with measured pixel colors and suggests
 * complementary/contrasting Indian fashion palettes (blouse, border, embroidery, accessories).
 */
aiRouter.post('/color-studio', async (req: Request, res: Response) => {
  try {
    const { imageBase64, dominantHexes, productName, material } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        isFallback: true,
        reason: 'Live AI color consultation unavailable; using computational color-wheel harmony.',
      });
      return;
    }

    const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.startsWith('data:image/')) {
      const { mimeType, data } = stripDataUrlPrefix(imageBase64);
      parts.push({ inlineData: { mimeType, data } });
    }

    parts.push({
      text: `You are an expert Indian textile colourist at MUDRA.
${productName ? `Garment: ${productName} (${material || 'Traditional Indian Wear'}).` : 'Analyze the attached fashion design image.'}
Measured pixel dominant hex colours: ${Array.isArray(dominantHexes) ? dominantHexes.join(', ') : 'Not supplied'}.

Generate 3 distinct, culturally authentic Indian couture colour combination palettes (e.g. Complementary Royal Contrast, Monochromatic Zari Elegance, Festive Jewel Harmony) tailored to this design.
For each palette provide:
- title (short palette name)
- mood (1 sentence explaining why this works)
- blouseColor: { name, hex }
- borderColor: { name, hex }
- embroideryColor: { name, hex }
- accessoryColor: { name, hex }
- jewelryMetalRecommendation (concise string, e.g. "22K Antique Temple Gold with Kempu Rubies")

Also provide dominantAnalysis (1-2 sentences describing the observed base palette).
Return strictly JSON.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dominantAnalysis: { type: Type.STRING },
            palettes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  blouseColor: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  },
                  borderColor: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  },
                  embroideryColor: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  },
                  accessoryColor: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } },
                  },
                  jewelryMetalRecommendation: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ isFallback: false, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/color-studio:', error);
    res.json({
      isFallback: true,
      reason: 'Using colour-wheel harmony fallback due to API unavailability.',
    });
  }
});

/**
 * 3. Interactive Design Customization Studio Endpoint
 * Generates an AI Master Weaver Atelier Specification & Preview Brief for the chosen options.
 */
aiRouter.post('/design-preview', async (req: Request, res: Response) => {
  try {
    const { product, selections } = req.body;
    if (!product || !selections) {
      res.status(400).json({ error: 'Product and customization selections are required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        isFallback: true,
        imageSynthesisAvailable: false,
        spec: {
          artisanTitle: `Bespoke ${selections.colorName} ${product.subcategory}`,
          craftSummary: `Custom configuration pairing ${selections.neckline} neckline and ${selections.sleeves} sleeves with ${selections.embroidery} needlework, ${selections.border} borders, and ${selections.pattern} motifs.`,
          weavingTechniqueNote: `Recommended execution on ${product.material} using balanced zari tension so the ${selections.border} border drapes cleanly.`,
          estimatedCraftingDays: '12–16 Artisan Days',
          stylingPairings: 'Pair with antique 22K temple jhumkas and a matching zardozi potli.',
        },
      });
      return;
    }

    const prompt = `You are a Master Textile Designer & Couturier at MUDRA Atelier.
A patron customized: "${product.name}" (${product.material}, ${product.subcategory}).
Selected customization options:
- Neckline: ${selections.neckline}
- Sleeves: ${selections.sleeves}
- Embroidery: ${selections.embroidery}
- Border Style: ${selections.border}
- Motif Pattern: ${selections.pattern}
- Primary Fabric Colour: ${selections.colorName} (${selections.colorHex})
- Accent Zari / Thread Colour: ${selections.accentColorName}

Write an authentic bespoke couture design brief explaining how these exact elements combine harmoniously, technical atelier construction notes, realistic crafting timeline, and jewelry/accessory pairing advice.
Return valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artisanTitle: { type: Type.STRING },
            craftSummary: { type: Type.STRING },
            weavingTechniqueNote: { type: Type.STRING },
            estimatedCraftingDays: { type: Type.STRING },
            stylingPairings: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({
      isFallback: false,
      imageSynthesisAvailable: false,
      spec: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/design-preview:', error);
    const { product, selections } = req.body || {};
    res.json({
      isFallback: true,
      imageSynthesisAvailable: false,
      spec: {
        artisanTitle: `Bespoke ${selections?.colorName || ''} ${product?.subcategory || 'Edition'}`.trim(),
        craftSummary: `Tailored with ${selections?.neckline} neckline, ${selections?.sleeves} sleeves, ${selections?.embroidery} embroidery, and ${selections?.border} borders featuring ${selections?.pattern} motifs.`,
        weavingTechniqueNote: 'Finished with breathable pure cotton lining and reinforced zari edge piping.',
        estimatedCraftingDays: '12–16 Artisan Days',
        stylingPairings: 'Complete the ensemble with antique gold temple ornaments.',
      },
    });
  }
});

/**
 * 4. Smart Fabric Identifier Endpoint
 * Analyzes uploaded fabric photograph using Gemini Vision (gemini-4-hydrogen).
 * Explicitly frames output as a visual estimate rather than lab fiber certification.
 */
aiRouter.post('/identify-fabric', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Fabric photograph is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        isFallback: true,
        reason: 'Live Gemini Vision API is unavailable on this server.',
      });
      return;
    }

    const { mimeType, data } = stripDataUrlPrefix(imageBase64);

    const prompt = `You are a textile conservator and master weaver analyzing a fabric photograph.
Inspect surface luster, specular sheen, drape fold stiffness, translucency, and visible yarn texture.
Classify the most likely fabric category among Indian & global textiles (such as Pure Mulberry Silk, Raw Silk, Organza / Kora Silk, Chiffon, Georgette, Cotton, Linen, Velvet, Chanderi Silk-Cotton, Tissue Zari, Brocade).

IMPORTANT: Clearly reflect in your wording that identification from a single photograph is a visual estimate (since blends and fiber authenticity require physical burn/microscopic testing).

Return strictly JSON with:
- fabricCategory: main category name (e.g. "Silk", "Cotton", "Linen", "Chiffon", "Georgette", "Velvet", "Organza")
- likelySubType: specific probable weave (e.g. "Pure Mulberry Katan Silk" or "Sheer Kora Organza")
- confidenceLevel: "High Visual Clarity" | "Moderate Visual Estimate" | "Low / Ambiguous Texture"
- visualCuesObserved: array of 3-4 short observations actually visible in the image (e.g. "Crisp translucent folds", "Directional satin luster")
- textureProfile: description of probable hand-feel, weight, and drape
- characteristics: array of 3-4 key properties (breathability, crease tendency, opacity, sheen)
- commonUses: array of 3-4 garment applications
- maintenanceInstructions: array of 3-4 practical care steps (washing, ironing temp, storage)
- estimateDisclaimer: concise honest reminder that photographic identification is an estimate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fabricCategory: { type: Type.STRING },
            likelySubType: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING },
            visualCuesObserved: { type: Type.ARRAY, items: { type: Type.STRING } },
            textureProfile: { type: Type.STRING },
            characteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
            commonUses: { type: Type.ARRAY, items: { type: Type.STRING } },
            maintenanceInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimateDisclaimer: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ isFallback: false, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/identify-fabric:', error);
    res.json({
      isFallback: true,
      reason: 'Gemini Vision service could not be reached; using optical pixel-texture fallback.',
    });
  }
});

/**
 * 5. Occasion-Based Fashion Planner Endpoint
 * Takes user occasion, style, color preference, budget, and top candidate products from catalog,
 * and returns personalized styling rationale per recommended product.
 */
aiRouter.post('/occasion-planner', async (req: Request, res: Response) => {
  try {
    const { occasion, style, colorPreference, budgetLabel, candidates } = req.body;
    const ai = getGeminiClient();

    if (!ai || !Array.isArray(candidates) || candidates.length === 0) {
      res.json({ isFallback: true, recommendations: [] });
      return;
    }

    const prompt = `You are a wardrobe planner at MUDRA Traditional Indian Fashion.
Customer preferences:
- Occasion: ${occasion}
- Preferred Style: ${style}
- Colour Preference: ${colorPreference}
- Budget Range: ${budgetLabel}

Here are the matching outfits from MUDRA's live catalog:
${JSON.stringify(candidates)}

For each product (keep the exact productId), write a crisp 1-2 sentence personalized explanation of WHY it suits this exact occasion, style, colour preference, and budget, plus a short styling tip (1 sentence).
Return strictly JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plannerIntro: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  stylingTip: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({
      isFallback: false,
      plannerIntro: parsed.plannerIntro,
      recommendations: parsed.recommendations || [],
    });
  } catch (error: any) {
    console.error('Error in /api/ai/occasion-planner:', error);
    res.json({ isFallback: true, recommendations: [] });
  }
});
