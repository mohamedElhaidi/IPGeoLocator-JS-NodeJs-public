const path = require("path");
const notFound = (res) => {
  res.status(404).render(path.join("pages", "static", "404"), {});
};
const brokenLink = (res) => {
  res.status(404).render(path.join("pages", "static", "broken-link"), {});
};
const serverIssue = (res) => {
  res.status(500).render(path.join("pages", "static", "server-issue"), {});
};
const serverMaintenance = (res) => {
  res
    .status(503)
    .render(path.join("pages", "static", "server-maintenance"), {});
};

module.exports = { notFound, brokenLink, serverIssue, serverMaintenance };
