const API_KEY = 'b564c9be026e4cafb473fe581e60dc11';
const BASE_URL = `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`;

const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const expenseCurrency = document.getElementById('expense-currency');
const expenseCategory = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense');
const expensesList = document.getElementById('expenses');
const spendingChartCtx = document.getElementById('spendingChart').getContext('2d');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

async function getExchangeRates() {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data.rates;
}

async function convertCurrency(amount, fromCurrency, toCurrency = 'USD') {
  const rates = await getExchangeRates();
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  return (amount / fromRate) * toRate;
}

function renderExpenses() {
  expensesList.innerHTML = '';
  expenses.forEach((expense, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${expense.name} - ${expense.amount} ${expense.currency} (${expense.category})</span>
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    expensesList.appendChild(li);
  });
  updateChart();
}

addExpenseBtn.addEventListener('click', async () => {
  const name = expenseName.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const currency = expenseCurrency.value;
  const category = expenseCategory.value;

  if (name && amount && currency && category) {
    const convertedAmount = await convertCurrency(amount, currency);
    const expense = {
      name,
      amount,
      currency,
      category,
      convertedAmount,
    };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    expenseName.value = '';
    expenseAmount.value = '';
  } else {
    alert('Please fill all fields!');
  }
});

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
}

function updateChart() {
  const categories = {};
  expenses.forEach(expense => {
    if (categories[expense.category]) {
      categories[expense.category] += expense.convertedAmount;
    } else {
      categories[expense.category] = expense.convertedAmount;
    }
  });

  const chart = new Chart(spendingChartCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Spending by Category',
        data: Object.values(categories),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
        ],
      }],
    },
  });
}

renderExpenses();