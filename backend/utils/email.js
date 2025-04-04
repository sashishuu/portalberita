const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = (to, token) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    html: `<p>Click to verify: <a href="${process.env.FRONTEND_URL}/verify/${token}">Verify</a></p>`
  });
};
