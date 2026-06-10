// REAL Phase-5 money-chart data, generated from sim/out/*.json. Regenerate when sim/out changes.
export type Scenario = {
  name: string; price: number[];
  series: { hodl: number[]; lp: number[]; senior: number[]; junior: number[] };
  seniorNav: number[]; juniorNav: number[]; scaleMax: number; epochs: number[];
};
export const SCENARIOS: Record<'calm' | 'trend' | 'crash', Scenario> = {"calm":{"name":"Calm","price":[3005.51,2959.29,2974.12,2974.12],"series":{"hodl":[100.0,99.23,99.48,99.48],"lp":[100.0,99.23,99.48,99.49],"senior":[100.0,100.0,100.0,100.0],"junior":[100.14,98.98,99.36,99.37]},"seniorNav":[6000,6000,6000,6000],"juniorNav":[12017,11878,11923,11924],"scaleMax":20000,"epochs":[0,1,2,3]},"trend":{"name":"Trend","price":[2668.86,2382.04,2071.9,1791.18],"series":{"hodl":[100.0,94.94,89.47,84.52],"lp":[100.0,94.48,88.12,81.94],"senior":[100.0,100.0,100.0,100.0],"junior":[91.49,83.68,74.69,65.94]},"seniorNav":[6000,6000,6000,6000],"juniorNav":[10979,10042,8963,7913],"scaleMax":18000,"epochs":[0,1,2,3]},"crash":{"name":"Crash","price":[2890.85,1674.44,2024.79],"series":{"hodl":[100.0,79.35,85.3],"lp":[100.0,76.13,83.75],"senior":[100.0,100.0,100.0],"junior":[97.25,62.11,73.32]},"seniorNav":[6000,6000,6000],"juniorNav":[11670,7453,8798],"scaleMax":18000,"epochs":[0,1,2]}};
export type ScenarioId = keyof typeof SCENARIOS;
