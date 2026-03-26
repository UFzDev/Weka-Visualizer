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
    rae: number;
    rrse: number;
    correlationCoefficient: number;
    totalInstances: number;
  };
  weightedAvg?: {
    tpRate: number;
    fpRate: number;
    precision: number;
    recall: number;
    fMeasure: number;
    mcc: number;
    rocArea: number;
    prcArea: number;
  };
  detailedAccuracy: ClassMetrics[];
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
}

const extractAlgorithmName = (schemeLine: string): string => {
  const parts = schemeLine.split(/\s+/);
  const mainClass = parts[0].split('.').pop() || parts[0];

  if (mainClass === 'InputMappedClassifier') {
    // Buscamos el parámetro -W que sea una clase (que empiece con letra, no un número)
    const wrappedMatch = schemeLine.match(/-W\s+([a-zA-Z][\w.]+)/);
    if (wrappedMatch) {
      const fullPath = wrappedMatch[1];
      return fullPath.split('.').pop() || fullPath;
    }
  }

  return mainClass;
};

export const parseWekaOutput = (text: string): WekaParsedData | null => {
  if (!text.trim()) return null;

  try {
    const parseNum = (s: string) => {
      if (!s || s === "?") return 0;
      return parseFloat(s.replace(",", "."));
    };

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
    const kappaMatch = text.match(/Kappa statistic\s+([-\d.,eE]+)/i);
    const correlationMatch = text.match(/Correlation coefficient\s+([-\d.,eE]+)/i);
    const maeMatch = text.match(/Mean absolute error\s+([-\d.,eE]+)/i);
    const rmseMatch = text.match(/Root mean squared error\s+([-\d.,eE]+)/i);
    const raeMatch = text.match(/Relative absolute error\s+([-\d.,eE]+)\s*%/i);
    const rrseMatch = text.match(/Root relative squared error\s+([-\d.,eE]+)\s*%/i);
    const totalMatch = text.match(/Total Number of Instances\s+(\d+)/i);

    // Si no hay total instances ni métricas clave, no es un output de Weka válido
    if (!totalMatch && !maeMatch && !rmseMatch) return null;

    const summary = {
      correctlyClassified: correctMatch ? parseNum(correctMatch[2]) : 0,
      incorrectlyClassified: incorrectMatch ? parseNum(incorrectMatch[2]) : 0,
      kappa: kappaMatch ? parseNum(kappaMatch[1]) : 0,
      correlationCoefficient: correlationMatch ? parseNum(correlationMatch[1]) : 0,
      mae: maeMatch ? parseNum(maeMatch[1]) : 0,
      rmse: rmseMatch ? parseNum(rmseMatch[1]) : 0,
      rae: raeMatch ? parseNum(raeMatch[1]) : 0,
      rrse: rrseMatch ? parseNum(rrseMatch[1]) : 0,
      totalInstances: totalMatch ? parseInt(totalMatch[1]) : 0,
    };

    // 3. Parse Detailed Accuracy by Class
    const detailedAccuracy: ClassMetrics[] = [];
    let weightedAvg: WekaParsedData["weightedAvg"] = undefined;

    const tableRegex = /Detailed Accuracy By Class\s*===?\s*([\s\S]*?)(?:===|Confusion Matrix)/i;
    const tableMatch = text.match(tableRegex);

    if (tableMatch) {
      const tableContent = tableMatch[1];
      const lines = tableContent.split("\n").filter(line => line.trim().length > 0);

      lines.forEach(line => {
        const trimmed = line.trim();
        const parts = trimmed.split(/\s+/);

        if (trimmed.startsWith("Weighted Avg.")) {
          // Extraer promedios (normalmente empiezan después de "Weighted Avg.")
          const v = parts.slice(2); // Skip "Weighted", "Avg."
          if (v.length >= 5) {
            weightedAvg = {
              tpRate: parseNum(v[0]),
              fpRate: parseNum(v[1]),
              precision: parseNum(v[2]),
              recall: parseNum(v[3]),
              fMeasure: parseNum(v[4]),
              mcc: v.length > 5 ? parseNum(v[5]) : 0,
              rocArea: v.length > 6 ? parseNum(v[6]) : 0,
              prcArea: v.length > 7 ? parseNum(v[7]) : 0,
            };
          }
        } else if (trimmed.match(/^([-\d.,eE]+|\?)\s+/)) {
          // Es una fila de clase
          if (parts.length >= 6) {
            detailedAccuracy.push({
              tpRate: parseNum(parts[0]),
              fpRate: parseNum(parts[1]),
              precision: parseNum(parts[2]),
              recall: parseNum(parts[3]),
              fMeasure: parseNum(parts[4]),
              mcc: parts.length > 6 ? parseNum(parts[5]) : 0,
              rocArea: parts.length > 7 ? parseNum(parts[6]) : 0,
              prcArea: parts.length > 8 ? parseNum(parts[7]) : 0,
              className: parts.slice(parts.length > 8 ? 8 : (parts.length > 7 ? 7 : (parts.length > 6 ? 6 : 5))).join(" "),
            });
          }
        }
      });
    }

    // 4. Parse Confusion Matrix
    let confusionMatrix: { labels: string[]; matrix: number[][] } = { labels: [], matrix: [] };
    const confusionSectionRegex = /=== Confusion Matrix ===\s*([\s\S]*?)(?:\n\s*\n\s*\D|===|$)/i;
    const sectionMatch = text.match(confusionSectionRegex);

    if (sectionMatch) {
      const sectionContent = sectionMatch[1].trim();
      const lines = sectionContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      const headerIndex = lines.findIndex(l => l.includes("<-- classified as"));

      if (headerIndex !== -1) {
        const dataLines = lines.slice(headerIndex + 1);
        const matrix: number[][] = [];
        const labels: string[] = [];

        dataLines.forEach(line => {
          const parts = line.split("|");
          if (parts.length >= 2) {
            const counts = parts[0].trim().split(/\s+/).map(v => parseInt(v)).filter(v => !isNaN(v));
            if (counts.length > 0) {
              matrix.push(counts);
              const labelPart = parts[1].trim();
              const labelMatch = labelPart.match(/=\s*(.*)$/);
              labels.push(labelMatch ? labelMatch[1].trim() : labelPart);
            }
          }
        });

        if (matrix.length > 0) {
          confusionMatrix = { labels, matrix };
        }
      }
    }

    return { algorithm, buildTime, testTime, summary, weightedAvg, detailedAccuracy, confusionMatrix };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error parsing Weka output:", error.message);
    } else {
      console.error("Error parsing Weka output:", error);
    }
    return null;
  }
};
