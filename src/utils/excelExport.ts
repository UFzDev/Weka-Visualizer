import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ModelSession } from '../types/session';
import { parseWekaOutput, ClassMetrics, WekaParsedData } from './wekaParser';

const TRAIN_COLOR = 'FF00AEEF'; // Celeste Entrenamiento
const TEST_COLOR = 'FF92D050';  // Verde Validación
const BG_DARK = 'FF1F2937';

const setupSheet = (sheet: ExcelJS.Worksheet, title: string) => {
  sheet.mergeCells('A1:S1'); 
  const mainTitle = sheet.getCell('A1');
  mainTitle.value = title;
  mainTitle.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  mainTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_DARK } };
  mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;
  
  sheet.columns = [
    { width: 25 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
    { width: 5 }, // Spacer (Col 10)
    { width: 25 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
  ];
};

const createProTable = (
  sheet: ExcelJS.Worksheet, 
  startCol: number, 
  startRow: number, 
  title: string, 
  color: string, 
  data: { name: string, metrics: WekaParsedData | null }[]
) => {
  sheet.mergeCells(startRow, startCol, startRow, startCol + 8);
  const hCell = sheet.getCell(startRow, startCol);
  hCell.value = title;
  hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
  hCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  hCell.alignment = { horizontal: 'center' };

  const cols = ['Algoritmo', '% Acierto', '% Error', 'Kappa', 'ECM', 'RAE', 'RRSE', 'T. Construcción', 'T. Validación'];
  cols.forEach((c, i) => {
    const cell = sheet.getCell(startRow + 1, startCol + i);
    cell.value = c;
    cell.font = { bold: true };
    cell.border = { bottom: { style: 'thin' } };
    cell.alignment = { horizontal: 'center' };
  });

  data.forEach((d, i) => {
    const rowIdx = startRow + 2 + i;
    const m = d.metrics;
    sheet.getCell(rowIdx, startCol).value = d.name;
    if (m) {
      sheet.getCell(rowIdx, startCol + 1).value = m.summary.correctlyClassified / 100;
      sheet.getCell(rowIdx, startCol + 1).numFmt = '0.00%';
      sheet.getCell(rowIdx, startCol + 2).value = m.summary.incorrectlyClassified / 100;
      sheet.getCell(rowIdx, startCol + 2).numFmt = '0.00%';
      sheet.getCell(rowIdx, startCol + 3).value = m.summary.kappa;
      sheet.getCell(rowIdx, startCol + 4).value = m.summary.rmse;
      sheet.getCell(rowIdx, startCol + 5).value = m.summary.rae / 100;
      sheet.getCell(rowIdx, startCol + 5).numFmt = '0.00%';
      sheet.getCell(rowIdx, startCol + 6).value = m.summary.rrse / 100;
      sheet.getCell(rowIdx, startCol + 6).numFmt = '0.00%';
      sheet.getCell(rowIdx, startCol + 7).value = `${m.buildTime}s`;
      sheet.getCell(rowIdx, startCol + 8).value = `${m.testTime}s`;
    }
  });
};

const createClassMetricsTable = (
  sheet: ExcelJS.Worksheet,
  startCol: number,
  startRow: number,
  title: string,
  color: string,
  metrics: ClassMetrics[]
) => {
  if (!metrics || metrics.length === 0) return 0;

  sheet.mergeCells(startRow, startCol, startRow, startCol + 8);
  const hCell = sheet.getCell(startRow, startCol);
  hCell.value = title;
  hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
  hCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  hCell.alignment = { horizontal: 'center' };

  const cols = ['Clase', 'TP Rate', 'FP Rate', 'Precision', 'Recall', 'F-Measure', 'MCC', 'ROC Area', 'PRC Area'];
  cols.forEach((c, i) => {
    const cell = sheet.getCell(startRow + 1, startCol + i);
    cell.value = c;
    cell.font = { bold: true };
    cell.border = { bottom: { style: 'thin' } };
    cell.alignment = { horizontal: 'center' };
  });

  metrics.forEach((m, i) => {
    const rowIdx = startRow + 2 + i;
    sheet.getCell(rowIdx, startCol).value = m.className;
    sheet.getCell(rowIdx, startCol + 1).value = m.tpRate;
    sheet.getCell(rowIdx, startCol + 2).value = m.fpRate;
    sheet.getCell(rowIdx, startCol + 3).value = m.precision;
    sheet.getCell(rowIdx, startCol + 4).value = m.recall;
    sheet.getCell(rowIdx, startCol + 5).value = m.fMeasure;
    sheet.getCell(rowIdx, startCol + 6).value = m.mcc;
    sheet.getCell(rowIdx, startCol + 7).value = m.rocArea;
    sheet.getCell(rowIdx, startCol + 8).value = m.prcArea;

    for (let j = 1; j <= 8; j++) {
      sheet.getCell(rowIdx, startCol + j).numFmt = '0.000';
    }
  });

  return metrics.length + 2;
};

export const exportToExcel = async (sessions: ModelSession[]) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Weka Visualizer';
  
  // --- GLOBAL SHEET ---
  const globalSheet = workbook.addWorksheet('Resumen Global');
  setupSheet(globalSheet, 'REPORTE COMPARATIVO DE TODOS LOS MODELOS');

  const parsedAll = sessions.map(s => ({
    name: s.name,
    train: parseWekaOutput(s.trainText),
    test: parseWekaOutput(s.testText)
  })).filter(s => s.train || s.test);

  const sortedTrain = [...parsedAll].sort((a,b) => (b.train?.summary.correctlyClassified || 0) - (a.train?.summary.correctlyClassified || 0));
  const sortedTest = [...parsedAll].sort((a,b) => (b.test?.summary.correctlyClassified || 0) - (a.test?.summary.correctlyClassified || 0));

  createProTable(globalSheet, 1, 3, 'TABLA DE ENTRENAMIENTO', TRAIN_COLOR, sortedTrain.map(s => ({ name: s.name, metrics: s.train })));
  createProTable(globalSheet, 11, 3, 'TABLA DE VALIDACION', TEST_COLOR, sortedTest.map(s => ({ name: s.name, metrics: s.test })));

  // --- INDIVIDUAL SHEETS ---
  for (const session of sessions) {
    const trainData = parseWekaOutput(session.trainText);
    const testData = parseWekaOutput(session.testText);
    if (!trainData && !testData) continue;

    const sheetName = `Detalle - ${session.name.substring(0, 15)}`;
    const sheet = workbook.addWorksheet(sheetName);
    setupSheet(sheet, `ANÁLISIS DETALLADO: ${session.name.toUpperCase()}`);

    createProTable(sheet, 1, 3, 'RESULTADOS ENTRENAMIENTO', TRAIN_COLOR, [{ name: session.name, metrics: trainData }]);
    createProTable(sheet, 11, 3, 'RESULTADOS VALIDACIÓN', TEST_COLOR, [{ name: session.name, metrics: testData }]);

    const cmRow = 7;
    if (trainData?.confusionMatrix) {
        sheet.getCell(cmRow, 1).value = 'MATRIZ DE CONFUSIÓN (TRAIN)';
        sheet.getCell(cmRow, 1).font = { bold: true };
        sheet.getRow(cmRow + 1).values = ['', ...trainData.confusionMatrix.labels];
        trainData.confusionMatrix.matrix.forEach((row, idx) => {
            sheet.getRow(cmRow + 2 + idx).values = [trainData.confusionMatrix.labels[idx], ...row];
        });
    }
    
    if (testData?.confusionMatrix) {
        sheet.getCell(cmRow, 11).value = 'MATRIZ DE CONFUSIÓN (TEST)';
        sheet.getCell(cmRow, 11).font = { bold: true };
        const rowOffset = cmRow + 1;
        testData.confusionMatrix.labels.forEach((l, i) => sheet.getCell(rowOffset, 12 + i).value = l);

        testData.confusionMatrix.matrix.forEach((row, idx) => {
            const rIdx = cmRow + 2 + idx;
            sheet.getCell(rIdx, 11).value = testData.confusionMatrix.labels[idx];
            row.forEach((val, colIdx) => {
                sheet.getCell(rIdx, 12 + colIdx).value = val;
            });
        });
    }

    const maxCMRows = Math.max(trainData?.confusionMatrix.labels.length || 0, testData?.confusionMatrix.labels.length || 0);
    const classMetricsRow = cmRow + maxCMRows + 4;

    createClassMetricsTable(sheet, 1, classMetricsRow, 'MÉTRICAS POR CLASE (ENTRENAMIENTO)', TRAIN_COLOR, trainData?.detailedAccuracy || []);
    createClassMetricsTable(sheet, 11, classMetricsRow, 'MÉTRICAS POR CLASE (VALIDACIÓN)', TEST_COLOR, testData?.detailedAccuracy || []);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Weka-Full-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
};
