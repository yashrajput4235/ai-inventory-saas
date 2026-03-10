const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 resolution to prevent ENETUNREACH on Render's IPv6 outbound
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;