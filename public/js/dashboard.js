// Variables to hold budget and expense values
let totalBudgetsValue = 0;
let totalExpensesValue = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchTotalExpenses();
    fetchTotalBudgets(); // Now the income will be calculated after fetching budgets and expenses
    fetchIncomeExpenseData();
});

// Function to fetch total income (now calculated as total budget - total expenses)
function calculateTotalIncome() {
    const totalIncomeValue = totalBudgetsValue - totalExpensesValue; // Subtract expenses from budget
    document.getElementById('totalIncome').innerText = `Nu. ${totalIncomeValue}`; // Display the result with currency notation
}

// Function to fetch total expenses
function fetchTotalExpenses() {
    fetch('/get-total-expenses')
        .then(response => response.json())
        .then(data => {
            totalExpensesValue = data.total || 0; // Store total expenses
            document.getElementById('totalExpenses').innerText = `Nu. ${totalExpensesValue}`; // Add currency notation before the value
            checkBudgetExceed(); // Check if budget is exceeded
        })
        .catch(error => console.error('Error fetching total expenses:', error));
}

// Function to fetch total budgets
function fetchTotalBudgets() {
    fetch('/get-total-income') // Assuming total income is treated as total budgets
        .then(response => response.json())
        .then(data => {
            totalBudgetsValue = data.total || 0; // Store total budgets
            document.getElementById('totalBudgets').innerText = `Nu. ${totalBudgetsValue}`; // Add currency notation before the value
            checkBudgetExceed(); // Check if budget is exceeded
            calculateTotalIncome(); // Calculate and display total income
        })
        .catch(error => console.error('Error fetching total budgets:', error));
}

function checkBudgetExceed() {
    const notificationElement = document.getElementById('notification');
    notificationElement.classList.remove('success', 'error'); // Remove previous classes

    if (totalExpensesValue > totalBudgetsValue) {
        notificationElement.innerText = `Your expenses exceed the total budget of Nu. ${totalBudgetsValue}!`;
        notificationElement.classList.add('error');
    } else {
        notificationElement.innerText = 'Your budget is within limits.';
        notificationElement.classList.add('success');
    }

    notificationElement.classList.add('show'); // Show the notification

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 3000);
}


// Function to fetch income and expense data for the graph and table
function fetchIncomeExpenseData() {
    fetch('/get-expenses')
        .then(response => response.json())
        .then(expenses => {
            const income = [];
            const expensesData = [];
            const labels = [];
            const tableData = {};

            expenses.forEach(expense => {
                const dateLabel = expense.date; // Adjust based on your date format
                if (!labels.includes(dateLabel)) {
                    labels.push(dateLabel);
                    tableData[dateLabel] = { income: 0, expense: 0 };
                }

                if (expense.category === 'expense') {
                    expensesData.push(expense.amount);
                    income.push(0);
                    tableData[dateLabel].expense += expense.amount;
                } else {
                    income.push(expense.amount);
                    expensesData.push(0);
                    tableData[dateLabel].income += expense.amount;
                }
            });

            // Populate the table with new data
            const tbody = document.getElementById('incomeExpenseTable').querySelector('tbody');
            tbody.innerHTML = ''; // Clear existing rows

            Object.keys(tableData).forEach(date => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${date}</td>
                    <td>Nu. ${tableData[date].income}</td> <!-- Add currency notation before the value -->
                    <td>Nu. ${tableData[date].expense}</td> <!-- Add currency notation before the value -->
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching income/expense data:', error));
}
