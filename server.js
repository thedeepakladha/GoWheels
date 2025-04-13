require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to database
connection.connect(err => {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }
    console.log('Connected to the database successfully');
  });
  
  // API Endpoint 1: Driver age group query
  app.post('/api/query/drivers-by-age', (req, res) => {
    const { currentDate } = req.body;
    
    const query = `
      SELECT 
        CASE 
          WHEN YEAR('${currentDate}') - YEAR(Date_of_Birth) < 25 THEN 'Under 25'
          WHEN YEAR('${currentDate}') - YEAR(Date_of_Birth) BETWEEN 25 AND 35 THEN '25-35'
          WHEN YEAR('${currentDate}') - YEAR(Date_of_Birth) BETWEEN 36 AND 45 THEN '36-45'
          ELSE 'Over 45'
        END AS Age_Group,
        ROUND(AVG(Rating), 2) AS Average_Rating,
        COUNT(*) AS Driver_Count
      FROM Drivers
      GROUP BY Age_Group
      ORDER BY Age_Group;
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
  
  // API Endpoint 2: Passengers by pickup location
  app.post('/api/query/passengers-by-location', (req, res) => {
    const { minPassengers, locationPattern } = req.body;
    
    let query = `
      SELECT 
        p.Pickup_Location,
        COUNT(*) AS Passenger_Count,
        GROUP_CONCAT(p.Name ORDER BY p.Name SEPARATOR ', ') AS Passenger_Names
      FROM 
        Passenger p
      WHERE 
        p.Pickup_Location IS NOT NULL
    `;
    
    // Add location filter if provided
    if (locationPattern && locationPattern.trim() !== '') {
      query += ` AND p.Pickup_Location LIKE ?`;
    }
    
    query += `
      GROUP BY 
        p.Pickup_Location
      HAVING 
        COUNT(*) >= ?
      ORDER BY 
        Passenger_Count DESC, p.Pickup_Location;
    `;
    
    const params = [];
    if (locationPattern && locationPattern.trim() !== '') {
      params.push(`%${locationPattern}%`);
    }
    
    // Default minimum passengers to 1 if not provided
    params.push(minPassengers ? parseInt(minPassengers) : 1);
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });