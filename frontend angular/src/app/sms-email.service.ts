import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Email request interface
export interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  content: string; // Accepts HTML content
}

// Email with attachment interface
export interface EmailWithAttachmentRequest {
  from: string;
  to: string;
  subject: string;
  content: string;
  attachment?: {
    filename: string;
    data: string; // Base64 encoded data
    contentType: string;
  };
}

// SMS request interface  
export interface SmsRequest {
  message: string;
  mobile: string;
}

// Response interfaces
export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SmsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SmsEmailService {
  
  // STB API endpoints
  private readonly emailApiUrl = 'https://openbank.stb.com.tn/api/students/subscription/sendmail';
  private readonly smsApiUrl = 'https://openbank.stb.com.tn/api/students/subscription/sendsms';
  
  // API subscription key - you should move this to environment variables in production
  private readonly subscriptionKey = '55c87b41825244d7b0299f66e3bda7f6'; // Replace with actual key in production

  constructor(private http: HttpClient) {}

  /**
   * Send an email using STB's email API
   * @param emailData - Email data containing from, to, subject, and content
   * @returns Observable<EmailResponse>
   */
  sendEmail(emailData: EmailRequest): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.subscriptionKey
    });

    console.log('Sending email:', emailData);

    return this.http.post<EmailResponse>(this.emailApiUrl, emailData, { headers });
  }

  /**
   * Send an email with PDF attachment using STB's email API
   * @param emailData - Email data containing from, to, subject, content, and attachment
   * @returns Observable<EmailResponse>
   */
  sendEmailWithPDFAttachment(emailData: EmailWithAttachmentRequest): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.subscriptionKey
    });

    console.log('Sending email with PDF attachment:', emailData);

    return this.http.post<EmailResponse>(this.emailApiUrl, emailData, { headers });
  }

  /**
   * Send an SMS using STB's SMS API
   * @param smsData - SMS data containing message and mobile number
   * @returns Observable<SmsResponse>
   */
  sendSms(smsData: SmsRequest): Observable<SmsResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.subscriptionKey
    });

    console.log('Sending SMS:', smsData);

    return this.http.post<SmsResponse>(this.smsApiUrl, smsData, { headers });
  }

  /**
   * Send a notification email with predefined template
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param message - Email message content
   * @param from - Sender email (optional, defaults to system email)
   * @returns Observable<EmailResponse>
   */
  sendNotificationEmail(
    to: string, 
    subject: string, 
    message: string, 
    from: string = 'system@stb.com.tn'
  ): Observable<EmailResponse> {
    const emailData: EmailRequest = {
      from,
      to,
      subject,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">STB - ${subject}</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${message}
          </div>
          <p style="color: #666; font-size: 12px;">
            This is an automated message from STB system. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  /**
   * Send a notification email with PDF attachment
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param message - Email message content
   * @param pdfData - Base64 encoded PDF data
   * @param pdfFilename - PDF filename
   * @param from - Sender email (optional, defaults to system email)
   * @returns Observable<EmailResponse>
   */
  sendNotificationEmailWithPDF(
    to: string, 
    subject: string, 
    message: string, 
    pdfData: string,
    pdfFilename: string = 'reservation-details.pdf',
    from: string = 'system@stb.com.tn'
  ): Observable<EmailResponse> {
    // Since email clients don't support data URLs reliably, 
    // we'll include the reservation details directly in the email content
    const emailData: EmailRequest = {
      from,
      to,
      subject,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏦 STB - Société Tunisienne de Banque</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">${subject}</h2>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px; background-color: #f8f9fa;">
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #28a745; margin-top: 0; font-size: 20px;">✅ Payment Processed Successfully</h3>
              
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #155724; font-weight: bold;">
                  ${message}
                </p>
              </div>

              <!-- Reservation Details Section -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #1976d2; padding: 20px; margin: 25px 0;">
                <h4 style="color: #1976d2; margin-top: 0; font-size: 16px;">� Detailed Reservation Information</h4>
                <p style="margin: 5px 0; color: #333;">
                  <strong>📄 Document:</strong> Complete reservation details are available for download
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>💾 Format:</strong> PDF Document
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>📁 Filename:</strong> ${pdfFilename}
                </p>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 5px;">
                  <p style="margin: 0; color: #1565c0; font-weight: bold; text-align: center;">
                    📱 To download your reservation PDF:
                  </p>
                  <ol style="margin: 10px 0; color: #1565c0;">
                    <li>Log into your STB account</li>
                    <li>Go to Reservations section</li>
                    <li>Find this reservation and click "Download PDF"</li>
                  </ol>
                </div>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0; font-size: 14px;">📞 Need Help?</h4>
                <p style="margin: 5px 0; color: #856404; font-size: 13px;">
                  If you have any questions about this payment or need assistance downloading your documents, 
                  please contact STB customer service.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #343a40; color: #ffffff; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              This is an automated message from STB system. Please do not reply to this email.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              © 2025 Société Tunisienne de Banque - All rights reserved
            </p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }

  /**
   * Send a notification SMS with predefined format
   * @param mobile - Mobile number (without country code)
   * @param message - SMS message content
   * @returns Observable<SmsResponse>
   */
  sendNotificationSms(mobile: string, message: string): Observable<SmsResponse> {
    const smsData: SmsRequest = {
      message: `STB: ${message}`,
      mobile: mobile
    };

    return this.sendSms(smsData);
  }

  /**
   * Send both email and SMS notification
   * @param email - Recipient email
   * @param mobile - Recipient mobile number
   * @param subject - Email subject
   * @param message - Message content
   * @param from - Sender email (optional)
   * @returns Promise with both results
   */
  async sendDualNotification(
    email: string, 
    mobile: string, 
    subject: string, 
    message: string,
    from?: string
  ): Promise<{emailResult: EmailResponse, smsResult: SmsResponse}> {
    try {
      const [emailResult, smsResult] = await Promise.all([
        this.sendNotificationEmail(email, subject, message, from).toPromise(),
        this.sendNotificationSms(mobile, message).toPromise()
      ]);

      return { 
        emailResult: emailResult || { success: false, error: 'Email failed' }, 
        smsResult: smsResult || { success: false, error: 'SMS failed' }
      };
    } catch (error) {
      console.error('Error sending dual notification:', error);
      throw error;
    }
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns boolean
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate mobile number format (Tunisian format)
   * @param mobile - Mobile number to validate
   * @returns boolean
   */
  isValidMobile(mobile: string): boolean {
    // Tunisian mobile numbers (8 digits, starting with 2, 4, 5, 7, or 9)
    const mobileRegex = /^[24579]\d{7}$/;
    return mobileRegex.test(mobile);
  }

  /**
   * Format mobile number to Tunisian standard
   * @param mobile - Mobile number to format
   * @returns Formatted mobile number
   */
  formatMobile(mobile: string): string {
    // Remove any non-digit characters
    let cleaned = mobile.replace(/\D/g, '');
    
    // Remove country code if present (+216)
    if (cleaned.startsWith('216')) {
      cleaned = cleaned.substring(3);
    }
    
    return cleaned;
  }

  /**
   * Send reservation confirmation via email and SMS
   * @param userEmail - User's email
   * @param userMobile - User's mobile number
   * @param reservationDetails - Reservation information
   * @returns Promise with results
   */
  async sendReservationConfirmation(
    userEmail: string,
    userMobile: string,
    reservationDetails: any
  ): Promise<{emailResult: EmailResponse, smsResult: SmsResponse}> {
    const subject = 'Reservation Confirmation - STB';
    const emailMessage = `
      <h3>Your reservation has been confirmed!</h3>
      <p><strong>Reservation ID:</strong> ${reservationDetails.id}</p>
      <p><strong>Date:</strong> ${reservationDetails.date}</p>
      <p><strong>Time:</strong> ${reservationDetails.time}</p>
      <p><strong>Service:</strong> ${reservationDetails.service}</p>
      <p>Please arrive 15 minutes before your appointment time.</p>
      <p>Thank you for choosing STB!</p>
    `;
    
    const smsMessage = `Reservation confirmed! ID: ${reservationDetails.id}, Date: ${reservationDetails.date}, Time: ${reservationDetails.time}. Please arrive 15 min early.`;

    return this.sendDualNotification(userEmail, userMobile, subject, emailMessage);
  }

  /**
   * Send meeting invitation via email and SMS
   * @param userEmail - User's email
   * @param userMobile - User's mobile number
   * @param meetingDetails - Meeting information
   * @returns Promise with results
   */
  async sendMeetingInvitation(
    userEmail: string,
    userMobile: string,
    meetingDetails: any
  ): Promise<{emailResult: EmailResponse, smsResult: SmsResponse}> {
    const subject = `Meeting Invitation: ${meetingDetails.topic}`;
    const emailMessage = `
      <h3>You're invited to a meeting!</h3>
      <p><strong>Topic:</strong> ${meetingDetails.topic}</p>
      <p><strong>Date:</strong> ${meetingDetails.date}</p>
      <p><strong>Time:</strong> ${meetingDetails.time}</p>
      <p><strong>Duration:</strong> ${meetingDetails.duration} minutes</p>
      <p><strong>Organizer:</strong> ${meetingDetails.organizer}</p>
      <p><a href="${meetingDetails.joinUrl}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Meeting</a></p>
    `;
    
    const smsMessage = `Meeting invitation: ${meetingDetails.topic} on ${meetingDetails.date} at ${meetingDetails.time}. Join: ${meetingDetails.joinUrl}`;

    return this.sendDualNotification(userEmail, userMobile, subject, emailMessage);
  }

  /**
   * Send a notification email with complete reservation details
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param message - Email message content
   * @param reservation - Complete reservation object with all details
   * @param from - Sender email (optional, defaults to system email)
   * @returns Observable<EmailResponse>
   */
  sendNotificationEmailWithReservationDetails(
    to: string, 
    subject: string, 
    message: string, 
    reservation: any,
    from: string = 'system@stb.com.tn'
  ): Observable<EmailResponse> {
    // Format dates for display
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateString;
      }
    };

    const emailData: EmailRequest = {
      from,
      to,
      subject,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏦 STB - Société Tunisienne de Banque</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">${subject}</h2>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px; background-color: #f8f9fa;">
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Success Message -->
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #28a745; margin: 0; font-size: 20px;">✅ Payment Processed Successfully</h3>
                <p style="margin: 10px 0 0 0; color: #155724; font-weight: bold;">
                  ${message}
                </p>
              </div>

              <!-- Complete Reservation Details -->
              <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #1976d2; margin-top: 0; font-size: 18px; text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">
                  📋 Complete Reservation Details
                </h3>
                
                <!-- Personal Information -->
                <div style="margin: 20px 0;">
                  <h4 style="color: #495057; margin: 15px 0 10px 0; font-size: 16px; border-left: 4px solid #17a2b8; padding-left: 10px;">
                    👤 Personal Information
                  </h4>
                  <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">CIN:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">${reservation.cin || 'N/A'}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Email:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">${reservation.email || 'N/A'}</td>
                    </tr>
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Phone:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">${reservation.phoneNumber || 'N/A'}</td>
                    </tr>
                  </table>
                </div>

                <!-- Reservation Information -->
                <div style="margin: 20px 0;">
                  <h4 style="color: #495057; margin: 15px 0 10px 0; font-size: 16px; border-left: 4px solid #28a745; padding-left: 10px;">
                    📄 Reservation Information
                  </h4>
                  <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Reference Code:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-family: monospace; color: #e83e8c;">${reservation.referenceCode || 'N/A'}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Status:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">
                        <span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">
                          ${reservation.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Created Date:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">${formatDate(reservation.createdAt)}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Last Updated:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">${formatDate(reservation.updatedAt)}</td>
                    </tr>
                  </table>
                </div>

                <!-- Payment Information -->
                <div style="margin: 20px 0;">
                  <h4 style="color: #495057; margin: 15px 0 10px 0; font-size: 16px; border-left: 4px solid #ffc107; padding-left: 10px;">
                    💰 Payment Information
                  </h4>
                  <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Amount:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold; color: #28a745; font-size: 16px;">
                        ${reservation.amount || '0'} TND
                      </td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Reason:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">${reservation.reason || 'N/A'}</td>
                    </tr>
                    <tr style="background-color: #ffffff;">
                      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Payment Status:</td>
                      <td style="padding: 8px; border: 1px solid #dee2e6;">
                        <span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">
                          PAID ✅
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Important Notes -->
              <div style="background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 5px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #004085; margin-top: 0; font-size: 14px;">📝 Important Information</h4>
                <ul style="margin: 10px 0; color: #004085; padding-left: 20px;">
                  <li>Keep this email as proof of payment</li>
                  <li>Your reference code is: <strong>${reservation.referenceCode}</strong></li>
                  <li>You can download a PDF copy from your STB account</li>
                  <li>Contact customer service if you have any questions</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0; font-size: 14px;">📞 Customer Support</h4>
                <p style="margin: 5px 0; color: #856404; font-size: 13px;">
                  For any questions or assistance, please contact STB customer service.
                  Our team is available to help you with any concerns regarding this transaction.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #343a40; color: #ffffff; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              This is an automated message from STB system. Please do not reply to this email.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              © 2025 Société Tunisienne de Banque - All rights reserved
            </p>
          </div>
        </div>
      `
    };

    return this.sendEmail(emailData);
  }
}