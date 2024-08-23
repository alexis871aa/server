const expenseService = require("../services/expense");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/apiError");

async function getExpenses(req, res, next) {
  try {
    const expenses = await expenseService.getExpenses();
    res.status(200).send(expenses);
  } catch (e) {
    next(e);
  }
}

async function addExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiError.BadRequest("Ошибка при получении данных", errors.array()),
      );
    }

    const { title, amount, category, description, date } = req.body;
    const expense = await expenseService.addExpense({
      title,
      amount,
      category,
      description,
      date,
    });
    res.status(201).send(expense);
  } catch (e) {
    next(e);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const expense = await expenseService.findExpense(req.params.id);
    if (!expense) {
      return next(
        ApiError.BadRequest(
          `Расход невозможно удалить, указан неверный идентификатор`,
        ),
      );
    }
    await expenseService.deleteExpense(expense.id);
    res.status(200).send({ message: "Расход был успешно удален" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense,
};
