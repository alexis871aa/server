const userService = require("../services/user");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/apiError");

async function registration(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
    }
    const { email, password } = req.body;
    const userData = await userService.registration(email, password);

    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(201).send(userData);
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const userData = await userService.login(email, password);

    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(201).send(userData);
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const token = await userService.logout(refreshToken);

    res.clearCookie("refreshToken");
    res.status(200).send(token);
  } catch (e) {
    next(e);
  }
}

async function activate(req, res, next) {
  try {
    const activationLink = req.params.link;

    await userService.activate(activationLink);
    res.status(200).redirect(process.env.CLIENT_URL);
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const userData = await userService.refresh(refreshToken);

    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(201).send(userData);
  } catch (e) {
    next(e);
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
    }

    const { email } = req.body;
    await userService.requestPasswordReset(email);

    res.status(200).send({
      message: "Ссылка для восстановления пароля отправлена на вашу почту",
    });
  } catch (e) {
    next(e);
  }
}

async function resetPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
    }

    const { resetToken } = req.params;
    const { newPassword } = req.body;
    await userService.resetPassword(resetToken, newPassword);

    res.status(200).send({ message: "Пароль успешно изменён" });
  } catch (e) {
    next(e);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();

    res.status(200).send(users);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  registration,
  login,
  logout,
  activate,
  refresh,
  requestPasswordReset,
  resetPassword,
  getUsers,
};
