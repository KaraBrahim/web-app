import { db } from './product.db';

// Extremely fast O(1) in-memory map as requested
// We use Object.create(null) to avoid prototype chain lookups
let productMap = Object.create(null);
let isLoaded = false;

export const loadProducts = async () => {
  try {
    const all = await db.getAll();
    const map = Object.create(null);

    // Hydrate memory map linearly, single pass
    for (const item of all) {
      map[item.id] = item.value;
    }

    productMap = map;
    isLoaded = true;
    return map;
  } catch (error) {
    console.error('Error loading products into memory:', error);
    return Object.create(null);
  }
};

/**
 * Returns the product data for a given barcode
 * @param {string} barcode
 * @returns {Array|null} Array format [product_name, price] or null if not found
 */
export const getProduct = (barcode) => {
  if (!barcode) return null;
  const str = String(barcode).trim();
  
  if (productMap[str]) return productMap[str];
  
  // Resilient handling: Excel often drops leading zeros from barcodes in CSVs
  const stripZeros = str.replace(/^0+/, '');
  if (productMap[stripZeros]) return productMap[stripZeros];
  
  // Vice versa, scanner might drop it
  if (productMap['0' + str]) return productMap['0' + str];
  if (str.length === 12 && productMap['0' + str]) return productMap['0' + str];

  return null;
};

// Expose full map for searching capabilities
export const getProductMap = () => productMap;

export const isDataReady = () => isLoaded;
