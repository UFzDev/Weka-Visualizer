/**
 * Weka Visualizer - Regex Parsing Engine 
 * V3: Soporte inteligente para algoritmos mapeados (InputMappedClassifier).
 */

export interface ClassMetrics {
  className: string;
  tpRate: number;
  fpRate: number;
  precision: number;
  recall: number;
  fMeasure: number;
  mcc: number;
  rocArea: number;
  prcArea: number;
}

export interface WekaParsedData {
  algorithm: string;
  buildTime: number;
  testTime: number;
  summary: {
    correctlyClassified: number;
    incorrectlyClassified: number;
    kappa: number;
    mae: number;
    rmse: number;
    totalInstances: number;
  };
  detailedAccuracy: ClassMetrics[];
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
}

const extractAlgorithmName = (schemeLine: string): string => {
  // Caso 1: InputMappedClassifier con flag -W
  const wrappedMatch = schemeLine.match(/-W\s+([\w.]+)/);
  if (wrappedMatch) {
    const fullPath = wrappedMatch[1];
    return fullPath.split('.').pop() || fullPath;
  }

  // Caso 2: Path directo (weka.classifiers.X.Algorithm)
  const directPath = schemeLine.split(/\s+/)[0];
  return directPath.split('.').pop() || directPath;
};

export const parseWekaOutput = (text: string): WekaParsedData | null => {
  if (!text.trim()) return null;

  try {
    // 1. Meta Data (Algorithm & Time)
    const schemeMatch = text.match(/Scheme:\s+(.*)/i);
    const algorithm = schemeMatch ? extractAlgorithmName(schemeMatch[1]) : "Unknown Algorithm";

    const buildTimeMatch = text.match(/Time taken to build model:\s*([\d.]+)\s*seconds/i);
    const testTimeMatch = text.match(/Time taken to test model on [\w\s]+:\s*([\d.]+)\s*seconds/i);

    const buildTime = parseFloat(buildTimeMatch?.[1] || "0");
    const testTime = parseFloat(testTimeMatch?.[1] || "0");

    // 2. Parse Summary
    const correctMatch = text.match(/Correctly Classified Instances\s+(\d+)\s+([\d.,]+)\s*%/i);
    const incorrectMatch = text.match(/Incorrectly Classified Instances\s+(\d+)\s+([\d.,]+)\s*%/i);
    const kappaMatch = text.match(/Kappa statistic\s+([\d.,-]+)/i);
    const maeMatch = text.match(/Mean absolute error\s+([\d.,-]+)/i);
    const rmseMatch = text.match(/Root mean squared error\s+([\d.,-]+)/i);
    const totalMatch = text.match(/Total Number of Instances\s+(\d+)/i);

    if (!correctMatch || !totalMatch) return null;

    const parseNum = (s: string) => parseFloat(s.replace(",", "."));

    const summary = {
      correctlyClassified: parseNum(correctMatch[2]),
      incorrectlyClassified: parseNum(incorrectMatch?.[2] || "0"),
      kappa: parseNum(kappaMatch?.[1] || "0"),
      mae: parseNum(maeMatch?.[1] || "0"),
      rmse: parseNum(rmseMatch?.[1] || "0"),
      totalInstances: parseInt(totalMatch[1]),
    };

    // 3. Parse Detailed Accuracy by Class
    const detailedAccuracy: ClassMetrics[] = [];
    const tableRegex = /Detailed Accuracy By Class\s*===?\s*([\s\S]*?)(?:Weighted Avg\.|===|Confusion Matrix)/i;
    const tableMatch = text.match(tableRegex);

    if (tableMatch) {
      const tableContent = tableMatch[1];
      const rows = tableContent.split("\n").filter(line => line.trim().match(/^([\d.,]+|\?)\s+/));
      rows.forEach(row => {
        const parts = row.trim().split(/\s+/);
        // Weka suele tener 8 métricas antes del nombre de la clase
        if (parts.length >= 7) {
          const parseVal = (s: string) => {
            if (s === "?") return 0;
            const normalized = s.replace(",", ".");
            return parseFloat(normalized);
          };
          detailedAccuracy.push({
            tpRate: parseVal(parts[0]),
            fpRate: parseVal(parts[1]),
            precision: parseVal(parts[2]),
            recall: parseVal(parts[3]),
            fMeasure: parseVal(parts[4]),
            mcc: parts.length > 7 ? parseVal(parts[5]) : 0,
            rocArea: parts.length > 8 ? parseVal(parts[6]) : 0,
            prcArea: parts.length > 9 ? parseVal(parts[7]) : 0,
            className: parts.slice(parts.length > 8 ? 8 : 7).join(" "),
          });
        }
      });
    }

    // 4. Parse Confusion Matrix
    let confusionMatrix: { labels: string[]; matrix: number[][] } = { labels: [], matrix: [] };
    const matrixRegex = /Confusion Matrix[\s\S]*?(\s+a\s+b[\s\S]*)/i;
    const matrixMatch = text.match(matrixRegex);

    if (matrixMatch) {
      const lines = matrixMatch[1].trim().split("\n");
      const dataLines = lines.slice(1);
      
      const matrix: number[][] = [];
      const labels: string[] = [];

      dataLines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pipeIndex = parts.indexOf("|");
        if (pipeIndex !== -1) {
          const row = parts.slice(0, pipeIndex).map(v => parseInt(v));
          matrix.push(row);
          labels.push(parts.slice(pipeIndex + 1).join(" ").split("=")[1]?.trim() || parts[pipeIndex+1]);
        }
      });
      
      confusionMatrix = { labels, matrix };
    }

    return { algorithm, buildTime, testTime, summary, detailedAccuracy, confusionMatrix };
  } catch (error) {
    console.error("Error parsing Weka output:", error);
    return null;
  }
};
