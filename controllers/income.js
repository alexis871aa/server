const incomeService = require("../services/income");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/apiError");

async function getIncomes(req, res, next) {
  try {
    const incomes = await incomeService.getIncomes();
    res.status(200).send(incomes);
  } catch (e) {
    next(e);
  }
}

async function addIncome(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiError.BadRequest("Ошибка при получении данных", errors.array()),
      );
    }

    const { title, amount, category, description, date } = req.body;
    const income = await incomeService.addIncome({
      title,
      amount,
      category,
      description,
      date,
    });
    res.status(201).send(income);
  } catch (e) {
    next(e);
  }
}

async function deleteIncome(req, res, next) {
  try {
    const income = await incomeService.findIncome(req.params.id);
    if (!income) {
      return next(
        ApiError.BadRequest(
          `Доход невозможно удалить, указан неверный идентификатор`,
        ),
      );
    }
    await incomeService.deleteIncome(income.id);
    res.status(200).send({ message: "Доход был успешно удален" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getIncomes,
  addIncome,
  deleteIncome,
};
