export interface StarData {
  id: string;
  name: string;
  type: StarType;
  temperature: number;
  sizeRatio: number; // Compared to the Sun
  luminosity: number;
  lifespan: string;
  funFact: string;
  location: {
    galaxy: string;
    region: string;
    distanceFromEarth: string;
    distanceLightYears: number;
    constellation?: string; 
  };
  hasOrbitingBodies: boolean;
  orbitingBodies: OrbitingBody[];
  generatedAt: Date | string;

  realStar?:boolean; 
  catalogId?:string;
  mass?:number;
  spectralType?:string;
};





export interface OrbitingBody {
  name: string;
  type: "planet" | "asteroid" | "dwarf-planet" | "moon";
  orbitRadius: number;
  color: string;
}

export type StarType =
  | "Red Dwarf"
  | "Orange Dwarf"
  | "Yellow Dwarf"
  | "White Dwarf"
  | "Blue Giant"
  | "Red Giant"
  | "Neutron Star"
  | "Blue Supergiant"
  | "Red Supergiant";

const starPrefixes = [
  "Astra",
  "Nova",
  "Celeste",
  "Orion",
  "Lyra",
  "Vega",
  "Sirius",
  "Polaris",
  "Altair",
  "Rigel",
  "Betel",
  "Castor",
  "Procyon",
  "Antares",
  "Aldebaran",
  "Arcturus",
  "Capella",
  "Deneb",
  "Fomalhaut",
  "Spica",
];

const starSuffixes = [
  "Prime",
  "Major",
  "Minor",
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
  "Rho",
];

const galaxies = [
  "Milky Way",
  "Andromeda",
  "Triangulum",
  "Large Magellanic Cloud",
  "Small Magellanic Cloud",
  "Dwarf Spheroidal Galaxy",
];

const regions = [
  "Orion Arm",
  "Perseus Arm",
  "Sagittarius Arm",
  "Galactic Core",
  "Galactic Halo",
  "Outer Rim",
  "Carina-Sagittarius Arm",
  "Scutum-Centaurus Arm",
];

const funFacts: Record<StarType, string[]> = {
  "Red Dwarf": [
    "Red dwarfs are the most common stars in our galaxy, making up about 70% of all stars.",
    "These patient stars can burn for trillions of years, far outliving our Sun.",
    "Despite their abundance, no red dwarf is visible to the naked eye from Earth.",
    "Red dwarfs are so efficient with their fuel that they fully convect, mixing fresh hydrogen throughout.",
  ],
  "Orange Dwarf": [
    "Orange dwarfs are considered ideal for hosting life-bearing planets due to their stability.",
    "These stars can live for 15-30 billion years, giving plenty of time for life to evolve.",
    "Alpha Centauri B, one of our closest stellar neighbors, is an orange dwarf.",
    "Their gentle radiation makes them perfect candidates for habitable zone planets.",
  ],
  "Yellow Dwarf": [
    "Our Sun is a yellow dwarf, placing us in a cosmic sweet spot for life.",
    "Yellow dwarfs fuse hydrogen into helium at their cores at about 15 million degrees.",
    "In about 5 billion years, yellow dwarfs expand into red giants.",
    "These stars emit the perfect balance of light and heat for complex chemistry.",
  ],
  "White Dwarf": [
    "White dwarfs are the dense remnants of stars that have exhausted their fuel.",
    "A teaspoon of white dwarf material would weigh about 5.5 tons on Earth.",
    "These stellar corpses slowly cool over billions of years into black dwarfs.",
    "White dwarfs are roughly the size of Earth but contain a star's worth of mass.",
  ],
  "Blue Giant": [
    "Blue giants burn so hot and bright that they live fast and die young.",
    "These massive stars can be 10,000 times more luminous than our Sun.",
    "The intense radiation from blue giants can shape entire nebulae around them.",
    "Blue giants often end their lives as spectacular supernovae.",
  ],
  "Red Giant": [
    "When stars like our Sun run low on hydrogen, they swell into red giants.",
    "Red giants can grow to hundreds of times their original size.",
    "Our Sun will become a red giant in about 5 billion years, possibly engulfing Earth.",
    "These bloated stars are so large that entire planetary orbits could fit inside them.",
  ],
  "Neutron Star": [
    "Neutron stars are so dense that a sugar-cube worth would weigh a billion tons.",
    "These stellar remnants spin incredibly fast, some rotating hundreds of times per second.",
    "The gravity on a neutron star is about 2 billion times stronger than on Earth.",
    "Neutron stars have magnetic fields trillions of times stronger than Earth's.",
  ],
  "Blue Supergiant": [
    "Blue supergiants are among the most luminous objects in the universe.",
    "These cosmic beacons can be seen across vast intergalactic distances.",
    "Blue supergiants burn through their fuel in just a few million years.",
    "Rigel in the constellation Orion is a famous blue supergiant, visible worldwide.",
  ],
  "Red Supergiant": [
    "Betelgeuse, the famous red supergiant, could fit over a billion Suns inside it.",
    "Red supergiants are so large that light takes hours to cross their diameter.",
    "These dying giants shed vast amounts of material into space, seeding future stars.",
    "When red supergiants die, they create the elements necessary for planets and life.",
  ],
};

const planetPrefixes = ["Terra", "Aqua", "Ignis", "Ventus", "Petra", "Luna", "Frost", "Ember", "Dust", "Storm"];

function generateStarName(): string {
  const prefix = starPrefixes[Math.floor(Math.random() * starPrefixes.length)];
  const suffix = starSuffixes[Math.floor(Math.random() * starSuffixes.length)];
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${prefix}-${number} ${suffix}`;
}

function generateStarType(): StarType {
  const rand = Math.random();
  if (rand < 0.35) return "Red Dwarf";
  if (rand < 0.50) return "Orange Dwarf";
  if (rand < 0.65) return "Yellow Dwarf";
  if (rand < 0.75) return "White Dwarf";
  if (rand < 0.82) return "Red Giant";
  if (rand < 0.89) return "Blue Giant";
  if (rand < 0.94) return "Red Supergiant";
  if (rand < 0.98) return "Blue Supergiant";
  return "Neutron Star";
}

function getStarProperties(type: StarType): {
  temperature: number;
  sizeRatio: number;
  luminosity: number;
  lifespan: string;
} {
  switch (type) {
    case "Red Dwarf":
      return {
        temperature: 2500 + Math.random() * 1500,
        sizeRatio: 0.1 + Math.random() * 0.4,
        luminosity: 0.001 + Math.random() * 0.05,
        lifespan: `${Math.floor(50 + Math.random() * 150)} trillion years`,
      };
    case "Orange Dwarf":
      return {
        temperature: 4000 + Math.random() * 1000,
        sizeRatio: 0.7 + Math.random() * 0.2,
        luminosity: 0.2 + Math.random() * 0.4,
        lifespan: `${Math.floor(15 + Math.random() * 15)} billion years`,
      };
    case "Yellow Dwarf":
      return {
        temperature: 5000 + Math.random() * 1000,
        sizeRatio: 0.8 + Math.random() * 0.4,
        luminosity: 0.6 + Math.random() * 1,
        lifespan: `${Math.floor(8 + Math.random() * 4)} billion years`,
      };
    case "White Dwarf":
      return {
        temperature: 8000 + Math.random() * 32000,
        sizeRatio: 0.008 + Math.random() * 0.012,
        luminosity: 0.001 + Math.random() * 0.1,
        lifespan: "Cooling for eternity",
      };
    case "Red Giant":
      return {
        temperature: 3000 + Math.random() * 2000,
        sizeRatio: 10 + Math.random() * 90,
        luminosity: 100 + Math.random() * 900,
        lifespan: `${Math.floor(100 + Math.random() * 900)} million years`,
      };
    case "Blue Giant":
      return {
        temperature: 10000 + Math.random() * 20000,
        sizeRatio: 5 + Math.random() * 15,
        luminosity: 1000 + Math.random() * 9000,
        lifespan: `${Math.floor(10 + Math.random() * 90)} million years`,
      };
    case "Red Supergiant":
      return {
        temperature: 3000 + Math.random() * 1500,
        sizeRatio: 200 + Math.random() * 800,
        luminosity: 10000 + Math.random() * 90000,
        lifespan: `${Math.floor(5 + Math.random() * 15)} million years`,
      };
    case "Blue Supergiant":
      return {
        temperature: 20000 + Math.random() * 30000,
        sizeRatio: 15 + Math.random() * 35,
        luminosity: 50000 + Math.random() * 450000,
        lifespan: `${Math.floor(5 + Math.random() * 25)} million years`,
      };
    case "Neutron Star":
      return {
        temperature: 600000 + Math.random() * 400000,
        sizeRatio: 0.00001,
        luminosity: 0.1 + Math.random() * 0.9,
        lifespan: "Billions of years",
      };
  }
}

function generateOrbitingBodies(): OrbitingBody[] {
  const count = Math.floor(Math.random() * 5);
  if (count === 0) return [];

  const bodies: OrbitingBody[] = [];
  const colors = ["#a8d5ba", "#d4a5a5", "#a5c4d4", "#d4cfa5", "#c4a5d4", "#d4b5a5"];

  for (let i = 0; i < count; i++) {
    const types: OrbitingBody["type"][] = ["planet", "asteroid", "dwarf-planet"];
    bodies.push({
      name: `${planetPrefixes[Math.floor(Math.random() * planetPrefixes.length)]}-${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      orbitRadius: 50 + i * 30 + Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  return bodies;
}

export function generateStar(): StarData {
  const type = generateStarType();
  const properties = getStarProperties(type);
  const facts = funFacts[type];
  const orbitingBodies = generateOrbitingBodies();
  const distanceLightYears = Math.floor(Math.random() * 100000) + 10;

  return {
    id: `star-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: generateStarName(),
    type,
    temperature: Math.round(properties.temperature),
    sizeRatio: Math.round(properties.sizeRatio * 100) / 100,
    luminosity: Math.round(properties.luminosity * 100) / 100,
    lifespan: properties.lifespan,
    funFact: facts[Math.floor(Math.random() * facts.length)],
    location: {
      galaxy: galaxies[Math.floor(Math.random() * galaxies.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      distanceFromEarth:
        distanceLightYears > 1000
          ? `${(distanceLightYears / 1000).toFixed(1)}k light years`
          : `${distanceLightYears} light years`,
      distanceLightYears,
    },
    hasOrbitingBodies: orbitingBodies.length > 0,
    orbitingBodies,
    generatedAt: new Date(),
  };
}

// Generate a daily star based on the date
export function generateDailyStar(): StarData {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Use seeded random for consistency
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const rand = seededRandom(seed);
  let type: StarType;
  if (rand < 0.35) type = "Red Dwarf";
  else if (rand < 0.50) type = "Orange Dwarf";
  else if (rand < 0.65) type = "Yellow Dwarf";
  else if (rand < 0.75) type = "White Dwarf";
  else if (rand < 0.82) type = "Red Giant";
  else if (rand < 0.89) type = "Blue Giant";
  else if (rand < 0.94) type = "Red Supergiant";
  else if (rand < 0.98) type = "Blue Supergiant";
  else type = "Neutron Star";

  const properties = getStarProperties(type);
  const facts = funFacts[type];
  const distanceLightYears = Math.floor(seededRandom(seed + 1) * 100000) + 10;

  const prefix = starPrefixes[Math.floor(seededRandom(seed + 2) * starPrefixes.length)];
  const suffix = starSuffixes[Math.floor(seededRandom(seed + 3) * starSuffixes.length)];

  return {
    id: `daily-${seed}`,
    name: `${prefix}-${seed % 9999} ${suffix}`,
    type,
    temperature: Math.round(properties.temperature),
    sizeRatio: Math.round(properties.sizeRatio * 100) / 100,
    luminosity: Math.round(properties.luminosity * 100) / 100,
    lifespan: properties.lifespan,
    funFact: facts[Math.floor(seededRandom(seed + 4) * facts.length)],
    location: {
      galaxy: galaxies[Math.floor(seededRandom(seed + 5) * galaxies.length)],
      region: regions[Math.floor(seededRandom(seed + 6) * regions.length)],
      distanceFromEarth:
        distanceLightYears > 1000
          ? `${(distanceLightYears / 1000).toFixed(1)}k light years`
          : `${distanceLightYears} light years`,
      distanceLightYears,
    },
    hasOrbitingBodies: seededRandom(seed + 7) > 0.4,
    orbitingBodies: [],
    generatedAt: today,
  };
}
