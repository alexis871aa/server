const Router = require("express").Router;
const userController = require("../controllers/users");
const router = new Router({ mergeParams: true });
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth");

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration,
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.get("/", authMiddleware, userController.getUsers);
router.post(
  "/request-password-reset",
  body("email").isEmail(),
  userController.requestPasswordReset,
);
router.post(
  "/reset-password/:resetToken",
  body("newPassword").isLength({ min: 3, max: 32 }),
  userController.resetPassword,
);

module.exports = router;
