const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendActivationMail(to, link) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Активация аккаунта на " + process.env.API_URL,
    text: "",
    html: `
        <div>
          <h1>Для активации перейдите по ссылке</h1>
          <a href="${link}">${link}</a>
        </div>
        `,
  });
}

async function sendPasswordResetMail(to, link) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Восстановление пароля на " + process.env.API_URL,
    text: "",
    html: `
        <div>
          <h1>Для восстановления пароля перейдите по ссылке</h1>
          <a href="${link}">${link}</a>
        </div>
        `,
  });
}

module.exports = {
  sendActivationMail,
  sendPasswordResetMail,
};
