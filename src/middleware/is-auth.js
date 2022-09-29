module.exports = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    // no csrf token found in the request
    // redirect to
    return res.redirect("/auth/login");
  }
  if (!req.session.isVerified) {
    // if user is not verified

    return res.redirect("/auth/feedback/verification-requested");
  }

  //  if the user is authenticated
  next();
};
