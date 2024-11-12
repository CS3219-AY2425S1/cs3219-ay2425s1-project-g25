import dotenv from "dotenv";

dotenv.config();

export const emailConfig = {
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: Number(process.env.SMTP_PORT),
};
