import fs, { PathOrFileDescriptor } from "fs";
import nodemailer from "nodemailer";
import path from "path";

export enum EmailTemplates {
  Invite = "invite.html",
  ConfirmParticipant = "confirm-participant.html",
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

function renderTemplate(
  filePath: PathOrFileDescriptor,
  variables: Record<string, string>
) {
  // Ler o arquivo HTML
  const template = fs.readFileSync(filePath, "utf-8");
  // Substituir as variáveis no formato ${nomeDaVariavel}
  const html = template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return variables[key] || "";
  });
  return html;
}

export const sendEmail = async (
  templateName: string,
  to: { address: string; name: string } | string,
  variables: Record<string, string>
) => {
  // const template = fs.readFileSync(basePathTemplates + templateName);
  const filePath = path.join(basePathTemplates, templateName);
  const template = renderTemplate(filePath, variables);
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: {
      address: "bernardo.258@hotmail.com",
      name: "Bernardo Pereira",
    },
    to,
    html: template,
  });

  console.log(nodemailer.getTestMessageUrl(info));
};
