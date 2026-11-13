export type HeritageCategory =
  | 'all'
  | 'handloom-silk'
  | 'resist-dye'
  | 'painted-printed'
  | 'heritage-embroidery';

export interface TextileHeritageItem {
  id: string;
  name: string;
  region: string;
  state: string;
  category: Exclude<HeritageCategory, 'all'>;
  categoryLabel: string;
  giTagStatus: string;
  technique: string;
  fabricCharacteristics: string;
  culturalSignificance: string;
  signatureMotifs: string[];
  imageUrl: string;
  accentHex: string;
  relatedProductIds: string[];
  recommendedSearchQuery: string;
}

export const TEXTILE_HERITAGE_ITEMS: TextileHeritageItem[] = [
  {
    id: 'banarasi-silk',
    name: 'Banarasi Kadhwa & Zari Silk',
    region: 'Varanasi (Kashi)',
    state: 'Uttar Pradesh',
    category: 'handloom-silk',
    categoryLabel: 'Royal Handloom Silks',
    giTagStatus: 'GI Protected Heritage Craft (2009)',
    technique:
      'Extra-weft brocade weaving on pit looms using the painstaking Kadhwa technique, where each floral motif (buta) is individually interlocked with pure silver-gold dipped zari threads without loose floats at the back.',
    fabricCharacteristics:
      'Regal medium-heavyweight Katan or Kora silk with dense metallic brocade luster, crisp sculptural pleats, and heirloom longevity spanning generations.',
    culturalSignificance:
      'Woven along the sacred ghats of the Ganga, a Banarasi saree forms the ceremonial heart of Indian bridal trousseaus and symbolizes auspicious prosperity (Saubhagya).',
    signatureMotifs: ['Shikargah (Royal Forest)', 'Jangla Floral Jaal', 'Jhalar Temple Border', 'Kalga Paisley'],
    imageUrl: '/images/banarasi_silk_saree_1793794026510.jpg',
    accentHex: '#9E1B32',
    relatedProductIds: ['prod-002', 'prod-006', 'prod-014'],
    recommendedSearchQuery: 'Banarasi',
  },
  {
    id: 'kanchipuram-silk',
    name: 'Kanchipuram Korvai Mulberry Silk',
    region: 'Kanchipuram',
    state: 'Tamil Nadu',
    category: 'handloom-silk',
    categoryLabel: 'Royal Handloom Silks',
    giTagStatus: 'GI Certified Handloom (2005)',
    technique:
      'Three-shuttle Korvai weaving operated by two weavers in unison — interlocking a contrast solid border and heavy temple pallu onto a 3-ply twisted mulberry silk body so the joint never tears.',
    fabricCharacteristics:
      'Substantial 3-ply pure mulberry silk weighing 750–950g with unmistakable pure gold-dipped silver zari shine and rigid, architectural temple borders.',
    culturalSignificance:
      'Celebrated in South Indian temples as divine offering attire to deities, Kanchipuram weaves echo Pallava temple gopurams, yalis, and dancing peacocks.',
    signatureMotifs: ['Mayil Chakram (Peacock)', 'Temple Gopuram', 'Rudraksham', 'Annapakshi (Mythical Swan)'],
    imageUrl: '/images/mudra_women_kanchipuram_saree_1793641347386.jpg',
    accentHex: '#8B0000',
    relatedProductIds: ['prod-001', 'prod-013'],
    recommendedSearchQuery: 'Kanchipuram',
  },
  {
    id: 'pochampally-ikat',
    name: 'Pochampally Double & Single Ikat',
    region: 'Bhoodan Pochampally',
    state: 'Telangana',
    category: 'resist-dye',
    categoryLabel: 'Resist-Dyed Traditions',
    giTagStatus: 'UNESCO Tentative Heritage & GI Tag (2005)',
    technique:
      'Tie-and-dye resist mathematics applied directly to yarn bundles (warp, weft, or both) BEFORE weaving begins. Master dyers bind threads tightly in calculated geometric stages so feathered motifs align automatically on the loom.',
    fabricCharacteristics:
      'Distinctive feathered "bleeding" geometric edges in breathable silk, cotton, or sico blends with identical vivid color clarity on both faces of the cloth.',
    culturalSignificance:
      'Known as the Silk City of India, Pochampally’s geometric diamonds and step-weaves represent mathematical precision passed orally across Padmashali weaver guilds.',
    signatureMotifs: ['Telia Rumal Diamonds', 'Navaratna Lattice', 'Concentric Step Geometry', 'Feathered Chevron'],
    imageUrl: '/images/chanderi_silk_saree_1793794041755.jpg',
    accentHex: '#0F5C72',
    relatedProductIds: ['prod-005', 'prod-004'],
    recommendedSearchQuery: 'Silk',
  },
  {
    id: 'kalamkari',
    name: 'Srikalahasti & Machilipatnam Kalamkari',
    region: 'Srikalahasti & Machilipatnam',
    state: 'Andhra Pradesh',
    category: 'painted-printed',
    categoryLabel: 'Hand-Painted & Block Art',
    giTagStatus: 'GI Certified Craft (Srikalahasti & Pedana)',
    technique:
      'Freehand narrative drawing using a sharpened bamboo pen (kalam) dipped in fermented jaggery-iron liquor (Srikalahasti) or hand-carved teak block printing (Machilipatnam) followed by boiling with madder root, indigo, and myrobalan.',
    fabricCharacteristics:
      'Unbleached cotton or raw tussar infused with cow milk before painting to prevent dye spread — yielding earthy indigo, rust madder, charcoal, and mustard botanical tones.',
    culturalSignificance:
      'Historically crafted as sacred temple hangings (Pattam) depicting scenes from the Ramayana, Mahabharata, and Radha-Krishna Rasaleela.',
    signatureMotifs: ['Tree of Life', 'Kadamba Blossom', 'Lotus Pond', 'Epic Chariot Friezes'],
    imageUrl: '/images/mudra_women_organza_floral_lehenga_1794502801.png',
    accentHex: '#A85350',
    relatedProductIds: ['prod-029', 'prod-030', 'prod-012'],
    recommendedSearchQuery: 'Floral',
  },
  {
    id: 'chikankari',
    name: 'Lucknowi Shadow-Work Chikankari',
    region: 'Lucknow (Awadh)',
    state: 'Uttar Pradesh',
    category: 'heritage-embroidery',
    categoryLabel: 'Sacred Needle & Zari Craft',
    giTagStatus: 'GI Registered Craft (2008)',
    technique:
      'Delicate white-on-pastel hand embroidery spanning 32 documented stitches — notably Bakhiya (shadow work stitched on the reverse of sheer cloth), Phanda (millet-knot rosebuds), and Jaali (drawn-thread latticework without cutting yarns).',
    fabricCharacteristics:
      'Airy, breathable translucent drapes on malmal cotton, Chanderi silk, or Kora organza where light filters gently through recessed shadow stitches.',
    culturalSignificance:
      'Refined in the royal courts of Awadh, Chikankari embodies poised summer elegance, quiet devotion, and poetic subtlety across menswear kurtas and bridal organzas.',
    signatureMotifs: ['Kairi (Mango Paisley)', 'Ghas Patti Grass', 'Muree Rice Stitch', 'Tepchi Running Vine'],
    imageUrl: '/images/mudra_kora_organza_saree_1793643995592.jpg',
    accentHex: '#8C7A58',
    relatedProductIds: ['prod-004', 'prod-012'],
    recommendedSearchQuery: 'Kora',
  },
  {
    id: 'chanderi-silk',
    name: 'Chanderi Sheer Silk-Cotton Weave',
    region: 'Chanderi',
    state: 'Madhya Pradesh',
    category: 'handloom-silk',
    categoryLabel: 'Royal Handloom Silks',
    giTagStatus: 'GI Protected (2005)',
    technique:
      'Weaving ultra-fine non-degummed raw silk warp with combed cotton or silk weft on throw-shuttle looms, inserting hand-picked metallic gold coin butis (Asharfi) using double needle shuttles.',
    fabricCharacteristics:
      'Famous for its luminous "shimmering transparency" and crisp featherlight gossamer feel that holds airy temple silhouettes effortlessly.',
    culturalSignificance:
      'Patronized since Vedic and royal Bundela times for temple ceremonies and sunlit festive gatherings where lightness meets metallic nobility.',
    signatureMotifs: ['Asharfi Gold Coin', 'Nalferma', 'Dandidar Stripes', 'Chatai Mat Border'],
    imageUrl: '/images/chanderi_anarkali_suit_1793794151720.jpg',
    accentHex: '#164E43',
    relatedProductIds: ['prod-005', 'prod-007'],
    recommendedSearchQuery: 'Chanderi',
  },
  {
    id: 'patan-patola',
    name: 'Patan Double Ikat Patola',
    region: 'Patan',
    state: 'Gujarat',
    category: 'resist-dye',
    categoryLabel: 'Resist-Dyed Traditions',
    giTagStatus: 'GI Registered (2013)',
    technique:
      'The pinnacle of resist dyeing: BOTH warp and weft silk threads are tied and dyed separately in up to 5 natural dye baths before an arduous handloom alignment taking 4 to 9 months per sari.',
    fabricCharacteristics:
      'Reversible satin-smooth silk with razor-sharp pixel-like geometric precision and natural botanical pigments that remain luminous for centuries.',
    culturalSignificance:
      'Revered as sacred protective cloth during auspicious Gujarati and royal ceremonies, bearing prosperity icons of elephants (Kunjar) and parrots (Popat).',
    signatureMotifs: ['Navratna Nine-Gem', 'Popat-Kunjar (Parrot & Elephant)', 'Pan Bhat (Pipal Leaf)', 'Fulwali Flower'],
    imageUrl: '/images/mudra_tissue_silk_saree_1793643995228.jpg',
    accentHex: '#D4AF37',
    relatedProductIds: ['prod-003', 'prod-001'],
    recommendedSearchQuery: 'Tissue',
  },
  {
    id: 'zardozi-couture',
    name: 'Khatri Bandhani & Mughal Zardozi',
    region: 'Kutch, Jaipur & Agra',
    state: 'Gujarat & Rajasthan',
    category: 'heritage-embroidery',
    categoryLabel: 'Sacred Needle & Zari Craft',
    giTagStatus: 'GI Protected Regional Handcrafts',
    technique:
      'Hand-pinched fingernail resist knots (Bandhej) paired with Adda-frame couching of coiled metallic bullion wires (Dabka, Nakshi), real pearls, and semi-precious gemstones known as Zardozi.',
    fabricCharacteristics:
      'Raised three-dimensional metallic relief over silk velvet, raw silk, or sheer floral organza creating luminous light-play for evening mandaps.',
    culturalSignificance:
      'Bridal red Bandhani dots symbolize fertility and joy, while sculptural Zardozi crowns ceremonial wedding sherwanis, royal achkans, and heirloom potlis.',
    signatureMotifs: ['Chandrokhani Moon Dots', 'Zardozi Lotus', 'Morpankh Crest', 'Shikargah Arch'],
    imageUrl: '/images/mudra_men_organza_floral_achkan_sherwani_1794502802.png',
    accentHex: '#0C2B4E',
    relatedProductIds: ['prod-030', 'prod-008', 'prod-010', 'prod-011'],
    recommendedSearchQuery: 'Zardozi',
  },
];
