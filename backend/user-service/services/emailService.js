import nodemailer from "nodemailer";
import { emailConfig } from "../config/emailConfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: emailConfig.smtp_host,
  port: emailConfig.smtp_port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

export const sendEmail = async ({ to, subject, htmlTemplateData }) => {
  const pathToTemplateHtml = path.resolve(__dirname, "../utils/emailTemplate.html");
  const template = fs.readFileSync(pathToTemplateHtml, "utf-8");

  const html = ejs.render(template, htmlTemplateData);

  const emailOptions = { from: emailConfig.user, to, subject, html };
  try {
    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
