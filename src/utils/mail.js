const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const generateVerificationUrl = (email, verification_code) => {
  return (
    process.env.APP_VERIFICATION_DOMAIN +
    "/auth/verify?verification_code=" +
    verification_code +
    "&email=" +
    email
  );
};
const generateVerification_HTML = (recieverEmail, verification_code) => {
  return `Welcome to IPLocator.com,

  Thank you for registering at IPLocator.com, your account is not activated yet, please follow the link
  below to verify your account.
  <a href="${generateVerificationUrl(
    recieverEmail,
    verification_code
  )}">Click here to verify your account</a>`;
};
const generateVerification_TEXT = (recieverEmail, verification_code) => {
  return `Welcome to IPLocator.com,

  Thank you for registering at IPLocator.com, your account is not activated yet, please follow the link
  below to verify your account.
  ${generateVerificationUrl(recieverEmail, verification_code)}`;
};

module.exports.sendVerificationTo = (verification_code, to) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    })
  );
  const msg = {
    to, // Change to your recipient
    from: "no-reply@em5511.hantercodes.com", // Change to your verified sender
    subject: "Verification mail! - " + process.env.APP_NAME,
    text: generateVerification_TEXT(to, verification_code),
    html: generateVerification_HTML(to, verification_code),
  };
  return transporter.sendMail(msg);
};

module.exports.sendMailTo = (title, text, html, to) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    })
  );
  const msg = {
    to, // Change to your recipient
    from: "no-reply@em5511.hantercodes.com", // Change to your verified sender
    subject: title + " - " + process.env.APP_NAME,
    text,
    html,
  };
  return transporter.sendMail(msg);
};
