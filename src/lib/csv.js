/**
 * CSV Export Utility for PaperVerse Literature Review Comparison
 * Explained for first-year students:
 * 1. Takes the array of extracted paper details and the research gap paragraph.
 * 2. Formats attributes into clean CSV rows with proper quote escaping.
 * 3. Prepends the UTF-8 Byte Order Mark (\uFEFF) so Excel opens UTF-8 text cleanly.
 * 4. Triggers an automatic download in the browser.
 */

export function exportComparisonToCsv(papers, researchGap, filename = 'paperverse_literature_review.csv') {
  if (!papers || !papers.length) {
    throw new Error('No paper comparison data available to export.');
  }

  // Escape CSV value to handle commas, newlines, and quotes
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const attributes = [
    { key: 'title', label: 'Paper Title' },
    { key: 'year', label: 'Publication Year' },
    { key: 'problem', label: 'Problem Addressed' },
    { key: 'method', label: 'Methodology / Architecture' },
    { key: 'dataset', label: 'Dataset / Benchmark' },
    { key: 'result', label: 'Key Results & Metrics' },
    { key: 'limitation', label: 'Limitations & Weaknesses' }
  ];

  // Header row: Attribute Name, Paper 1 Title, Paper 2 Title, ...
  const headers = ['Comparison Metric', ...papers.map((p, idx) => `Paper ${idx + 1}: ${p.title || 'Untitled'}`)];
  const csvRows = [];
  csvRows.push(headers.map(escapeCell).join(','));

  // Attribute rows
  attributes.forEach((attr) => {
    const row = [attr.label];
    papers.forEach((paper) => {
      row.push(paper[attr.key] || 'Not mentioned');
    });
    csvRows.push(row.map(escapeCell).join(','));
  });

  // Empty separator line
  csvRows.push('');

  // Research Gap Section
  csvRows.push(['SYNTHESIS & RESEARCH GAP']);
  csvRows.push([escapeCell(researchGap || 'No research gap generated.')]);

  const csvContent = csvRows.join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
