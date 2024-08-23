module.exports = function (income) {
  return {
    id: income._id,
    title: income.title,
    amount: income.amount,
    category: income.category,
    description: income.description,
    date: income.date,
  };
};
