const { validationResult } = require("express-validator");
const path = require("path");
const Ticket = require("../models/ticket");
const { sendMailTo } = require("../utils/mail");
const getContactPage = (req, res) => {
  res.render(path.join("pages", "contact"));
};
const postTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      console.log(e);
      // one of the values is not valid
      const { param } = e[0];

      if (param === "full_name") throw new Error(`fulle name should be valid`);
      if (param === "email") throw new Error(`email is Invalid`);
      if (param === "title") throw new Error(`Title is Invalid`);
      if (param === "message") throw new Error(`Message is Invalid`);
    }

    const { full_name, title, email, message } = req.body;

    /**
     * creating the ticket
     */
    const ticket = await Ticket.create({ title, full_name, email, message });

    /**
     * sending an email
     */
    sendMailTo(
      "Ticket has been submitted!",
      `Thank you for submitting your ticket: "${title}", we will reply to your email as soon as possible`,
      `Thank you for submitting your ticket: "${title}", we will reply to your email as soon as possible`,
      email
    );
    res.render(path.join("pages", "contact", "feedback", "success"));
  } catch (error) {
    console.log(error);
    LogError(req, error);
    req.flash("error", error.message);
    res.redirect("/contact");
  }
};

module.exports.contactController = { getContactPage, postTicket };
