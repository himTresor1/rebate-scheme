import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportColumn {
  header: string;
  key: string;
}

export interface ReportExportOptions {
  filename: string;
  title: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  /** Appends signature lines below the table (PDF only) — e.g. for CFO sign-off reports. */
  signatureLines?: string[];
}

/** Writes every column/row into a real .xlsx file — title row on top, no page-width truncation. */
export function exportReportToExcel({ filename, title, columns, rows }: ReportExportOptions) {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((col) => [col.header, row[col.key] ?? '']))
  );
  // Row 1: report title. Row 2: generated-at note. Row 3: column headers. Row 4+: data.
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: columns.map((c) => c.header),
    origin: 'A3',
  });
  XLSX.utils.sheet_add_aoa(worksheet, [[title], [`Generated ${new Date().toLocaleString()} — ${rows.length} record(s)`]], {
    origin: 'A1',
  });
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(columns.length - 1, 0) } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(columns.length - 1, 0) } },
  ];
  worksheet['!cols'] = columns.map((col) => ({
    wch: Math.max(col.header.length, 12),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31) || 'Report');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/** Writes every column/row into a real, downloadable PDF — auto-fits page width/orientation. */
export function exportReportToPdf({ filename, title, columns, rows, signatureLines }: ReportExportOptions) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text(title, 24, 28);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()} — ${rows.length} record(s)`, 24, 42);

  autoTable(doc, {
    startY: 54,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ''))),
    styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [2, 63, 64] },
    margin: { left: 20, right: 20 },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 80,
        doc.internal.pageSize.getHeight() - 12
      );
    },
  });

  if (signatureLines && signatureLines.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY ?? 54;
    let y = finalY + 48;
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    for (const line of signatureLines) {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 48;
      }
      doc.text(line, 24, y);
      doc.line(140, y + 2, 340, y + 2);
      y += 40;
    }
  }

  doc.save(`${filename}.pdf`);
}
