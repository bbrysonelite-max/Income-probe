import { useState, useEffect } from 'react';
import products from '../data/products.json';
import { LegInput, PersonalStats, SimulationResult } from '../types/types';

export function useSolvencyCalculator(personal: PersonalStats, legs: LegInput[], taxRate: number) {
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    // 1. Personal Gaps
    const dcGap = Math.max(0, 250 - personal.currentDCSV);
    const gsvGap = Math.max(0, 3000 - personal.currentGSV);
    const personalGap = Math.max(dcGap, gsvGap);

    // 2. Leg Gaps
    let legsGapTotal = 0;
    legs.forEach(leg => {
      const gap = Math.max(0, leg.targetGSV - leg.currentGSV);
      legsGapTotal += gap;
    });

    const totalGap = personalGap + legsGapTotal;

    // 3. Build Product Menu
    // Calculate needs for EVERY product, then sort by efficiency
    const productMenu = products.map(product => {
      const efficiency = product.memberPrice / product.sv;
      const theoreticalQty = totalGap > 0 ? Math.ceil(totalGap / product.sv) : 0;
      const theoreticalCost = theoreticalQty * product.memberPrice * (1 + (taxRate/100));
      
      return {
        product,
        efficiency,
        theoreticalQty,
        theoreticalCost
      };
    }).sort((a, b) => a.efficiency - b.efficiency);

    // 4. Best Case Cost (Top item)
    const costToFix = productMenu.length > 0 ? productMenu[0].theoreticalCost : 0;

    setResult({
      personalGap,
      legsGap: legsGapTotal,
      totalGap,
      costToFix,
      productMenu
    });

  }, [personal, legs, taxRate]);

  return result;
}
