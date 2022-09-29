module.exports.setPageTitle = function (title) {
  return (req, res, next) => {
    res.locals.pageTitle = title;
    next();
  };
};
