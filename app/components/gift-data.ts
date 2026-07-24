export type Gift = {
  id: string;
  name: string;
  category: string;
  price: string;
  minPrice: number;
  description: string;
  reserved?: boolean;
  icon: string;
  imageUrl?: string;
  imageSourceUrl?: string;
};

export const gifts: Gift[] = [
  {
    id: "muslin-swaddles",
    name: "Muslin Swaddles",
    category: "Essentials",
    price: "AED 70–150",
    minPrice: 70,
    description: "Soft, breathable wraps for naps, cuddles, and everyday comfort.",
    icon: "☁️",
  },
  {
    id: "hooded-towels",
    name: "Hooded Towels",
    category: "Bath & Care",
    price: "AED 50–100",
    minPrice: 50,
    description: "A cozy set of gentle towels for warm post-bath snuggles.",
    icon: "🫧",
  },
  {
    id: "baby-bottle-set",
    name: "Baby Bottle Set",
    category: "Feeding",
    price: "AED 100–250",
    minPrice: 100,
    description: "An easy-to-clean starter set for the first months.",
    icon: "🍼",
  },
  {
    id: "newborn-bodysuits",
    name: "Newborn Bodysuits",
    category: "Clothing",
    price: "AED 60–150",
    minPrice: 60,
    description: "Comfortable everyday basics in soft, baby-friendly fabrics.",
    icon: "🧸",
  },
  {
    id: "thermometer",
    name: "Digital Thermometer",
    category: "Health",
    price: "AED 80–180",
    minPrice: 80,
    description: "A quick-read nursery essential for extra peace of mind.",
    icon: "🌡️",
    reserved: true,
  },
  {
    id: "storage-basket",
    name: "Nursery Storage Basket",
    category: "Nursery",
    price: "AED 70–180",
    minPrice: 70,
    description: "A beautiful catch-all for blankets, toys, and tiny essentials.",
    icon: "🧺",
  },
];
