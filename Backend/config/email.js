const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  passwordResetOTP: ({ userName, otp }) => ({
    subject: 'PGIMER EMR System - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">PGIMER EMR System</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Postgraduate Institute of Medical Education & Research</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Password Reset Request</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${userName}</strong>,
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your PGIMER EMR System account. 
            Please use the following One-Time Password (OTP) to verify your identity:
          </p>
          
          <div style="background: #f3f4f6; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Your OTP Code</h3>
            <div style="background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px; margin: 10px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px;">${otp}</span>
            </div>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>Important:</strong>
          </p>
          <ul style="color: #4b5563; font-size: 14px; line-height: 1.6; padding-left: 20px;">
            <li>This OTP is valid for <strong>15 minutes</strong> only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>For security reasons, this OTP can only be used once</li>
          </ul>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you suspect any unauthorized access to your account, 
              please contact the IT support team immediately.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>PGIMER IT Support Team</strong><br>
            Postgraduate Institute of Medical Education & Research, Chandigarh
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `
PGIMER EMR System - Password Reset OTP

Hello ${userName},

We received a request to reset your password for your PGIMER EMR System account.

Your OTP Code: ${otp}

This OTP is valid for 15 minutes only.
Do not share this OTP with anyone.

If you didn't request this password reset, please ignore this email.

Best regards,
PGIMER IT Support Team
Postgraduate Institute of Medical Education & Research, Chandigarh
    `
  }),

  passwordResetSuccess: ({ userName }) => ({
    subject: 'PGIMER EMR System - Password Reset Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">PGIMER EMR System</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Postgraduate Institute of Medical Education & Research</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #d1fae5; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: #059669; font-size: 30px;">✓</span>
            </div>
            <h2 style="color: #1f2937; margin: 0;">Password Reset Successful</h2>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${userName}</strong>,
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your password has been successfully reset. You can now log in to your PGIMER EMR System account 
            using your new password.
          </p>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">Next Steps:</h3>
            <ul style="color: #065f46; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Log in to your account with your new password</li>
              <li>Consider enabling two-factor authentication for added security</li>
              <li>Update your password regularly for better security</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>PGIMER IT Support Team</strong><br>
            Postgraduate Institute of Medical Education & Research, Chandigarh
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `
PGIMER EMR System - Password Reset Successful

Hello ${userName},

Your password has been successfully reset. You can now log in to your PGIMER EMR System account using your new password.

Next Steps:
- Log in to your account with your new password
- Consider enabling two-factor authentication for added security
- Update your password regularly for better security

Best regards,
PGIMER IT Support Team
Postgraduate Institute of Medical Education & Research, Chandigarh
    `
  }),

  // Login OTP email template
  loginOTP: ({ userName, otp }) => ({
    subject: 'PGIMER EMR System - Login Verification Code',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
            🔐 Login Verification
          </h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
            PGIMER EMR System
          </p>
        </div>
        
        <div style="padding: 30px; background: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">
            Hello ${userName},
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            You have successfully entered your credentials. To complete your login to the PGIMER EMR System, 
            please use the verification code below:
          </p>
          
          <div style="background: #f3f4f6; border: 2px dashed #d1d5db; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">
              Your Login Verification Code:
            </p>
            <div style="background: #1e40af; color: white; font-size: 32px; font-weight: bold; padding: 15px 25px; border-radius: 6px; letter-spacing: 8px; display: inline-block; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Important:</strong>
          </p>
          <ul style="color: #4b5563; font-size: 14px; line-height: 1.6; padding-left: 20px;">
            <li>This verification code is valid for <strong>5 minutes</strong> only</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't attempt to login, please contact IT support immediately</li>
            <li>For security reasons, this code can only be used once</li>
          </ul>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you suspect any unauthorized access to your account, 
              please contact the IT support team immediately at 0172-2746018.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>PGIMER IT Support Team</strong><br>
            Postgraduate Institute of Medical Education & Research, Chandigarh
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `
PGIMER EMR System - Login Verification Code

Hello ${userName},

You have successfully entered your credentials. To complete your login to the PGIMER EMR System, 
please use the verification code below:

Your Login Verification Code: ${otp}

This verification code is valid for 5 minutes only.
Do not share this code with anyone.

If you didn't attempt to login, please contact IT support immediately.

Best regards,
PGIMER IT Support Team
Postgraduate Institute of Medical Education & Research, Chandigarh
    `
  })
};

// Email sending functions
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection configuration
    await transporter.verify();
    
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"PGIMER EMR System" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
