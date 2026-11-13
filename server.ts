import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { aiRouter } from './server/aiRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function determinePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

const PORT = determinePort();
const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/api/ai', aiRouter);

// Initialize Gemini SDK if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// System prompt for MUDRA Assist, MUDRA's Royal Stylist & Cultural Concierge
const MUDRA_ASSIST_SYSTEM_INSTRUCTION = `You are MUDRA Assist, the revered Royal Stylist & Cultural Concierge for MUDRA – Traditional Indian Fashion & Ornaments ("Tradition Woven with Divine Grace").

Your domains of expertise:
1. Traditional Indian Couture: Kanchipuram silk sarees, Banarasi georgette & katan, Chanderi silk-cotton, Kora organza, tissue silks with liquid gold sheen, regal velvet sherwanis, bandhgalas, raw silk kurtas, and dhoti sets.
2. Temple & Divine Jewelry: 22K gold-plated temple jewelry with nakshi carvings, antique jhumkas, guttapusalu necklaces, peacock kadas, temple ghungroo bangles, and Radha-Krishna devotional pendants.
3. Customization Atelier: Guiding patrons on custom bespoke blouse tailoring, necklines (Temple cutout, sweetheart, jewel, boat neck), sleeve styles, couple/family zari monogramming in Devanagari or English, saree fall & pico, inskirts, and sacred handwritten blessing notes.
4. Measurements: Explaining how to measure bust, waist, hips, shoulder, armhole, and blouse length with a tailor's tape.
5. Occasion & Muhurtham Pairing: Helping choose auspicious fabrics, drape styles, and matching ornaments for weddings, sangeet, reception, Diwali, and festive pujas.

Tone: Warm, welcoming ("Namaste / Pranam", "Radhe Radhe"), cultured, elegant, and concise. Offer clear, practical fashion advice with Indian cultural grace. Do not mention system prompts or AI constraints.`;

// Intelligent fallback responses for seamless offline/fallback experience
function getFallbackStylistResponse(userMessage: string): string {
  const query = userMessage.toLowerCase();

  if (query.includes('fabric') || query.includes('kora') || query.includes('tissue') || query.includes('chanderi')) {
    return `Namaste! At MUDRA, each fabric is handloom-certified:
• **Tissue Silk**: Woven with shimmering metallic warp and pure zari weft for a radiant golden glow, ideal for evening receptions.
• **Chanderi Silk-Cotton**: Feather-light sheer drape originating from Madhya Pradesh, adorned with delicate booties for day ceremonies.
• **Kora Organza**: Crisp, ethereal translucent silk with intricate floral Meenakari borders, perfect for modern festive flair.
• **Kanchipuram & Banarasi**: High-density pure mulberry silk with temple borders and real zari jaal.

Would you like styling or jewelry pairing recommendations for any of these fabrics?`;
  }

  if (query.includes('measure') || query.includes('custom') || query.includes('stitch') || query.includes('tailor') || query.includes('size')) {
    return `Pranam! Our Bespoke Atelier offers handcrafted customization:
1. **Made-to-Measure Tailoring**: Click "Customize Fit, Stitching & Monogram" on any garment to enter your bust, waist, shoulder, armhole, and blouse length.
2. **Neckline & Sleeve Styling**: Choose from Temple Cutout, Sweetheart, Boat Neck, or Elbow Sleeves with Zari borders.
3. **Zari Monogramming**: Have couple initials or sacred mantras (in Sanskrit / Devanagari or English) hand-embroidered on the pallu or collar.
4. **Complete Finishing**: Add pure cotton matching inskirts and hand-stitched fall & pico (+₹349).

Would you like help with measuring your bust or shoulder dimensions?`;
  }

  if (query.includes('jewelry') || query.includes('bangle') || query.includes('jhumka') || query.includes('necklace') || query.includes('ornament')) {
    return `Radhe Radhe! For our ornaments and bangles:
• **Temple Kada Bangles**: Antique matte gold finish with intricate Radha-Krishna, peacock, and floral motifs.
• **Guttapusalu Necklaces**: Cascading freshwater pearl clusters woven with ruby-emerald gemstones.
• **Pairing Rule**: If wearing an opulent zari saree (like Kanchipuram or Banarasi), choose antique matte gold or guttapusalu. For lightweight Kora or Chanderi, pair with statement jhumkas and a delicate choker.

Are you looking for wedding muhurtham ornaments or festive daywear?`;
  }

  if (query.includes('order') || query.includes('delivery') || query.includes('track') || query.includes('shipping')) {
    return `Namaste! Every MUDRA creation is blessed and shipped with tamper-evident sacred packaging:
• **Standard Dispatch**: 3-5 business days across all Indian PIN codes.
• **Tracking**: You can track any order live using the "Track Order" link in our header with your order number.
• **Returns**: 7-day hassle-free return and exchange guarantee for all unworn standard creations.`;
  }

  return `Namaste and welcome to MUDRA – Tradition Woven with Divine Grace. I am MUDRA Assist, your personal stylist and cultural concierge. 

I can assist you with:
1. Matching fabrics (Tissue Silk, Kora Organza, Banarasi, Chanderi) with temple jewelry
2. Bespoke blouse & kurta tailoring measurements
3. Zari monogram inscription and customization details
4. Styling for weddings, receptions, and festivals

How may I assist your style journey today?`;
}

// POST /api/chat: MUDRA Divine Stylist AI Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    if (!aiClient) {
      // Graceful fallback when GEMINI_API_KEY is not configured yet
      const fallbackReply = getFallbackStylistResponse(message);
      res.json({ reply: fallbackReply, isFallback: true });
      return;
    }

    // Format chat contents for Gemini API
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role === 'user' || item.role === 'model') {
          formattedContents.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: MUDRA_ASSIST_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const text = response.text || getFallbackStylistResponse(message);
    res.json({ reply: text, isFallback: false });
  } catch (error: any) {
    console.error('Error in /api/chat Gemini request:', error);
    // Provide intelligent cultural stylist response even on network/rate-limit error
    const fallback = getFallbackStylistResponse(req.body?.message || '');
    res.json({
      reply: fallback,
      isFallback: true,
      errorNotice: error?.message ? 'Connected via offline stylist concierge' : undefined,
    });
  }
});

// Intelligent fallback responses for visual search matching
function getFallbackVisualSearchResult(sampleId?: string, hint?: string) {
  const normalizedHint = (hint || sampleId || '').toLowerCase();

  if (normalizedHint.includes('tissue') || normalizedHint.includes('shimmer') || normalizedHint.includes('gold-saree')) {
    return {
      detectedItem: 'Shweta Swarna Liquid Metallic Tissue Silk Saree',
      category: 'women' as const,
      subcategory: 'Tissue Sarees',
      fabrics: ['Liquid Gold Metallic Zari', 'Tissue Organza Silk'],
      colors: [
        { name: 'Champagne Gold', hex: '#F3E8CE' },
        { name: 'Antique Brass', hex: '#C59B27' },
        { name: 'Warm Ivory', hex: '#FAF5E8' },
      ],
      motifs: ['Metallic Warp & Weft', 'Scalloped Zari Pallu', 'Minimalist Royal Sheen'],
      occasion: 'Evening Sangeet & Royal Wedding Receptions',
      culturalAnalysis:
        'Celebrated for its liquid-gold drape that glimmers under festive lamps, this Tissue Silk combines lightweight modern fluidity with imperial Indian opulence.',
      stylingAdvice:
        'Complement with statement Vrindavan Mayur Jhumkas and an emerald cocktail ring. An elbow-sleeve velvet blouse creates a striking tactile contrast.',
      matchedProductIds: ['prod-013', 'prod-001', 'prod-017', 'prod-005', 'prod-016'],
      matchScores: { 'prod-013': 99, 'prod-001': 90, 'prod-017': 94, 'prod-005': 92, 'prod-016': 88 },
    };
  }

  if (normalizedHint.includes('kora') || normalizedHint.includes('organza') || normalizedHint.includes('pastel')) {
    return {
      detectedItem: 'Vrindavan Bagh Kora Organza Floral Handloom Saree',
      category: 'women' as const,
      subcategory: 'Kora Silk Sarees',
      fabrics: ['Crisp Kora Organza', 'Resham Meenakari Weave'],
      colors: [
        { name: 'Mint Ivory', hex: '#E8F5E9' },
        { name: 'Lotus Rose', hex: '#E57373' },
        { name: 'Soft Gold', hex: '#D4AF37' },
      ],
      motifs: ['Meenakari Flora', 'Lotus Petals', 'Gilded Zari Edge'],
      occasion: 'Morning Haldi, Mehendi & Spring Festivals',
      culturalAnalysis:
        'Crafted with fine sheer organza yarns that hold a regal structural silhouette, featuring intricate Meenakari floral creepers inspired by Vrindavan gardens.',
      stylingAdvice:
        'Style with delicate pearl guttapusalu studs or pastel meenakari bangles. Keep the blouse sleeveless or boat neck for a contemporary heritage look.',
      matchedProductIds: ['prod-014', 'prod-015', 'prod-017', 'prod-005', 'prod-016'],
      matchScores: { 'prod-014': 98, 'prod-015': 93, 'prod-017': 89, 'prod-005': 91, 'prod-016': 87 },
    };
  }

  if (normalizedHint.includes('sherwani') || normalizedHint.includes('men') || normalizedHint.includes('kurta')) {
    return {
      detectedItem: 'Rajvansh Embroidered Raw Silk & Velvet Sherwani Set',
      category: 'men' as const,
      subcategory: 'Sherwanis',
      fabrics: ['Pure Raw Silk', 'Royal Midnight Velvet', 'Gold Zardozi'],
      colors: [
        { name: 'Midnight Navy', hex: '#0C2B4E' },
        { name: 'Imperial Gold', hex: '#D4AF37' },
        { name: 'Warm Cream', hex: '#FAF5E8' },
      ],
      motifs: ['Embroidered Mughal Floral Jaal', 'Crown Buttons', 'Mandarin Zari Collar'],
      occasion: 'Groom Wedding Attire & Grand Barat',
      culturalAnalysis:
        'Echoes the majestic splendor of royal Indian darbars, tailored in structured raw silk with meticulous hand zardozi along the collar, cuffs, and chest placket.',
      stylingAdvice:
        'Pair with our Ivory Tussar Silk Dhoti Set or Churidar, embroidered silk mojaris, and a gold safa with a peacock feather kalgi.',
      matchedProductIds: ['prod-003', 'prod-011', 'prod-012', 'prod-006'],
      matchScores: { 'prod-003': 99, 'prod-011': 92, 'prod-012': 88, 'prod-006': 91 },
    };
  }

  if (normalizedHint.includes('bangle') || normalizedHint.includes('kada') || normalizedHint.includes('chuda') || normalizedHint.includes('jewelry') || normalizedHint.includes('ornament')) {
    return {
      detectedItem: 'Devi Nakshi 22K Gold-Plated Temple Kada Bangles',
      category: 'jewelry' as const,
      subcategory: 'Temple Bangles & Kadas',
      fabrics: ['22K Micro Gold Plated Brass', 'Kempu Cabochon Rubies', 'Freshwater Seed Pearls'],
      colors: [
        { name: 'Antique Temple Gold', hex: '#C59B27' },
        { name: 'Kempu Ruby Red', hex: '#9E1B32' },
        { name: 'Emerald Green', hex: '#1B4D3E' },
      ],
      motifs: ['Dancing Peacocks', 'Radha-Krishna Bas-Relief', 'Temple Ghungroos'],
      occasion: 'Bridal Muhurtham, Godh Bharai, Temple Festivals',
      culturalAnalysis:
        'Handcrafted by master goldsmiths specializing in nakshi temple bas-relief, recreating sacred temple sanctum carvings passed down through dynasties.',
      stylingAdvice:
        'Wear stacked between glass bangles or as standalone statement cuffs with a Kanchipuram or Banarasi bridal drape.',
      matchedProductIds: ['prod-016', 'prod-004', 'prod-005', 'prod-001'],
      matchScores: { 'prod-016': 99, 'prod-004': 94, 'prod-005': 91, 'prod-001': 89 },
    };
  }

  if (normalizedHint.includes('pendant') || normalizedHint.includes('spiritual') || normalizedHint.includes('krishna') || normalizedHint.includes('radha')) {
    return {
      detectedItem: 'Shree Krishna Flute & Peacock Feather Divine Pendant',
      category: 'spiritual' as const,
      subcategory: 'Radha-Krishna Pendants',
      fabrics: ['22K Micron Gold Dipped Brass', 'Vrindavan Enamel Meenakari'],
      colors: [
        { name: 'Peacock Feather Blue', hex: '#0F5C72' },
        { name: 'Sacred Gold', hex: '#D4AF37' },
      ],
      motifs: ['Divine Bansuri (Flute)', 'Mor Pankh (Peacock Feather)', 'Omkar / Lotus'],
      occasion: 'Daily Devotion, Festive Pujas, Spiritual Gifting',
      culturalAnalysis:
        'An emblem of transcendental grace, celebrating the divine flute melody that captivated the sacred groves of Vrindavan.',
      stylingAdvice:
        'Worn close to the heart on a gold rope chain or sacred black cord. Complements both traditional kurtas and festive sarees.',
      matchedProductIds: ['prod-006', 'prod-007', 'prod-004', 'prod-016'],
      matchScores: { 'prod-006': 98, 'prod-007': 92, 'prod-004': 88, 'prod-016': 85 },
    };
  }

  // Default: Heirloom Bridal Kanchipuram Saree match
  return {
    detectedItem: 'Mayur Zari Kanchipuram Pure Silk Bridal Saree',
    category: 'women' as const,
    subcategory: 'Kanchipuram Sarees',
    fabrics: ['Handloom Pure Mulberry Silk', 'Certified Silver-Gold Dipped Zari'],
    colors: [
      { name: 'Royal Crimson', hex: '#8B0000' },
      { name: 'Temple Gold', hex: '#D4AF37' },
      { name: 'Midnight Navy', hex: '#0C2B4E' },
    ],
    motifs: ['Mayil (Peacock)', 'Gopuram Temple Border', 'Zari Floral Jaal'],
    occasion: 'Muhurtham Wedding & Sacred Rituals',
    culturalAnalysis:
      'This attire displays authentic South Indian temple loom artistry, where dense silver-gold dipped zari creates sacred peacock motifs embodying eternal divine devotion.',
    stylingAdvice:
      'Pair with our 22K gold-plated Devi Nakshi Temple Kada Bangles and Guttapusalu necklace. For the blouse, customize with a sweetheart neckline and gold zardozi arm borders.',
    matchedProductIds: ['prod-001', 'prod-013', 'prod-016', 'prod-004', 'prod-017'],
    matchScores: { 'prod-001': 98, 'prod-013': 89, 'prod-016': 94, 'prod-004': 92, 'prod-017': 86 },
  };
}

// POST /api/visual-search: AI Drishti Visual Search Endpoint
app.post('/api/visual-search', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, sampleId, hint, catalogSummaries } = req.body;

    if (!imageBase64 && !sampleId) {
      res.status(400).json({ error: 'Image data or sample ID is required.' });
      return;
    }

    // If Gemini client is available and imageBase64 is provided
    if (aiClient && imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
      const validMime = mimeType || 'image/jpeg';

      const promptText = `You are MUDRA Assist, the revered AI visual fashion curator for MUDRA – Traditional Indian Fashion & Ornaments ("Tradition Woven with Divine Grace").
Examine this uploaded Indian attire or ornament photo in detail.
Identify:
1. Exact garment / ornament type (e.g. Saree, Lehenga, Kurta, Sherwani, Dhoti, Temple Kada Bangles, Jhumkas, Guttapusalu Necklace).
2. Primary category (one of: "women", "men", "jewelry", "spiritual").
3. Subcategory (e.g. "Kanchipuram Sarees", "Tissue Sarees", "Kora Silk Sarees", "Sherwanis", "Bangles", "Temple Jewelry").
4. Fabric or metal craftsmanship (e.g., Pure Kanchipuram Mulberry Silk, Chanderi, Kora Organza, Liquid Gold Tissue, 22K Gold Plated Brass, Velvet, Raw Silk).
5. Color palette: 2 to 4 prominent colors with name and approximate hex code.
6. Motifs: traditional Indian motifs observed (e.g., Peacock / Mayil, Lotus / Padma, Temple Border / Gopuram, Mango / Kalka, Zari Buttis).
7. Occasion: Recommended auspicious occasion (e.g., Muhurtham Wedding, Sangeet, Festive Pooja, Royal Reception).
8. Cultural analysis: 2-3 sentences explaining the historical, spiritual, and aesthetic significance of this attire.
9. Styling advice: Recommendations for matching jewelry, footwear, drape, or bespoke blouse customization.
10. Match candidate IDs from this available MUDRA catalog:
${JSON.stringify(
  catalogSummaries || [
    { id: 'prod-001', name: 'Mayur Zari Kanchipuram Pure Silk Bridal Saree', category: 'women', subcategory: 'Kanchipuram Sarees', fabric: 'Pure Mulberry Silk' },
    { id: 'prod-013', name: 'Shweta Swarna Liquid Metallic Tissue Silk Saree', category: 'women', subcategory: 'Tissue Sarees', fabric: 'Tissue Silk' },
    { id: 'prod-014', name: 'Vrindavan Bagh Kora Organza Handloom Saree', category: 'women', subcategory: 'Kora Silk Sarees', fabric: 'Kora Organza' },
    { id: 'prod-015', name: 'Chanderi Gold Bootti Floral Pastel Saree', category: 'women', subcategory: 'Chanderi Sarees', fabric: 'Chanderi Silk Cotton' },
    { id: 'prod-002', name: 'Radha Vilas Banarasi Katan Silk Lehenga Set', category: 'women', subcategory: 'Lehengas', fabric: 'Banarasi Katan Silk' },
    { id: 'prod-003', name: 'Rajvansh Embroidered Raw Silk Sherwani Set', category: 'men', subcategory: 'Sherwanis', fabric: 'Raw Silk & Velvet' },
    { id: 'prod-016', name: 'Devi Nakshi 22K Gold-Plated Temple Kada Bangles', category: 'jewelry', subcategory: 'Temple Bangles & Kadas', fabric: '22K Gold Plating' },
    { id: 'prod-004', name: 'Radha-Krishna Devotional Nakshi Temple Necklace', category: 'jewelry', subcategory: 'Temple Jewelry', fabric: '22K Gold Plating' },
    { id: 'prod-005', name: 'Vrindavan Mayur Royal Antique Jhumkas', category: 'jewelry', subcategory: 'Jhumkas', fabric: 'Antique Gold Plated' },
    { id: 'prod-006', name: 'Shree Krishna Flute & Peacock Feather Divine Pendant', category: 'spiritual', subcategory: 'Radha-Krishna Pendants', fabric: '22K Gold Dipped' },
    { id: 'prod-017', name: 'Royal Vrindavan Zardozi Bridal Potli with Pearl Handle', category: 'women', subcategory: 'Bridal Potlis & Accessories', fabric: 'Velvet & Pearls' },
  ]
)}

Respond with a strictly formatted JSON object matching this schema:
{
  "detectedItem": "string",
  "category": "women" | "men" | "jewelry" | "spiritual",
  "subcategory": "string",
  "fabrics": ["string"],
  "colors": [{"name": "string", "hex": "#string"}],
  "motifs": ["string"],
  "occasion": "string",
  "culturalAnalysis": "string",
  "stylingAdvice": "string",
  "matchedProductIds": ["string"],
  "matchScores": {"prod-xxx": 95}
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: validMime,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are MUDRA Assist, the AI visual fashion curator. Return ONLY valid JSON.',
        },
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          res.json({ result: parsed, isFallback: false });
          return;
        } catch (parseError) {
          console.warn('Failed to parse Gemini visual response JSON:', parseError);
        }
      }
    }

    // Fallback response generator if API key is unconfigured or request failed
    const fallbackResult = getFallbackVisualSearchResult(sampleId, hint);
    res.json({ result: fallbackResult, isFallback: true });
  } catch (error: any) {
    console.error('Error in /api/visual-search:', error);
    const fallbackResult = getFallbackVisualSearchResult(req.body?.sampleId, req.body?.hint);
    res.json({ result: fallbackResult, isFallback: true, errorNotice: error?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MUDRA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
