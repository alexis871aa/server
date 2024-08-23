const Expense = require("../models/Expense");
const mapExpense = require("../helpers/mapExpense");

async function getExpenses() {
  const expenses = await Expense.find().sort({ createdAt: -1 });

  return expenses.map(mapExpense);
}

async function addExpense(expense) {
  const expenseDb = await Expense.create(expense);

  return mapExpense(expenseDb);
}

async function deleteExpense(id) {
  return await Expense.findByIdAndDelete({ _id: id });
}

async function findExpense(id) {
  return await Expense.findById({ _id: id });
}

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense,
  findExpense,
};
