document.getElementById('generateReportBtn').addEventListener('click', async () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    try {
        const response = await fetch(`/api/monthly-report?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const reportData = await response.json();
        
        // Clear existing table data
        const reportTableBody = document.querySelector('#reportTable tbody');
        reportTableBody.innerHTML = '';

        // Populate the table with new data
        reportData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.month}</td>
                <td>${item.total_income}</td>
                <td>${item.total_expense}</td>
            `;
            reportTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching report data:', error);
        alert('Failed to generate report. Please try again later.');
    }
});
