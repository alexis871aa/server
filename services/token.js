const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Token = require("../models/token");
const ApiError = require("../exceptions/apiError");

async function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
}

async function validateAccessToken(token) {
  try {
    return await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

async function validateRefreshToken(token) {
  try {
    return await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

async function saveToken(userId, refreshToken) {
  const tokenData = await Token.findOne({ user: userId });

  if (tokenData) {
    tokenData.refreshToken = refreshToken;
    return tokenData.save();
  }

  return await Token.create({ user: userId, refreshToken });
}

async function removeToken(refreshToken) {
  return await Token.deleteOne({ refreshToken });
}

async function findRefreshToken(refreshToken) {
  return await Token.findOne({ refreshToken });
}

async function saveOrUpdateResetToken(userId, resetToken) {
  const hashResetToken = await bcrypt.hash(resetToken, 10);

  return await Token.findOneAndUpdate(
    { user: userId },
    {
      resetPasswordToken: hashResetToken,
      resetPasswordExpires: Date.now() + 3600000,
    },
    { upsert: true, new: true },
  );
}

async function validateResetToken(resetPasswordToken) {
  const tokenData = await Token.findOne({
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!tokenData) {
    throw ApiError.BadRequest("Токен восстановления пароля истек");
  }

  const isTokenValid = await bcrypt.compare(
    resetPasswordToken,
    tokenData.resetPasswordToken,
  );
  if (!isTokenValid) {
    throw ApiError.BadRequest("Токен восстановления пароля недействителен");
  }

  return {
    userId: tokenData.user,
  };
}

async function removeResetToken(userId) {
  return await Token.updateOne(
    { user: userId },
    { $set: { resetPasswordToken: null, resetPasswordExpires: null } },
  );
}

module.exports = {
  generateTokens,
  validateAccessToken,
  validateRefreshToken,
  saveToken,
  removeToken,
  findRefreshToken,
  saveOrUpdateResetToken,
  validateResetToken,
  removeResetToken,
};
