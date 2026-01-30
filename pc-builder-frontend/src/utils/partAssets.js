

const assetCounts = {
  cpu: 142,
  gpu: 154,
  ram: 226,
  storage: 262,
  motherboard: 241,
  powersupply: 12,
};

const hashToNumber = (input) => {
  if (!input) return 0;
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};



export const getPartImageUrl = (part) => {
  const categoryKey = part?.category?.toLowerCase();
  const count = assetCounts[categoryKey];
  if (!count) return null;
  const seedSource = part?._id || part?.id || part?.name || `${categoryKey}-fallback`;
  const index = (hashToNumber(seedSource) % count) + 1;
  
  // Handle different file extensions and directory names
  let extension = 'jpg';
  let directory = categoryKey;
  
  if (categoryKey === 'powersupply') {
    extension = 'jpeg';
    directory = 'psu'; // Use 'psu' directory instead of 'powersupply'
  }
  
  return `/assets/${directory}/${index}.${extension}`;
};

export const hasCategoryAsset = (category) => {
  const key = category?.toLowerCase();
  return Boolean(assetCounts[key]);
};

