const Router = require("express").Router;

const router = new Router({ mergeParams: true });

router.use("/users", require("./users"));
router.use("/incomes", require("./incomes"));
router.use("/expenses", require("./expenses"));

module.exports = router;
