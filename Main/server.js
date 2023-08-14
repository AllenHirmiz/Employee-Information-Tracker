const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'change-to-your-db-password',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  employee_tracker();
});

var employee_tracker = function () {
  inquirer.prompt([{
      type: 'list',
      name: 'prompt',
      message: 'What would you like to do?',
      choices: ['View All Employee\'s'
                ,'Add Employee'
                ,'Update Employee Role'
                ,'View All Roles'
                ,'Add Role'
                ,'View All Department'
                ,'Add A Department',
                'Exit'
              ]
  }]).then((answers) => {
      if (answers.prompt === 'View All Department') {
          db.query(`SELECT * FROM department`, (err, result) => {
              if (err) throw err;
              console.log("Viewing All Departments: ");
              console.table(result);
              employee_tracker();
          });
      } else if (answers.prompt === 'View All Roles') {
          db.query(`SELECT * FROM role`, (err, result) => {
              if (err) throw err;
              console.log("Viewing All Roles: ");
              console.table(result);
              employee_tracker();
          });
      } else if (answers.prompt === 'View All Employee\'s') {
          db.query(`SELECT * FROM employee`, (err, result) => {
              if (err) throw err;
              console.log("Viewing All Employee\'s: ");
              console.table(result);
              employee_tracker();
          });
      } else if (answers.prompt === 'Add A Department') {
          inquirer.prompt([{
              // Adding a Department
              type: 'input',
              name: 'department',
              message: 'What is the name of the dpeartment?',
              validate: departmentInput => {
                  if (departmentInput) {
                      return true;
                  } else {
                      console.log('Please Add A Department!');
                      return false;
                  }
              }
          }]).then((answers) => {
              db.query(`INSERT INTO department (name) VALUES (?)`, [answers.department], (err, result) => {
                  if (err) throw err;
                  console.log(`Added ${answers.department} to the database.`)
                  employee_tracker();
              });
          })
      } else if (answers.prompt === 'Add Role') {
          db.query(`SELECT * FROM department`, (err, result) => {
              if (err) throw err;

              inquirer.prompt([
                  {
                      type: 'input',
                      name: 'role',
                      message: 'What is the name of the role?',
                      validate: roleInput => {
                          if (roleInput) {
                              return true;
                          } else {
                              console.log('Please Add A Role!');
                              return false;
                          }
                      }
                  },
                  {
                      type: 'input',
                      name: 'salary',
                      message: 'What is the salary of the role?',
                      validate: salaryInput => {
                          if (salaryInput) {
                              return true;
                          } else {
                              console.log('Please Add A Salary!');
                              return false;
                          }
                      }
                  },
                  {
                      type: 'list',
                      name: 'department',
                      message: 'Which department does the role belong to?',
                      choices: () => {
                          var array = [];
                          for (var i = 0; i < result.length; i++) {
                              array.push(result[i].name);
                          }
                          return array;
                      }
                  }
              ]).then((answers) => {
                  for (var i = 0; i < result.length; i++) {
                      if (result[i].name === answers.department) {
                          var department = result[i];
                      }
                  }

                  db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answers.role, answers.salary, department.id], (err, result) => {
                      if (err) throw err;
                      console.log(`Added ${answers.role} to the database.`)
                      employee_tracker();
                  });
              })
          });
      } else if (answers.prompt === 'Add Employee') {
          db.query(`SELECT employee.id as 'emp_id', employee.*,role.* FROM employee, role where manager_id is NULL`, (err, result) => {
              if (err) throw err;

              inquirer.prompt([
                  {
                      type: 'input',
                      name: 'firstName',
                      message: 'What is the employee\'s first name?',
                      validate: firstNameInput => {
                          if (firstNameInput) {
                              return true;
                          } else {
                              console.log('Please Add A First Name!');
                              return false;
                          }
                      }
                  },
                  {
                      type: 'input',
                      name: 'lastName',
                      message: 'What is the employee\'s last name?',
                      validate: lastNameInput => {
                          if (lastNameInput) {
                              return true;
                          } else {
                              console.log('Please Add A Salary!');
                              return false;
                          }
                      }
                  },
                  {
                      type: 'list',
                      name: 'role',
                      message: 'What is the employee\'s role?',
                      choices: () => {
                          var array = [];
                          for (var i = 0; i < result.length; i++) {
                              array.push(result[i].title);
                          }
                          var newArray = [...new Set(array)];
                          return newArray;
                      }
                  },
                  {
                      type: 'list',
                      name: 'manager',
                      message: 'Who is the employee\'s manager?',
                      choices: () => {
                          var array = [];
                          for (var i = 0; i < result.length; i++) {
                              array.push(result[i].emp_id+" "+result[i].first_name+" "+result[i].last_name);
                          }
                          var newArray = [...new Set(array)];
                          return newArray;
                      }
                  }
              ]).then((answers) => {
                  for (var i = 0; i < result.length; i++) {
                      if (result[i].title === answers.role) {
                          var role = result[i];
                      }
                  }

                  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, role.id, answers.manager.substring(0, answers.manager.indexOf(' '))], (err, result) => {
                      if (err) throw err;
                      console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`)
                      employee_tracker();
                  });
              })
          });
      } else if (answers.prompt === 'Update Employee Role') {
          db.query(`SELECT * FROM employee, role`, (err, result) => {
              if (err) throw err;

              inquirer.prompt([
                  {
                      type: 'list',
                      name: 'employee',
                      message: 'Which employee\'s role do you want to update?',
                      choices: () => {
                          var array = [];
                          for (var i = 0; i < result.length; i++) {
                              array.push(result[i].first_name+' '+result[i].last_name);
                          }
                          var employeeArray = [...new Set(array)];
                          return employeeArray;
                      }
                  },
                  {
                      type: 'list',
                      name: 'role',
                      message: 'What is their new role?',
                      choices: () => {
                          var array = [];
                          for (var i = 0; i < result.length; i++) {
                              array.push(result[i].title);
                          }
                          var newArray = [...new Set(array)];
                          return newArray;
                      }
                  }
              ]).then((answers) => {
                  for (var i = 0; i < result.length; i++) {
                      if (result[i].last_name === answers.employee) {
                          var name = result[i];
                      }
                  }

                  for (var i = 0; i < result.length; i++) {
                      if (result[i].title === answers.role) {
                          var role = result[i];
                      }
                  }

                  db.query(`UPDATE employee SET ? WHERE ?`, [{role_id: role}, {last_name: name}], (err, result) => {
                      if (err) throw err;
                      console.log(`Updated ${answers.employee} role to the database.`)
                      employee_tracker();
                  });
              })
          });
      } else if (answers.prompt === 'Exit') {
          db.end();
          console.log("See you next time!");
      }
  })
};