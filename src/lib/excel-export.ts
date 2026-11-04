// src/lib/excel-export.ts
// Helper to generate Excel files from data
import * as XLSX from "xlsx";

type ExportConfig = {
  filename: string;
  sheetName: string;
  headers: string[];
  rows: (string | number | null)[][];
};

export function generateExcelBuffer(config: ExportConfig): Buffer {
  const { sheetName, headers, rows } = config;
  // Build worksheet with headers as first row
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto column width
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i] || "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
  ws["!cols"] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate buffer
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}

export function excelResponse(buffer: Buffer, filename: string): Response {
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
