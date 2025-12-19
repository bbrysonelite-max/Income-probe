export interface Product {
  sku: string;
  name: string;
  memberPrice: number;
  sv: number; 
  cv: number; 
  isBundle: boolean;
}

export interface LegInput {
  id: number;
  name: string;
  currentGSV: number;
  targetGSV: number; 
  flexPoints?: number;
  flexReloadDate?: string;
}

export interface PersonalStats {
  currentDCSV: number; 
  currentGSV: number; 
}

export interface SimulationResult {
  personalGap: number;
  legsGap: number;
  totalGap: number;
  costToFix: number;
  productMenu: { 
    product: Product; 
    efficiency: number;
    theoreticalQty: number; 
    theoreticalCost: number;
  }[];
}
