import nodemailer from "nodemailer";

// export type ISendEmail = 

type is = string
export type ISendEmail = {
  recipientEmail: is
  subject: is,
  message: is,
}


export const sender = ()=> {}
export class MailConfig{

  static config = {

  }

}

export default class MailService {
  recipientEmail: String;

  transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    debug: true, // Enable debug mode
  });

  /**
   * Function to send an email
   * @param {string} recipientEmail - The email address of the recipient
   * @param {string} subject - The subject of the email
   * @param {string} message - The content of the email
   */
  // sendEmail = ({ recipientEmail, subject,message }: ISendEmail) => {
    sendEmail = (params: ISendEmail) => {
    const mailOptions = {
      from: "kemboi@local.com",
      to: params.recipientEmail,
      subject: params.subject,
      text: params.message,
    };

    this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  };
}

export const sendMail = (new MailService()).sendEmail
