import { pdf } from '@react-pdf/renderer';
import ManualPDF from './ManualPDF';

export class PDFService {
    static async generateManualPDF(data) {
        try {
            const blob = await pdf(ManualPDF(data)).toBlob();
            return blob;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF manual');
        }
    }

    static downloadPDF(blob, filename = 'FSUU_Registrar_Validation_System_Manual.pdf') {
        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw new Error('Failed to download PDF');
        }
    }

    static async generateAndDownloadPDF(data) {
        try {
            const blob = await this.generateManualPDF(data);
            this.downloadPDF(blob);
            return true;
        } catch (error) {
            console.error('Error generating and downloading PDF:', error);
            throw error;
        }
    }
}

export default PDFService;
