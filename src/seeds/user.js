const User = require("../models/user");

const users = [
  {
    isAdmin: 1,
    email: "test@gmail.com",
    first_name: "Hanter",
    last_name: "Kun",
    company: null,
    address1: "Street 1 ",
    address2: null,
    code_postal: 12346,
    phone: "+2566989999",
    password: "1",
    verified: true,
  },
];

const init = function () {
  for (let user of users) {
    User.create(user);
  }
};

module.exports.UserSeeds = { init };
