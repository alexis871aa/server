const User = require("../models/user");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("../services/mail");
const tokenService = require("../services/token");
const mapUser = require("../helpers/mapUser");
const ApiError = require("../exceptions/apiError");

async function registration(email, password) {
  const candidate = await User.findOne({ email });
  if (candidate) {
    throw ApiError.BadRequest(
      `Пользователь с почтовым адресом ${email} уже существует`,
    );
  }

  const hashPassword = await bcrypt.hash(password, 7);
  const activationLink = uuid.v4();

  const user = await User.create({
    email,
    password: hashPassword,
    activationLink,
  });

  await mailService.sendActivationMail(
    email,
    `${process.env.API_URL}/api/v1/users/activate/${activationLink}`,
  );

  const tokens = await tokenService.generateTokens(mapUser(user));

  await tokenService.saveToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: mapUser(user),
  };
}

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.BadRequest("Пользователь с таким email не найден");
  }
  const isPassEquals = await bcrypt.compare(password, user.password);
  if (!isPassEquals) {
    throw ApiError.BadRequest("Неверный пароль");
  }

  const tokens = await tokenService.generateTokens(mapUser(user));
  await tokenService.saveToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: mapUser(user),
  };
}

async function logout(refreshToken) {
  return await tokenService.removeToken(refreshToken);
}

async function activate(activationLink) {
  const user = await User.findOneAndUpdate(
    { activationLink },
    { isActivated: true },
  );

  if (!user) {
    throw ApiError.BadRequest(
      `Cсылка для активации ${activationLink} не найдена`,
    );
  }
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const userData = await tokenService.validateRefreshToken(refreshToken);
  const tokenFromDb = await tokenService.findRefreshToken(refreshToken);
  if (!userData || !tokenFromDb) {
    throw ApiError.UnauthorizedError();
  }

  const user = await User.findById(userData.id);
  const tokens = await tokenService.generateTokens(mapUser(user));
  await tokenService.saveToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: mapUser(user),
  };
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.BadRequest("Пользователь с таким email не найден");
  }

  const resetToken = uuid.v4();
  await tokenService.saveOrUpdateResetToken(user.id, resetToken);

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await mailService.sendPasswordResetMail(email, resetLink);
}

async function resetPassword(resetToken, newPassword) {
  const { userId } = await tokenService.validateResetToken(resetToken);

  if (!userId) {
    throw ApiError.BadRequest("Пользователь не найден");
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        password: hashPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    },
  );

  await tokenService.removeResetToken(userId);
}

async function getAllUsers() {
  return await User.find();
}

module.exports = {
  registration,
  login,
  logout,
  activate,
  refresh,
  requestPasswordReset,
  resetPassword,
  getAllUsers,
};
