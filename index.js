const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const AfricasTalking = require('africastalking');

const app = express();
const PORT = 5504;

const credentials = {
  apiKey: "7f52f27138552504ea296e122dabb89b256d7ea47fc1c4baeac2abea26b9ee0e",
  username: "goodxy",
};
const africastalking = AfricasTalking(credentials);
const sms = africastalking.SMS;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Update with your MySQL username
  password: '', // Update with your MySQL password
  database: 'paymentmethods', // Update with your database name
  connectionLimit: 20
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let counter = 0;

function insertUserData(name, phoneNumber) {
  if (!name) {
    console.error("Name is required");
    return;
  }

  const query = `INSERT INTO credentials (Name, Phone) VALUES (?, ?)`;
  const values = [name, phoneNumber];

  pool.query(query, values, (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }

    console.log('Data inserted successfully!');
    console.log('Results:', results); // Output the results to the console
    console.log('Fields:', fields); // Output the fields to the console

    // Send registration success message
    const message = `Dear ${name}, your registration was successful. Welcome to Chama App!`;
    const options = {
      to: phoneNumber, // Recipient's phone number
      message: message,
    };

    sms.send(options)
      .then(response => {
        console.log('Message sent successfully:', response);
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  });
}

function loginUser(phoneNumber, name, callback) {
  const query = `SELECT * FROM credentials WHERE Name = ? AND Phone = ?`;
  pool.query(query, [name, phoneNumber], (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
      callback(false);
      return;
    }

    callback(results.length > 0);
  });
}

app.post("/pay", (req, res) => {
  const { phoneNumber, text } = req.body;
  counter++;

  let response = "";

  if (text === "") {
    response = `CON Welcome to Chama App
        1. Register
        2. Login
        3. Terms and Conditions
        4. Know more about us`;
  } else if (text === '1') {
    response = "CON Please enter your name:";
  } else if (text === '2') {
    response = "CON Please enter your name:";
  } else if (text.startsWith('1*')) {
    const userInput = text.slice(2);
    if (!userInput.includes('*')) {
      const name = userInput;
      response = "CON Please enter your password:";
    } else {
      const userData = userInput.split('*');
      const name = userData[0];
      const password = userData[1];
      console.log("Name is", name);
      console.log("Password is", password);
      console.log(phoneNumber);
      insertUserData(name, phoneNumber);
      response = "END Registration successful!";
    }
  } else if (text.startsWith('2*')) {
    const userInput = text.slice(2);
    if (!userInput.includes('*')) {
      const name = userInput;
      response = "CON Please enter your password:";
    } else {
      const userData = userInput.split('*');
      const name = userData[0];
      const password = userData[1];
      console.log("Name is", name);
      console.log("Password is", password);
      console.log(phoneNumber);
      loginUser(phoneNumber, name, (isLoggedIn) => {
        if (isLoggedIn) {
          response = `CON Welcome, ${name}!\nPlease select an option:\n1. Make Payment\n2. Request Loan\n3. View Contribution`;
        
        } else {
          response = "END Invalid login credentials.";
        }
        res.set("Content-Type", "text/plain");
        res.send(response);
      });
      return; // Return early to avoid sending the response twice
    }
  } else if (text === '3') {

    function sendSms() {
      console.log("wwwww");
      const options = {
        to: phoneNumber,
        message:
        "Chama App Terms and Conditions:1.Membership: Eligibility: Membership is open to individuals aged 18 years and above who reside within the local community.2.Contributions: Monthly Contributions: Each member is required to contribute a fixed amount of $10 every month." };
      sms
        .send(options)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    sendSms();    

    response = "END You will get a message about our Terms and Conditions";
  } else if (text === '4') {

    function sendSms() {
      console.log("wwwww");
      const options = {
        to: phoneNumber,
        message:
          "Chama App is a revolutionary platform that aims to simplify financial transactions and empower individuals in managing their contributions and loans within a chama."   };
      
      sms
        .send(options)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    sendSms();
    response = "END You will get an sms About Us:";
  } else {
    response = "END Invalid input. Please try again.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

app.post("/actions", (req, res) => {
  const { phoneNumber, text } = req.body;
  counter++;

  let response = "";

  if (text === '1') {
    response = `CON Select Payment Amount:
      1. 200
      2. 500`;
  } else if (text === '2') {
    response = "END Request loan feature coming soon!";
  } else if (text === '3') {
    response = "END View contribution feature coming soon!";
  } else if (text === '1*1') {
    response = "END Process payment of 200";
  } else if (text === '1*2') {
    response = "END Process payment of 500";
  } else {
    response = "END Invalid input. Please try again.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
