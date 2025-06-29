import { useState } from "react";
import jsPDF from "jspdf";
import { type ProgramWithUniversity } from "@shared/schema";
import { useExchangeRates, SUPPORTED_CURRENCIES } from "@/hooks/use-exchange-rates";

interface CurrencyConversion {
  currency: string;
  amount: number;
  rate: number;
}

interface PDFExportProps {
  selectedPrograms: ProgramWithUniversity[];
  onSelectionChange: (programIds: number[]) => void;
  className?: string;
  currencyConversions?: Record<number, CurrencyConversion[]>; // programId -> conversions
}

export default function PDFExport({ selectedPrograms, onSelectionChange, className, currencyConversions }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { formatCurrency } = useExchangeRates();

  const generatePDF = async () => {
    if (selectedPrograms.length === 0) return;

    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Selected Programs", margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;

      pdf.text(`Total Programs: ${selectedPrograms.length}`, margin, yPosition);
      yPosition += 20;

      // Programs
      selectedPrograms.forEach((program, index) => {
        // Function to check if we need a new page with some buffer space
        const checkNewPage = (requiredSpace = 40) => {
          if (yPosition > pageHeight - requiredSpace) {
            pdf.addPage();
            yPosition = margin;
            return true;
          }
          return false;
        };

        // Check initial page space
        checkNewPage(80);

        // Program title
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        const title = pdf.splitTextToSize(program.name, pageWidth - 2 * margin);
        pdf.text(title, margin, yPosition);
        yPosition += title.length * 7 + 5; // Better spacing

        // University
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(`University: ${program.university?.name || 'N/A'}`, margin, yPosition);
        yPosition += 10;

        // Degree Level
        pdf.text(`Degree Level: ${program.degree || 'N/A'}`, margin, yPosition);
        yPosition += 10;

        // Duration
        const durationText = pdf.splitTextToSize(`Duration: ${program.duration || 'N/A'} years`, pageWidth - 2 * margin);
        pdf.text(durationText, margin, yPosition);
        yPosition += durationText.length * 6 + 4;

        // Tuition
        const tuitionText = pdf.splitTextToSize(`Tuition: ${program.tuition || 'Contact university for details'}`, pageWidth - 2 * margin);
        pdf.text(tuitionText, margin, yPosition);
        yPosition += tuitionText.length * 6 + 2;
        
        // Currency conversions
        const conversions = currencyConversions?.[program.id];
        if (conversions && conversions.length > 0) {
          yPosition += 2;
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "italic");
          pdf.text('Converted amounts:', margin + 10, yPosition);
          yPosition += 8;
          
          conversions.forEach((conversion) => {
            checkNewPage(15);
            const formattedAmount = formatCurrency(conversion.amount, conversion.currency);
            const conversionText = `• ${formattedAmount} (1 AED = ${conversion.rate.toFixed(4)} ${conversion.currency})`;
            pdf.text(conversionText, margin + 15, yPosition);
            yPosition += 7;
          });
          
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          yPosition += 5;
        }

        // Intake
        checkNewPage(20);
        const intakeText = pdf.splitTextToSize(`Intake: ${program.intake || 'N/A'}`, pageWidth - 2 * margin);
        pdf.text(intakeText, margin, yPosition);
        yPosition += intakeText.length * 6 + 4;

        // Study Field
        if (program.studyField) {
          const studyFieldText = pdf.splitTextToSize(`Field of Study: ${program.studyField}`, pageWidth - 2 * margin);
          pdf.text(studyFieldText, margin, yPosition);
          yPosition += studyFieldText.length * 6 + 4;
        }

        // Availability
        const availabilityText = pdf.splitTextToSize(`Availability: ${program.intake || 'Contact university for details'}`, pageWidth - 2 * margin);
        pdf.text(availabilityText, margin, yPosition);
        yPosition += availabilityText.length * 6 + 4;

        // Requirements
        if (program.requirements && Array.isArray(program.requirements) && program.requirements.length > 0) {
          checkNewPage(30);
          pdf.text(`Requirements:`, margin, yPosition);
          yPosition += 8;
          
          program.requirements.forEach((req: string) => {
            checkNewPage(20);
            // Clean up requirement text and split properly
            const cleanReq = req.replace(/\s+/g, ' ').trim();
            const reqText = pdf.splitTextToSize(`• ${cleanReq}`, pageWidth - 2 * margin - 15);
            pdf.text(reqText, margin + 10, yPosition);
            yPosition += reqText.length * 6 + 3; // Better line spacing
          });
          
          yPosition += 5; // Extra space after requirements
        }

        // Separator line and spacing
        if (index < selectedPrograms.length - 1) {
          yPosition += 8;
          checkNewPage(20);
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15; // More space between programs
        }
      });

      // Save the PDF
      const filename = `programs_${new Date().getTime()}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  if (selectedPrograms.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-gray-900">
              {selectedPrograms.length} program{selectedPrograms.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}