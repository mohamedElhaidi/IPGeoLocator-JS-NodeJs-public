const path = require("path"),
  User = require("../models/user"),
  bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const Plan = require("../models/plan");
const { sendVerificationTo, sendMailTo } = require("../utils/mail");
const { generateString } = require("../utils/random");
const { validationResult } = require("express-validator");
const LogError = require("../utils/errorLog");
const { serverIssue, brokenLink } = require("../utils/statics");

/**
 *
 *LOGIN
 */
const getLoginPage = async (req, res) => {
  try {
    if (req.session.isAuthenticated) {
      return res.redirect("/user/dashboard");
    }
    const errorMessage = req.flash("login-error")[0];

    return res.render(path.join("pages", "auth", "login"), {
      errorMessage,
    });
  } catch (error) {
    LogError(req, error);
    return serverIssue(res);
  }
};

const postLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      console.log(e);
      // one of the values is not valid
      const { param } = e[0];

      if (param === "password")
        throw new Error(`password must be atleast 8 characters`);
      if (param === "email")
        throw new Error(`please enter a valid email address`);
    }

    const { email, password } = req.body;

    // fetch the user
    const fetchedUser = await User.findOne({ where: { email: email } });

    if (!fetchedUser) {
      // user does not exist
      throw new Error("email or password is Invalid!");
    }

    // compare password
    const isPasswordMatching = bcrypt.compareSync(
      password,
      fetchedUser.password
    );

    if (!isPasswordMatching) {
      // password did not match
      throw new Error("email or password is Invalid!");
    }

    //see if user's email is verified first
    if (!fetchedUser.verified)
      return res.redirect("/auth/feedback/verification-requested");

    /***************
      *************** 
      session
      * **************
      ***************
      */

    req.session.isAdmin = fetchedUser.isAdmin;
    req.session.isVerified = fetchedUser.verified;
    req.session.isAuthenticated = true;
    req.session.user = fetchedUser;

    // check subscription
    if (!fetchedUser.isAdmin) {
      // in case the user is not an admin
      const subscription = await fetchedUser.getSubscriptions({
        where: { end_date: { [Op.gt]: Date.now() } },
      });
      console.log("sub", subscription);
      req.session.subscription = subscription;
      if (!subscription.length) {
        req.session.subscriptionStatus = false;
        res.status(302);
        res.location("/payment/selecting-plan");
      } else {
        req.session.subscriptionStatus = true;
        res.status(302);
        res.location("/user/dashboard");
      }
    } else {
      // in case the user is an admin we make subscription status active
      req.session.subscription = null;
      req.session.subscriptionStatus = true;
      res.status(302);
      res.location("/user/dashboard");
    }

    req.session.save((err) => {
      if (err) {
        console.log(err);
        throw Error("Internal issue, please try another time!");
      }

      // sessions saved
      console.log("A new session is saved!");
    });

    // redirect to home page
    return res.end();
  } catch (error) {
    console.log(error);
    let { message } = error;
    LogError(req, error);

    // passing error message to session to be displayed after redirect
    req.flash("login-error", message);
    // redirect
    return res.redirect("/auth/login");
  }
};
// logout
const getLogout = async (req, res) => {
  try {
    req.session.isAuthenticated = false;
    req.session.user = null;
    await req.session.destroy(function (err) {
      if (err) throw err;
      return res.redirect("/");
    });
  } catch (error) {
    LogError(req, error);
    return res.redirect("/");
  }
};

/**
 *
 *REGISTERING
 */
const getRegisterPage = async (req, res) => {
  try {
    if (req.session.isAuthenticated) {
      return res.redirect("/user/dashboard");
    }
    const errorMessage = req.flash("register-error")[0];
    const selectedPlanId = req.query.plan_id;
    const plans = await Plan.findAll();
    return res.render(path.join("pages", "auth", "register"), {
      errorMessage,
      plans,
      selectedPlanId,
    });
  } catch (error) {
    LogError(req, error);
    return serverIssue();
  }
};
const postRegister = async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    company,
    address1,
    address2,
    code_postal,
    phone,
  } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      console.log(e);
      // one of the values is not valid
      const { param } = e[0];

      if (param === "first_name") throw new Error(`First name is Invalid`);
      if (param === "last_name") throw new Error(`Last name is Invalid`);
      if (param === "email") throw new Error(`email is Invalid`);
      if (param === "password") throw new Error(`password is Invalid`);
      if (param === "address1") throw new Error(`Street address is Invalid`);
      if (param === "code_postal") throw new Error(`code postal is Invalid`);
      if (param === "phone") throw new Error(`phone is Invalid`);
    }

    // check uniqueness of email
    const fetchedUser = await User.findOne({
      where: { email: email },
    });

    if (fetchedUser) {
      // user with this email already exists!
      throw new Error("This email is already been used!");
    }

    // verification code
    const verification_code = generateString(24);
    // create new user
    User.create({
      email,
      password,
      first_name,
      last_name,
      company,
      address1,
      address2,
      code_postal,
      verification_code,
      phone,
    }).catch((error) => {
      console.log(error);
      throw new Error("Cannot create a new User, please try another time!");
    });

    // send a verification mail
    sendVerificationTo(verification_code, email)
      .then(() => console.log("A verification mail has been sent to " + email))
      .catch((err) => {
        // throw new Error("")
        console.error(err);
      });

    // redirect to login page
    return res.redirect("/auth/feedback/verification-requested");

    //
  } catch (error) {
    LogError(req, error);
    console.log(error);
    let { message } = error;

    // passing error message to session to be displayed after redirect
    req.flash("register-error", message);
    // redirect
    return res.redirect("/auth/register");
  }
};

const getVerifyUser = async (req, res) => {
  try {
    const { verification_code } = req.query;
    const { email } = req.query;

    const user = await User.findOne({
      fields: ["verification_code"],
      where: { email: email },
    });

    if (!user) {
      res.status(404);
      throw new Error("invalid url");
    }
    if (user.verified) {
      return res.redirect("/auth/login");
    }
    if (user.verification_code === verification_code.trim())
      await user.update({ verified: true });

    res.redirect("/auth/feedback/verification-successed");
  } catch (error) {
    LogError(req, error);
    console.log(error);
    res.send(error.message);
  }
};

/**
 * UPDATING
 */

const postUpdateInformation = async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    company,
    address1,
    address2,
    code_postal,
    phone,
  } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      console.log(e);
      // one of the values is not valid
      const { param } = e[0];

      if (param === "first_name") throw new Error(`First name is Invalid`);
      if (param === "last_name") throw new Error(`Last name is Invalid`);
      if (param === "email") throw new Error(`email is Invalid`);
      if (param === "password") throw new Error(`password is Invalid`);
      if (param === "address1") throw new Error(`Street address is Invalid`);
      if (param === "code_postal") throw new Error(`code postal is Invalid`);
      if (param === "phone") throw new Error(`phone is Invalid`);
    }

    // find user
    const fetchedUser = await User.findOne({
      where: { email: email },
    });

    if (!fetchedUser) {
      // user with this email already exists!
      throw new Error("User not found!");
    }

    //check if password is correct
    if (!bcrypt.compareSync(password, fetchedUser.password))
      throw new Error("password is not correct!");
    // updating the user
    fetchedUser
      .update({
        email,
        password,
        first_name,
        last_name,
        company,
        address1,
        address2,
        code_postal,
        phone,
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Cannot create a new User, please try another time!");
      });

    //update user in session
    req.session.user = fetchedUser;

    // redirect to login page
    return res.redirect("/user/profile");

    //
  } catch (error) {
    console.log(error);
    LogError(req, error);
    let { message } = error;

    // passing error message to session to be displayed after redirect
    req.flash("error", message);
    // redirect
    return res.redirect("/user/profile");
  }
};

const postResetPassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      console.log(e);
      // one of the values is not valid
      const { param } = e[0];

      if (param === "current_password")
        throw new Error(`current password is Invalid`);
      if (param === "new_password") throw new Error(`new password is Invalid`);
    }

    // find user
    const fetchedUser = await User.findByPk(req.session.user.id);

    if (!fetchedUser) {
      // user with this email already exists!
      throw new Error("User not found!");
    }

    //check if password is correct
    if (!bcrypt.compareSync(current_password, fetchedUser.password))
      throw new Error("password is not correct!");

    // updating the password
    fetchedUser
      .update({
        password: new_password,
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Cannot update, please try another time!");
      });

    //destroy session
    req.session.isAuthenticated = false;
    req.session.user = null;
    req.session.destroy(function (err) {
      if (err) console.log(err);
    });

    // redirect
    return res.redirect("/");

    //
  } catch (error) {
    console.log(error);
    LogError(req, error);
    let { message } = error;

    // passing error message to session to be displayed after redirect
    req.flash("error", message);
    // redirect
    return res.redirect("/user/profile/reset-password");
  }
};

/**
 *
 */
const postForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      console.log(e);
      // one of the values is not valid
      const { param } = e[0];

      if (param === "email")
        throw new Error(`please enter a valid email address`);
    }

    // check if user exists
    const fechedUser = await User.findOne({ where: { email } });

    //
    if (fechedUser) {
      // genereting code
      const code = generateString(35);

      // storing code

      fechedUser.update({ verification_code: code });
      //
      sendMailTo(
        "Password Reset",
        `Hi there, This link will take you to the next step: <a href="${process.env.APP_URL}/auth/new-password?code=${code}&email=${email}">Click here</a>`,
        `Hi there, This link will take you to the next step: <a href="${process.env.APP_URL}/auth/new-password?code=${code}&email=${email}">Click here</a>`,
        email
      );
    }

    //
    res.render(
      path.join("pages", "auth", "feedback", "forgot-verification-request")
    );
  } catch (error) {
    let { message } = error;

    console.log(error);

    LogError(req, error);

    // passing error message to session to be displayed after redirect
    req.flash("error", message);

    // redirect
    return res.redirect("/auth/forgot-password");
  }
};

const postForgotPasswordValidation = async (req, res) => {
  try {
    const { code, email, password } = req.body;

    //
    // check if user exists
    const fetchedUser = await User.findOne({ where: { email } });

    //
    if (!fetchedUser) throw new Error("user not found!");

    // validate code
    if (fetchedUser.verification_code !== code)
      throw new Error("verification code is invalid");

    fetchedUser.update({ password: password });
    //
    sendMailTo(
      "Password Updated",
      `Your password have been updated.`,
      `Your password have been updated.`,
      email
    );

    //
    res.redirect("/auth/login");
  } catch (error) {
    let { message } = error;

    console.log(error);

    LogError(req, error);

    // passing error message to session to be displayed after redirect
    req.flash("error", message);

    // redirect
    return brokenLink(res);
  }
};
module.exports.authController = {
  getLoginPage,
  postLogin,
  getRegisterPage,
  postRegister,
  getLogout,
  getVerifyUser,
  postUpdateInformation,
  postResetPassword,
  postForgotPassword,
  postForgotPasswordValidation,
};
