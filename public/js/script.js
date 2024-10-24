// script.js

const expenseModal = document.getElementById('expenseModal');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const closeModal = document.querySelector('.close');
const expenseForm = document.getElementById('expenseForm');

let currentExpenseId = null; // Track the ID of the expense being edited

// Show modal for adding a new expense
addExpenseBtn.onclick = () => {
    document.getElementById('modalTitle').innerText = 'Add Items';
    expenseForm.reset();
    currentExpenseId = null; // Reset the ID for a new expense
    expenseModal.style.display = 'block';
    expenseForm.onsubmit = (event) => {
        event.preventDefault();
        addExpense();
    };
};

// Close modal
closeModal.onclick = () => {
    expenseModal.style.display = 'none';
};

// Close modal when clicking outside of it
window.onclick = (event) => {
    if (event.target === expenseModal) {
        expenseModal.style.display = 'none';
    }
};

// Function to fetch expenses and populate the table
function fetchExpenses() {
    fetch('/get-expenses')
        .then(response => response.json())
        .then(expenses => {
            const expensesTableBody = document.querySelector('#expensesTable tbody');
            expensesTableBody.innerHTML = ''; // Clear existing rows

            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.id}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.category}</td>
                    <td>${expense.description}</td>
                    <td>${expense.date}</td>
                    <td>
                        <button onclick="editExpense(${expense.id})">Edit</button>
                        <button onclick="deleteExpense(${expense.id})">Delete</button>
                    </td>
                `;
                expensesTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching expenses:', error));
}

function addExpense() {
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    console.log('Adding Expense:', { amount, category, description, date }); // Log the data being sent

    fetch('/add-income-expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, category, description, date }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        expenseModal.style.display = 'none';
        expenseForm.reset();
        fetchExpenses(); // Refresh the table after adding an expense
    })
    .catch(error => console.error('Error adding expense:', error));
}


function editExpense(id) {
    currentExpenseId = id; // Set the current expense ID
    // Fetch the expense data from the server
    fetch(`/get-expense/${id}`)
        .then(response => {
            if (!response.ok) { // Check for HTTP errors
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(expense => {
            // Populate the modal with expense data
            document.getElementById('amount').value = expense.amount;
            document.getElementById('category').value = expense.category;
            document.getElementById('description').value = expense.description;
            
            // Format the date to 'yyyy-MM-dd'
            const formattedDate = new Date(expense.date).toISOString().slice(0, 10);
            document.getElementById('date').value = formattedDate;

            // Show the modal
            document.getElementById('modalTitle').innerText = 'Edit Expense';
            expenseModal.style.display = 'block';

            // Change form submit handler to update instead of add
            expenseForm.onsubmit = (event) => {
                event.preventDefault();
                updateExpense(currentExpenseId); // Pass the ID for updating
            };
        })
        .catch(error => console.error('Error fetching expense for edit:', error));
}


function updateExpense(id) {
    const data = {
        amount: document.getElementById('amount').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        date: document.getElementById('date').value,
    };

    fetch(`/update-income-expense/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        console.log('Response Status:', response.status); // Log response status
        return response.json(); // Parse response as JSON
    })
    .then(result => {
        console.log('Update result:', result); // Log the result
        if (result.message) {
            alert(result.message);
            // Optionally refresh the expenses table
            fetchExpenses(); // Call your function to refresh the table
        }
    })
    .catch(error => console.error('Error updating expense:', error));
}


// Function to delete an expense
function deleteExpense(id) {
    fetch(`/delete-income-expense/${id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchExpenses(); // Refresh the table after deleting an expense
    })
    .catch(error => console.error('Error deleting expense:', error));
}

// Initial fetch of expenses
fetchExpenses();
function fetchExpenses() {
    fetch('/get-expenses')
        .then(response => response.json())
        .then(expenses => {
            const expensesTableBody = document.querySelector('#expensesTable tbody');
            expensesTableBody.innerHTML = ''; // Clear existing rows
            let totalExpenses = 0; // Initialize total expenses

            expenses.forEach(expense => {
                totalExpenses += parseFloat(expense.amount); // Accumulate total expenses

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.id}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.category}</td>
                    <td>${expense.description}</td>
                    <td>${expense.date}</td>
                    <td>
                        <button onclick="editExpense(${expense.id})">Edit</button>
                        <button onclick="deleteExpense(${expense.id})">Delete</button>
                    </td>
                `;
                expensesTableBody.appendChild(row);
            });

        })
        .catch(error => console.error('Error fetching expenses:', error));
}
