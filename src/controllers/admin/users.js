const { validationResult } = require("express-validator");
const path = require("path");
const { Op } = require("sequelize");
const User = require("../../models/user");
const LogError = require("../../utils/errorLog");
const pagination = require("../../utils/pagination");

const getUsersPge = async (req, res) => {
  const offset = req.query.offset || 0;
  const numberPerPage = req.query.limit || 10;
  const { search } = req.query;
  let query_str = "";
  if (search) {
    query_str = `%${search.trim()}%`;
  }
  //
  //
  //
  const users = await User.findAll({
    where: search
      ? {
          [Op.or]: [
            { first_name: { [Op.like]: query_str } },
            { last_name: { [Op.like]: query_str } },
            { email: { [Op.like]: query_str } },
          ],
        }
      : {},
    limit: +numberPerPage,
    offset: +offset,
  });

  const userCount = await User.count({
    where: search
      ? {
          [Op.or]: [
            { first_name: { [Op.like]: query_str } },
            { last_name: { [Op.like]: query_str } },
            { email: { [Op.like]: query_str } },
          ],
        }
      : {},
  });

  //pagination
  const pag = pagination(userCount, offset, numberPerPage);

  // building table
  const table = {
    search,
    pagination: pag,
    heads: ["id", "First name", "Last name", "Email", "Account Status"],
    rows: [],
  };

  // injecting data
  table.rows = users.map((i) => {
    return {
      cols: [i.id, i.first_name, i.last_name, i.email, i.account_status],
    };
  });

  // render
  return res.render(path.join("pages", "admin", "users"), {
    table,
    search: search ? search.trim() : "",
  });
};

const getUserPage = (req, res) => {};

const getUserJSON = async (req, res) => {
  const { id } = req.params;
  const fetchedUser = await User.findByPk(id);
  return res.contentType("json").send(JSON.stringify(fetchedUser));
};

const postUpdateUser = async (req, res) => {
  const { email, first_name, last_name, phone } = req.body;
  const userId = req.params.id;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const e = errors.array();
      // one of the values is not valid
      const { param } = e[0];

      if (param === "first_name") throw new Error(`First name is Invalid`);
      if (param === "last_name") throw new Error(`Last name is Invalid`);
      if (param === "email") throw new Error(`email is Invalid`);
      if (param === "phone") throw new Error(`phone is Invalid`);
    }
    // get user
    const fetchedUser = await User.findByPk(userId);

    // check if user exists
    if (!fetchedUser) {
      throw new Error("user not found!");
    }

    // update user
    fetchedUser
      .update({
        email,
        first_name,
        last_name,
        phone,
      })
      .catch((error) => {
        throw new Error("Cannot user, please try another time!");
      });

    // redirect to login page
    return res.redirect("/admin/users");

    //
  } catch (error) {
    console.error(error);
    LogError(req, error);
    let { message } = error;

    // passing error message to session to be displayed after redirect
    req.flash("error", message);
    // redirect
    return res.redirect("/admin/users");
  }
};

const postBanUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) throw new Error("user not found!");

    await user.update({ account_status: false });

    res
      .contentType("json")
      .send({ status: "success", message: `[${user.email}] has been banned` });
  } catch (error) {
    console.error(error);
    res.send({ status: "fail", message: error.message });
  }
};

const postUnbanUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) throw new Error("user not found!");

    await user.update({ account_status: true });

    res.contentType("json").send({
      status: "success",
      message: `[${user.email}] has been unbanned`,
    });
  } catch (error) {
    console.error(error);
    res.send({ status: "fail", message: error.message });
  }
};

module.exports.adminUsersController = {
  getUserJSON,
  getUsersPge,
  getUserPage,
  postBanUser,
  postUnbanUser,
  postUpdateUser,
};
