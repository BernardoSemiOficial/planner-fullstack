import fs from "fs";
import nodemailer from "nodemailer";

export enum EmailTemplates {
  Invite = "invite.html",
  Confirm = "confirm.html",
}
const basePathTemplates = "src/templates/emails/";

const createTransporter = async () => {
  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  return transporter;
};

export const sendEmail = async (templateName: string) => {
  const template = fs.readFileSync(basePathTemplates + templateName);
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: {
      address: "bernardo.258@hotmail.com",
      name: "Bernardo Pereira",
    },
    to: {
      address: "user@gmail.com",
      name: "Joãozinho da Silva",
    },
    html: template,
  });

  console.log(nodemailer.getTestMessageUrl(info));
};
