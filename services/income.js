const Income = require("../models/Income");
const mapIncome = require("../helpers/mapIncome");

async function getIncomes() {
  const incomes = await Income.find().sort({ createdAt: -1 });

  return incomes.map(mapIncome);
}

async function addIncome(income) {
  const incomeDb = await Income.create(income);

  return mapIncome(incomeDb);
}

async function deleteIncome(id) {
  return await Income.findByIdAndDelete({ _id: id });
}

async function findIncome(id) {
  return await Income.findById({ _id: id });
}

module.exports = {
  getIncomes,
  addIncome,
  deleteIncome,
  findIncome,
};
