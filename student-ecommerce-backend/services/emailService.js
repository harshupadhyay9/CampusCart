const nodemailer = require("nodemailer");

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider (e.g., Gmail, SendGrid)
  auth: {
    user: "campusscart@gmail.com", // Replace with your email
    pass: "campuscart@123", // Replace with your email password or App password
  },
});

// Function to send email
const sendEmail = (to, subject, htmlContent) => {
  const mailOptions = {
    from: "campusscart@gmail.com",
    to: to,
    subject: subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
