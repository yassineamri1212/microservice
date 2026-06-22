import { Injectable } from '@angular/core';
import { PaymentReservation } from './models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
   * Generate PDF for reservation details using HTML and print
   * @param reservation - Reservation data
   * @returns PDF blob for download or email attachment
   */
  async generateReservationPDF(reservation: PaymentReservation): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create HTML content for PDF
        const htmlContent = this.generateHTMLContent(reservation);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          reject(new Error('Unable to open print window'));
          return;
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.onload = () => {
          // For now, we'll create a simple text-based blob
          // In a production environment, you would use jsPDF or html2canvas + jsPDF
          const pdfContent = this.generateTextContent(reservation);
          const blob = new Blob([pdfContent], { type: 'application/pdf' });
          resolve(blob);
          printWindow.close();
        };

      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate HTML content for reservation
   */
  private generateHTMLContent(reservation: PaymentReservation): string {
    const currentDate = new Date().toLocaleDateString('fr-TN');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Reservation Details - ${reservation.referenceCode}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  color: #333;
              }
              .header {
                  background-color: #1c3b50;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  margin-bottom: 30px;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .header .date {
                  font-size: 12px;
                  margin-top: 5px;
              }
              .section {
                  margin-bottom: 30px;
              }
              .section h2 {
                  color: #1c3b50;
                  border-bottom: 2px solid #1c3b50;
                  padding-bottom: 5px;
              }
              .detail-row {
                  display: flex;
                  margin-bottom: 8px;
              }
              .detail-label {
                  font-weight: bold;
                  width: 150px;
                  min-width: 150px;
              }
              .detail-value {
                  flex: 1;
              }
              .status-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: bold;
                  text-transform: uppercase;
              }
              .status-paid {
                  background-color: #4caf50;
                  color: white;
              }
              .status-reserved {
                  background-color: #ff9800;
                  color: white;
              }
              .status-cancelled {
                  background-color: #f44336;
                  color: white;
              }
              .footer {
                  margin-top: 50px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  font-size: 12px;
                  color: #666;
                  text-align: center;
              }
              @media print {
                  body { margin: 0; }
                  .header { margin-bottom: 20px; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>STB - Société Tunisienne de Banque</h1>
              <div class="date">Generated on: ${currentDate}</div>
          </div>

          <h1 style="text-align: center; color: #1c3b50;">RESERVATION DETAILS</h1>

          <div class="section">
              <h2>Reservation Information</h2>
              <div class="detail-row">
                  <div class="detail-label">Reservation ID:</div>
                  <div class="detail-value">${reservation.id || 'N/A'}</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Reference Code:</div>
                  <div class="detail-value"><strong>${reservation.referenceCode}</strong></div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">CIN:</div>
                  <div class="detail-value">${reservation.cin}</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Amount:</div>
                  <div class="detail-value"><strong>${reservation.amount} TND</strong></div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Reason:</div>
                  <div class="detail-value">${reservation.reason || 'N/A'}</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Status:</div>
                  <div class="detail-value">
                      <span class="status-badge status-${reservation.status.toLowerCase()}">${reservation.status}</span>
                  </div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Created Date:</div>
                  <div class="detail-value">${new Date(reservation.createdDate).toLocaleDateString('fr-TN')}</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Expiry Date:</div>
                  <div class="detail-value">${new Date(reservation.expiredDate).toLocaleDateString('fr-TN')}</div>
              </div>
              ${reservation.email ? `
              <div class="detail-row">
                  <div class="detail-label">Email:</div>
                  <div class="detail-value">${reservation.email}</div>
              </div>
              ` : ''}
              ${reservation.phoneNumber ? `
              <div class="detail-row">
                  <div class="detail-label">Phone Number:</div>
                  <div class="detail-value">${reservation.phoneNumber}</div>
              </div>
              ` : ''}
          </div>

          ${reservation.status === 'PAID' ? `
          <div class="section">
              <h2>Payment Information</h2>
              <div style="background-color: #4caf50; color: white; padding: 10px; text-align: center; margin-bottom: 15px;">
                  <strong>PAYMENT COMPLETED</strong>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Payment Date:</div>
                  <div class="detail-value">${new Date(reservation.createdDate).toLocaleDateString('fr-TN')}</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Transaction Amount:</div>
                  <div class="detail-value">${reservation.amount} TND</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Payment Method:</div>
                  <div class="detail-value">STB Banking System</div>
              </div>
              <div class="detail-row">
                  <div class="detail-label">Transaction Status:</div>
                  <div class="detail-value">Completed</div>
              </div>
          </div>
          ` : ''}

          <div class="footer">
              <p><strong>This document serves as confirmation of your reservation with STB.</strong></p>
              <p>Please keep this document for your records.</p>
              <p>For any inquiries, please contact STB customer service.</p>
              <br>
              <p><strong>STB - Société Tunisienne de Banque</strong> | Customer Service: +216 71 xxx xxx</p>
              <p>Website: www.stb.com.tn | Email: contact@stb.com.tn</p>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate simple text content for basic PDF (fallback)
   */
  private generateTextContent(reservation: PaymentReservation): string {
    const currentDate = new Date().toLocaleDateString('fr-TN');
    
    return `
STB - Société Tunisienne de Banque
RESERVATION DETAILS
Generated on: ${currentDate}

============================================

Reservation Information:
- Reservation ID: ${reservation.id || 'N/A'}
- Reference Code: ${reservation.referenceCode}
- CIN: ${reservation.cin}
- Amount: ${reservation.amount} TND
- Reason: ${reservation.reason || 'N/A'}
- Status: ${reservation.status}
- Created Date: ${new Date(reservation.createdDate).toLocaleDateString('fr-TN')}
- Expiry Date: ${new Date(reservation.expiredDate).toLocaleDateString('fr-TN')}
${reservation.email ? `- Email: ${reservation.email}` : ''}
${reservation.phoneNumber ? `- Phone Number: ${reservation.phoneNumber}` : ''}

${reservation.status === 'PAID' ? `
Payment Information:
- Payment Status: COMPLETED
- Payment Date: ${new Date(reservation.createdDate).toLocaleDateString('fr-TN')}
- Transaction Amount: ${reservation.amount} TND
- Payment Method: STB Banking System
- Transaction Status: Completed
` : ''}

============================================

This document serves as confirmation of your reservation with STB.
Please keep this document for your records.
For any inquiries, please contact STB customer service.

STB - Société Tunisienne de Banque
Customer Service: +216 71 xxx xxx
Website: www.stb.com.tn | Email: contact@stb.com.tn
    `;
  }

  /**
   * Download PDF file (opens print dialog for now)
   */
  downloadPDF(reservation: PaymentReservation): void {
    const htmlContent = this.generateHTMLContent(reservation);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert('Please allow pop-ups to download the PDF');
    }
  }

  /**
   * Generate filename for reservation PDF
   */
  generateFilename(reservation: PaymentReservation): string {
    const date = new Date().toISOString().split('T')[0];
    return `STB_Reservation_${reservation.referenceCode}_${date}.pdf`;
  }

  /**
   * Convert HTML content to base64 for email attachment (simplified)
   */
  async getHTMLAsBase64(reservation: PaymentReservation): Promise<string> {
    const htmlContent = this.generateHTMLContent(reservation);
    const base64 = btoa(unescape(encodeURIComponent(htmlContent)));
    return base64;
  }

  /**
   * Generate a simple text version for email attachment
   */
  generateTextPDF(reservation: PaymentReservation): string {
    return this.generateTextContent(reservation);
  }
}