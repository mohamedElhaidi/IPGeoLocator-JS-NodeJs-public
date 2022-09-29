module.exports.isFlash = (req, res, next) => {
  res.locals.errorMessage = req.flash("error")[0];
  next();
};
