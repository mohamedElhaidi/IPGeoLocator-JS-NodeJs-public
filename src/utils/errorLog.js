const ErrorLog = require("../models/errorLog");
const fs = require("fs");
const path = require("path");
function LogError(req, error) {
  try {
    const { message } = error;
    // fs.open(
    //   path.join(__dirname, "..", "logs", "errors"),
    //   `[${Date.now()}] [${message}] -- ${JSON.stringify(error)}`,
    //   (err) => {
    //     if (err) console.log(err);
    //     console.log("error logged!");
    //   }
    // );

    // fs.open(
    //   path.join(__dirname, "..", "logs", "errors.text"),
    //   "a",
    //   666,
    //   function (e, id) {
    //     if (e) throw e;
    //     fs.write(
    //       id,
    //       `[${Date.now()}] [${message}] -- ${JSON.stringify(error)}\n`,
    //       null,
    //       "utf8",
    //       function () {
    //         fs.close(id, function () {
    //           console.log("error file is updated");
    //         });
    //       }
    //     );
    //   }
    // );

    // ErrorLog.create({
    //   message,
    //   error_json: JSON.stringify(error),
    //   userId: req ? (req.session.user ? req.session.user.id : null) : null,
    // });
  } catch (error) {
    console.error(error);
  }
}

module.exports = LogError;
