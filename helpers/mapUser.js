module.exports = function (user) {
  return {
    email: user.email,
    id: user._id,
    isActivated: user.isActivated,
  };
};
