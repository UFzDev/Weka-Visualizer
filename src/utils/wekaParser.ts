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
    totalInstances: number;
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
    const maeMatch = text.match(/Mean absolute error\s+([-\d.,eE]+)/i);
    const rmseMatch = text.match(/Root mean squared error\s+([-\d.,eE]+)/i);
    const raeMatch = text.match(/Relative absolute error\s+([-\d.,eE]+)\s*%/i);
    const rrseMatch = text.match(/Root relative squared error\s+([-\d.,eE]+)\s*%/i);
    const totalMatch = text.match(/Total Number of Instances\s+(\d+)/i);

    if (!correctMatch || !totalMatch) return null;

    const parseNum = (s: string) => parseFloat(s.replace(",", "."));

    const summary = {
      correctlyClassified: parseNum(correctMatch[2]),
      incorrectlyClassified: parseNum(incorrectMatch?.[2] || "0"),
      kappa: parseNum(kappaMatch?.[1] || "0"),
      mae: parseNum(maeMatch?.[1] || "0"),
      rmse: parseNum(rmseMatch?.[1] || "0"),
      rae: parseNum(raeMatch?.[1] || "0"),
      rrse: parseNum(rrseMatch?.[1] || "0"),
      totalInstances: parseInt(totalMatch[1]),
    };

    // 3. Parse Detailed Accuracy by Class
    const detailedAccuracy: ClassMetrics[] = [];
    const tableRegex = /Detailed Accuracy By Class\s*===?\s*([\s\S]*?)(?:Weighted Avg\.|===|Confusion Matrix)/i;
    const tableMatch = text.match(tableRegex);

    if (tableMatch) {
      const tableContent = tableMatch[1];
      const rows = tableContent.split("\n").filter(line => line.trim().match(/^([-\d.,eE]+|\?)\s+/));
      rows.forEach(row => {
        const parts = row.trim().split(/\s+/);
        // Weka suele tener métricas antes del nombre de la clase al final
        if (parts.length >= 5) {
          const parseVal = (s: string) => {
            if (!s || s === "?") return 0;
            const normalized = s.replace(",", ".");
            return parseFloat(normalized);
          };

          // Buscamos el índice de la clase dinámicamente o asumimos que es el último
          // En Weka standard, las métricas son TP, FP, Precision, Recall, F-Measure, MCC, ROC, PRC
          // La clase siempre es la última parte (o partes si tiene espacios)

          detailedAccuracy.push({
            tpRate: parseVal(parts[0]),
            fpRate: parseVal(parts[1]),
            precision: parseVal(parts[2]),
            recall: parseVal(parts[3]),
            fMeasure: parseVal(parts[4]),
            // MCC, ROC y PRC son opcionales según la versión de Weka
            mcc: parts.length > 6 ? parseVal(parts[5]) : 0,
            rocArea: parts.length > 7 ? parseVal(parts[6]) : 0,
            prcArea: parts.length > 8 ? parseVal(parts[7]) : 0,
            className: parts.slice(parts.length > 8 ? 8 : (parts.length > 7 ? 7 : (parts.length > 6 ? 6 : 5))).join(" "),
          });
        }
      });
    }

    // 4. Parse Confusion Matrix
    let confusionMatrix: { labels: string[]; matrix: number[][] } = { labels: [], matrix: [] };

    // Buscamos la sección de la matriz de confusión de forma más flexible
    const confusionSectionRegex = /=== Confusion Matrix ===\s*([\s\S]*?)(?:\n\s*\n\s*\D|===|$)/i;
    const sectionMatch = text.match(confusionSectionRegex);

    if (sectionMatch) {
      const sectionContent = sectionMatch[1].trim();
      const lines = sectionContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);

      // Encontrar la línea del header (la que tiene <-- classified as)
      const headerIndex = lines.findIndex(l => l.includes("<-- classified as"));

      if (headerIndex !== -1) {
        const dataLines = lines.slice(headerIndex + 1);
        const matrix: number[][] = [];
        const labels: string[] = [];

        dataLines.forEach(line => {
          const parts = line.split("|");
          if (parts.length >= 2) {
            // Parte de los números (antes del pipe)
            const counts = parts[0].trim().split(/\s+/).map(v => parseInt(v)).filter(v => !isNaN(v));
            if (counts.length > 0) {
              matrix.push(counts);
              // Parte de la etiqueta (después del pipe, e.g. " a = Iris-setosa")
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

    return { algorithm, buildTime, testTime, summary, detailedAccuracy, confusionMatrix };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error parsing Weka output:", error.message);
    } else {
      console.error("Error parsing Weka output:", error);
    }
    return null;
  }
};
