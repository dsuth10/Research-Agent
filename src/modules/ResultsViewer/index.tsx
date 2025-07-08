import React, { useState } from 'react';
import Card from '@/components/Card';
import { useAppStore } from '@/store/app-store';
import type { Source } from '@/types/types';
import { fileSystemService } from '@/services/file-system';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Helper to parse citations in the report (e.g., [1], [2]) and link to sources
function parseReportWithCitations(report: string, onCiteClick: (idx: number) => void) {
  if (!report) return null;
  // Regex to match [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = citationRegex.exec(report)) !== null) {
    const idx = parseInt(match[1], 10) - 1;
    parts.push(report.slice(lastIndex, match.index));
    parts.push(
      <button
        key={match.index}
        className="text-primary underline hover:text-primary/80 mx-1"
        onClick={() => onCiteClick(idx)}
        type="button"
      >
        [{match[1]}]
      </button>
    );
    lastIndex = match.index + match[0].length;
  }
  parts.push(report.slice(lastIndex));
  return parts;
}

// TODO: Implement tabbed interface, citation management, and export functionality
export const ResultsViewer: React.FC = () => {
  const { currentResearch, setUI, updateResearch } = useAppStore();
  const [activeTab, setActiveTab] = useState<'report' | 'process' | 'sources'>('report');
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  if (!currentResearch || !currentResearch.result) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-2">Results Viewer</h2>
        <p>No completed research to display. Run a research task first.</p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={() => setUI({ currentTab: 'prompt' })}
        >
          Back to Prompt Builder
        </button>
      </Card>
    );
  }

  const { result } = currentResearch;
  const sources: Source[] = result.sources || [];

  // Handler for clicking a citation in the report
  const handleCitationClick = (idx: number) => {
    setActiveTab('sources');
    setHighlightedSource(idx);
    setTimeout(() => setHighlightedSource(null), 2000); // Remove highlight after 2s
  };

  // Filtered report and sources
  const filteredReport = search
    ? result.report.split('\n').filter(line => line.toLowerCase().includes(search.toLowerCase())).join('\n')
    : result.report;
  const filteredSources = search
    ? sources.filter(s =>
        (s.title && s.title.toLowerCase().includes(search.toLowerCase())) ||
        (s.snippet && s.snippet.toLowerCase().includes(search.toLowerCase())) ||
        (s.url && s.url.toLowerCase().includes(search.toLowerCase()))
      )
    : sources;

  // Expand/collapse handler
  const toggleSource = (idx: number) => {
    setExpandedSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Export as Markdown
  const exportAsMarkdown = async () => {
    const content = `# ${currentResearch.title}\n\n**Generated:** ${new Date(currentResearch.createdAt).toLocaleDateString()}\n${currentResearch.completedAt ? `**Completed:** ${new Date(currentResearch.completedAt).toLocaleDateString()}` : ''}\n\n## Research Prompt\n\n\u0060\u0060\u0060\n${currentResearch.prompt}\n\u0060\u0060\u0060\n\n## Research Report\n\n${result.report}\n\n${result.thoughtProcess ? `## Research Process\n\n${result.thoughtProcess}\n\n` : ''}${sources.length ? `## Sources\n\n${sources.map((source, i) => `${i + 1}. [${source.title}](${source.url})${source.snippet ? `\n> ${source.snippet}` : ''}`).join('\n\n')}` : ''}`;
    await fileSystemService.saveFile(`${currentResearch.title.substring(0, 50)}.md`, content, 'text/markdown');
  };

  // Export as PDF
  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { width, height } = page.getSize();
      const margin = 50;
      let y = height - margin;
      const addText = (text: string, font = helveticaFont, size = 12, color = rgb(0, 0, 0)) => {
        const maxWidth = width - 2 * margin;
        const words = text.split(' ');
        let line = '';
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const textWidth = font.widthOfTextAtSize(testLine, size);
          if (textWidth > maxWidth && line) {
            page.drawText(line, { x: margin, y, size, font, color });
            y -= size + 5;
            line = word;
          } else {
            line = testLine;
          }
          if (y < margin) {
            y = height - margin;
          }
        }
        if (line) {
          page.drawText(line, { x: margin, y, size, font, color });
          y -= size + 10;
        }
      };
      addText(currentResearch.title, helveticaBold, 16, rgb(0.1, 0.1, 0.5));
      y -= 10;
      addText(`Generated: ${new Date(currentResearch.createdAt).toLocaleDateString()}`, helveticaFont, 10, rgb(0.5, 0.5, 0.5));
      if (currentResearch.completedAt) {
        addText(`Completed: ${new Date(currentResearch.completedAt).toLocaleDateString()}`, helveticaFont, 10, rgb(0.5, 0.5, 0.5));
      }
      y -= 20;
      if (result.report) {
        addText('Research Report', helveticaBold, 14);
        y -= 5;
        addText(result.report);
        y -= 20;
      }
      if (result.thoughtProcess) {
        addText('Research Process', helveticaBold, 14);
        y -= 5;
        addText(result.thoughtProcess);
        y -= 20;
      }
      if (sources.length > 0) {
        addText('Sources', helveticaBold, 14);
        y -= 5;
        sources.forEach((source, i) => {
          addText(`${i + 1}. ${source.title}`);
          if (source.url) addText(`   ${source.url}`, helveticaFont, 10, rgb(0, 0, 0.8));
          if (source.snippet) addText(`   "${source.snippet}"`, helveticaFont, 10, rgb(0.3, 0.3, 0.3));
          y -= 5;
        });
      }
      const pdfBytes = await pdfDoc.save();
      await fileSystemService.saveFile(`${currentResearch.title.substring(0, 50)}.pdf`, new Blob([pdfBytes], { type: 'application/pdf' }), 'application/pdf');
    } catch (e) {
      alert('PDF export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Export as DOCX
  const exportAsDOCX = async () => {
    setIsExporting(true);
    try {
      const paragraphs: Paragraph[] = [];
      paragraphs.push(new Paragraph({ text: currentResearch.title, heading: HeadingLevel.TITLE }));
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date(currentResearch.createdAt).toLocaleDateString()}`, italics: true })] }));
      if (currentResearch.completedAt) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Completed: ${new Date(currentResearch.completedAt).toLocaleDateString()}`, italics: true })] }));
      }
      paragraphs.push(new Paragraph({ text: '' }));
      if (result.report) {
        paragraphs.push(new Paragraph({ text: 'Research Report', heading: HeadingLevel.HEADING_1 }));
        result.report.split('\n').forEach(paragraph => {
          if (paragraph.trim()) paragraphs.push(new Paragraph({ text: paragraph.trim() }));
        });
      }
      if (result.thoughtProcess) {
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: 'Research Process', heading: HeadingLevel.HEADING_1 }));
        result.thoughtProcess.split('\n').forEach(paragraph => {
          if (paragraph.trim()) paragraphs.push(new Paragraph({ text: paragraph.trim() }));
        });
      }
      if (sources.length > 0) {
        paragraphs.push(new Paragraph({ text: '' }));
        paragraphs.push(new Paragraph({ text: 'Sources', heading: HeadingLevel.HEADING_1 }));
        sources.forEach((source, i) => {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. `, bold: true }), new TextRun({ text: source.title })] }));
          if (source.url) paragraphs.push(new Paragraph({ children: [new TextRun({ text: `   ${source.url}`, color: '0066CC' })] }));
          if (source.snippet) paragraphs.push(new Paragraph({ children: [new TextRun({ text: `   "${source.snippet}"`, italics: true })] }));
        });
      }
      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      const docxBuffer = await Packer.toBlob(doc);
      await fileSystemService.saveFile(`${currentResearch.title.substring(0, 50)}.docx`, docxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } catch (e) {
      alert('DOCX export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Results Viewer</h2>
      {/* Error and retry */}
      {currentResearch.status === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-900 text-sm flex items-center gap-4">
          <span>An error occurred while running research.</span>
          <button
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => updateResearch(currentResearch.id, { status: 'pending' })}
          >
            Retry
          </button>
        </div>
      )}
      {/* Cost and token usage */}
      {currentResearch.cost && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-sm flex gap-6">
          <div>Input Tokens: <span className="font-semibold">{currentResearch.cost.inputTokens}</span></div>
          <div>Output Tokens: <span className="font-semibold">{currentResearch.cost.outputTokens}</span></div>
          <div>Total Cost: <span className="font-semibold">${currentResearch.cost.totalCost.toFixed(4)}</span></div>
        </div>
      )}
      {/* Export Buttons */}
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/90" onClick={exportAsMarkdown} disabled={isExporting}>Export Markdown</button>
        <button className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/90" onClick={exportAsPDF} disabled={isExporting}>Export PDF</button>
        <button className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/90" onClick={exportAsDOCX} disabled={isExporting}>Export DOCX</button>
      </div>
      {/* Search/filter */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Search report or sources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Tabs */}
      <div className="border-b mb-4">
        <nav className="flex space-x-8">
          {[
            { id: 'report', label: 'Report', available: !!result.report },
            { id: 'process', label: 'Thought Process', available: !!result.thoughtProcess },
            { id: 'sources', label: 'Sources', available: !!sources.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              } ${!tab.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!tab.available}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="bg-muted/50 border rounded-lg p-6 min-h-[200px]">
        {activeTab === 'report' && (
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {parseReportWithCitations(filteredReport, handleCitationClick) || 'No report available.'}
            </pre>
            <div className="mt-4 text-xs text-muted-foreground">
              <span>Click citations (e.g., [1]) to view source details below.</span>
            </div>
          </div>
        )}
        {activeTab === 'process' && (
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {result.thoughtProcess || 'No thought process available.'}
            </pre>
          </div>
        )}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            {filteredSources.length > 0 ? (
              filteredSources.map((source, idx) => (
                <div
                  key={source.id || idx}
                  className={`border rounded-lg p-4 transition-shadow ${highlightedSource === idx ? 'ring-2 ring-primary shadow-lg' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      className="mr-2 text-primary underline"
                      onClick={() => toggleSource(idx)}
                      type="button"
                    >
                      {expandedSources[idx] ? '▼' : '►'}
                    </button>
                    <h4 className="font-medium mb-0">{idx + 1}. {source.title || 'Untitled Source'}</h4>
                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">Verified</span>
                  </div>
                  {expandedSources[idx] && (
                    <div>
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm break-all">
                          {source.url}
                        </a>
                      )}
                      {source.snippet && (
                        <p className="text-muted-foreground text-sm mt-2">"{source.snippet}"</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Cited at: {source.citedAt ? new Date(source.citedAt).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No sources available.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResultsViewer; 