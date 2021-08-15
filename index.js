/* 
 Recursive ask() for inquirer must operate within sql connection for sql to function properly.
 Hence specific queries cannot be separated into a different file.
*/
const banner = require("./src/banner");
const inquirer = require("inquirer");
const sql = require("./config/mysqlConnect");
const cTable = require("console.table");

const ask = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "task",
        message: "What would you like to do?",
        choices: [
          { value: "a", name: "Add Employee" },
          { value: "b", name: "Update Employee's Manager" },
          { value: "c", name: "Delete Employee" },
          { value: "d", name: "View All Employees" },
          { value: "e", name: "View Employees By Manager" },
          { value: "f", name: "View Employees By Department" },
          { value: "g", name: "Add Role" },
          { value: "h", name: "Delete Role" },
          { value: "i", name: "Update Employee role" },
          { value: "j", name: "View All Roles" },
          { value: "k", name: "Add Department" },
          { value: "l", name: "Delete Department" },
          { value: "m", name: "View All Departments" },
          { value: "n", name: "View Utilised Budget" },
          { value: "o", name: "Exit Program" },
        ],
      },
    ])
    .then((answers) => {
      switch (answers.task) {
        case "a":
          addEmployee();
          break;
        case "d":
          viewAllEmployees();
          break;
        case "j":
          viewAllRoles();
          break;
        case "m":
          viewAllDepartments();
          break;

        case "o":
          process.exit();
      }
      // process.exit();
      // switch (answer.task) {
      //   case "a":
      //     viewAllEmployees();

      // case "c":
      //   updateEmployeeRole();
      // case "e":
      //   addRole();
      // case "f":
      //   viewAllDepartments();
      // case "g":
      //   //   addDepartment();
      // }
      // answer.task === "h" ? process.exit() : ask();
    })
    .catch((err) => console.error(err));
};

// sql
//   .promise()
//   .query(
//     `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
//     [first_name, last_name, role_id, manager_id]
//   )

const init = () => {
  console.log(banner);
  ask();
};

init();

// Query functions
function viewAllDepartments() {
  sql
    .promise()
    .query(`SELECT * FROM department`)
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .then(() => ask())
    .catch((err) => console.error(err));
}

function viewAllRoles() {
  sql
    .promise()
    .query(
      `SELECT role.id, title, name AS department, salary FROM role INNER JOIN department ON role.department_id = department.id`
    )
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .then(() => ask())
    .catch((err) => console.error(err));
}

function viewAllEmployees() {
  sql
    .promise()
    .query(
      `SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id`
    )
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .then(() => ask())
    .catch((err) => console.error(err));
}

function addEmployee() {
  sql
    .promise()
    .query(`SELECT id, title FROM role`)
    .then(([rows, fields]) => JSON.parse(JSON.stringify(rows)))
    .then((roles) => {
      const titles = roles.map((role) => role.title);
      inquirer
        .prompt([
          {
            type: "input",
            name: "first_name",
            message: "What is the employee's first name?",
            validate: (input) => {
              const regexp = new RegExp(/^[0-9 a-z,.'-@]+$/, "i");
              return regexp.test(input) && input.length > 0
                ? true
                : "Input not valid!";
            },
          },
          {
            type: "input",
            name: "last_name",
            message: "What is the employee's last name?",
            validate: (input) => {
              const regexp = new RegExp(/^[0-9 a-z,.'-@]+$/, "i");
              return regexp.test(input) && input.length > 0
                ? true
                : "Input not valid!";
            },
          },
          {
            type: "list",
            name: "role",
            message: "What is the employee's role?",
            choices: titles,
          },
        ])
        .then((answers) => {
          sql.query(
            `SELECT id FROM role WHERE title = "${answers.role}"`,
            (err, id) => {
              if (err) throw err;
              sql.query(
                `INSERT INTO employee (first_name, last_name, role_id) VALUES ("${answers.first_name}", "${answers.last_name}", ${id[0].id})`
              );
            }
          );
        })
        .then(() => {
          sql.query(
            `SELECT id, CONCAT(first_name, " ", last_name) AS manager FROM employee WHERE manager_id IS NULL`,
            (err, data) => {
              if (err) throw err;
              const supervisors = JSON.parse(JSON.stringify(data));
              const managers = supervisors.map(
                (supervisor) => supervisor.manager
              );
              managers.unshift("None");
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((choice) => {
                  let setManagerId;
                  if (choice.manager === "None") {
                    setManagerId = null;
                  } else {
                    supervisors.forEach((supervisor) => {
                      if (supervisor.manager === choice.manager) {
                        setManagerId = supervisor.id;
                      }
                    });
                  }
                  sql.query(
                    `UPDATE employee SET manager_id = ${setManagerId} WHERE id = (SELECT MAX(id) FROM (SELECT * FROM employee) AS worker)`
                  );
                })
                .then(() => ask())
                .catch((err) => console.error(err));
            }
          );
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => console.error(err));
}

function addDepartment(name) {
  sql
    .promise()
    .query(`INSERT INTO department (name) VALUES (?)`, [name])
    .then(() => ask())
    .catch((err) => console.error(err));
}

function addRole(name, salary, department_id) {
  sql
    .promise()
    .query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [
      name,
      salary,
      department_id,
    ])
    .then(() => ask())
    .catch((err) => console.error(err));
}

function updateEmployeeRole(employee_id, role_id) {
  sql
    .promise()
    .query(`UPDATE employee SET role_id = ? WHERE id = ?`, [
      role_id,
      employee_id,
    ])
    .then(() => ask())
    .catch((err) => console.error(err));
}

// const roleNames = [];
// data[0].forEach((row) => roleNames.push(row.title));
// return roleNames;
