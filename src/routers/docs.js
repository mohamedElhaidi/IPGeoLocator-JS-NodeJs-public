const { setPageTitle } = require("../middleware/setTitle");
const path = require("path");

const docsRouter = require("express").Router();

docsRouter.get("/", setPageTitle("Documentation"), (req, res) => {
  res.render(path.join("pages", "docs"));
});
docsRouter.get(
  "/json",
  setPageTitle("JSON Format Documentation"),
  (req, res) => {
    res.render(path.join("pages", "docs", "sub", "json"));
  }
);
docsRouter.get("/xml", setPageTitle("XML Format Documentation"), (req, res) => {
  res.render(path.join("pages", "docs", "sub", "xml"));
});
docsRouter.get("/csv", setPageTitle("CSV Format Documentation"), (req, res) => {
  res.render(path.join("pages", "docs", "sub", "csv"));
});
docsRouter.get(
  "/newLine",
  setPageTitle("NEWLINE Format Documentation"),
  (req, res) => {
    res.render(path.join("pages", "docs", "sub", "newLine"));
  }
);

module.exports = docsRouter;
