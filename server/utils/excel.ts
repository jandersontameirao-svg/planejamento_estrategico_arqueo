import * as XLSX from "xlsx";

const MAX_EXCEL_BYTES = 5 * 1024 * 1024;
const MAX_SHEETS = 8;
const MAX_CELLS_PER_SHEET = 50_000;
const MAX_CSV_CHARS_PER_SHEET = 250_000;

export function extractWorkbookText(buffer: Buffer): string {
  if (buffer.byteLength > MAX_EXCEL_BYTES) {
    throw new Error("Planilha muito grande. Limite de 5MB para arquivos Excel.");
  }

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellFormula: false,
    cellHTML: false,
    cellStyles: false,
    WTF: false,
  });

  return workbook.SheetNames.slice(0, MAX_SHEETS)
    .map((name) => {
      const worksheet = workbook.Sheets[name];
      const rangeRef = worksheet["!ref"];
      if (rangeRef) {
        const range = XLSX.utils.decode_range(rangeRef);
        const cellCount = (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
        if (cellCount > MAX_CELLS_PER_SHEET) {
          throw new Error(`Aba "${name}" excede o limite de celulas permitido.`);
        }
      }

      const csv = XLSX.utils.sheet_to_csv(worksheet).slice(0, MAX_CSV_CHARS_PER_SHEET);
      return `=== Aba: ${name} ===\n${csv}`;
    })
    .join("\n\n");
}
