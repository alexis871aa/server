module.exports = function (expense) {
  return {
    id: expense._id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  };
};
