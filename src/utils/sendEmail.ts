import nodemailer from "nodemailer";
interface EmailResponse {
  data?: {
    id: string;
    message?: string;
  };
  error?: {
    name: string;
    message: string;
  };
}

interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendMail = async (
  params: SendMailParams
): Promise<EmailResponse> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      secure: true,
    });

    const mailOptions = await transporter.sendMail({
      from: "Disposify",
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    return {
      data: {
        id: mailOptions.messageId,
        message: "Email sent successfully",
      },
    };
  } catch (error) {
    return {
      error: {
        name: "EmailError",
        message: (error as Error).message,
      },
    };
  }
};
