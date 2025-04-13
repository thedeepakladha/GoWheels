document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const querySelect = document.getElementById('querySelect');
    const driversByAgeForm = document.getElementById('driversByAgeForm');
    const passengersByLocationForm = document.getElementById('passengersByLocationForm');
    const driverAgeForm = document.getElementById('driverAgeForm');
    const passengerLocationForm = document.getElementById('passengerLocationForm');
    const driverAgeResults = document.getElementById('driverAgeResults');
    const passengerLocationResults = document.getElementById('passengerLocationResults');
    const driverAgeTableBody = document.getElementById('driverAgeTableBody');
    const passengerLocationTableBody = document.getElementById('passengerLocationTableBody');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    const currentDateInput = document.getElementById('currentDate');
    
    // Set default date to today
    const today = new Date();
    currentDateInput.value = formatDate(today);
    
    // Handle query selection changes
    querySelect.addEventListener('change', function() {
      // Hide all query forms and results
      hideAllForms();
      
      // Show the selected form
      const selectedQuery = this.value;
      if (selectedQuery === 'driversByAge') {
        driversByAgeForm.classList.remove('hidden');
      } else if (selectedQuery === 'passengersByLocation') {
        passengersByLocationForm.classList.remove('hidden');
      }
    });
    
    // Handle Driver Age Form Submission
    driverAgeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Hide previous results and show loader
      driverAgeResults.classList.add('hidden');
      errorMessage.classList.add('hidden');
      loader.classList.remove('hidden');
      
      // Get form data
      const currentDate = document.getElementById('currentDate').value;
      
      // Send request to server
      fetch('/api/query/drivers-by-age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentDate }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Hide loader
        loader.classList.add('hidden');
        
        // Display results
        displayDriverAgeResults(data);
      })
      .catch(error => {
        console.error('Error:', error);
        loader.classList.add('hidden');
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
      });
    });
    
    // Handle Passenger Location Form Submission
    passengerLocationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Hide previous results and show loader
      passengerLocationResults.classList.add('hidden');
      errorMessage.classList.add('hidden');
      loader.classList.remove('hidden');
      
      // Get form data
      const minPassengers = document.getElementById('minPassengers').value;
      const locationPattern = document.getElementById('locationPattern').value;
      
      // Send request to server
      fetch('/api/query/passengers-by-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          minPassengers, 
          locationPattern 
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Hide loader
        loader.classList.add('hidden');
        
        // Display results
        displayPassengerLocationResults(data);
      })
      .catch(error => {
        console.error('Error:', error);
        loader.classList.add('hidden');
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
      });
    });
    
    // Helper function to display driver age results
    function displayDriverAgeResults(data) {
      driverAgeTableBody.innerHTML = '';
      
      if (data.length === 0) {
        driverAgeTableBody.innerHTML = '<tr><td colspan="3">No results found</td></tr>';
      } else {
        data.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.Age_Group}</td>
            <td>${row.Average_Rating}</td>
            <td>${row.Driver_Count}</td>
          `;
          driverAgeTableBody.appendChild(tr);
        });
      }
      
      driverAgeResults.classList.remove('hidden');
    }
    
    // Helper function to display passenger location results
    function displayPassengerLocationResults(data) {
      passengerLocationTableBody.innerHTML = '';
      
      if (data.length === 0) {
        passengerLocationTableBody.innerHTML = '<tr><td colspan="3">No results found</td></tr>';
      } else {
        data.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.Pickup_Location}</td>
            <td>${row.Passenger_Count}</td>
            <td>${row.Passenger_Names}</td>
          `;
          passengerLocationTableBody.appendChild(tr);
        });
      }
      
      passengerLocationResults.classList.remove('hidden');
    }
    
    // Helper function to hide all forms and results
    function hideAllForms() {
      driversByAgeForm.classList.add('hidden');
      passengersByLocationForm.classList.add('hidden');
      driverAgeResults.classList.add('hidden');
      passengerLocationResults.classList.add('hidden');
      errorMessage.classList.add('hidden');
    }
    
    // Helper function to format date as YYYY-MM-DD
    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  });
  