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
          { value: "n", name: "View Staff Budget" },
          { value: "o", name: "Exit Program" },
        ],
      },
    ])
    .then((answers) => {
      switch (answers.task) {
        case "a":
          addEmployee();
          break;
        case "b":
          updateEmployeeManager();
          break;
        case "c":
          deleteEmployee();
          break;
        case "d":
          viewAllEmployees();
          break;
        case "e":
          viewEmployeesByManager();
          break;
        case "f":
          viewEmployeesByDepartment();
          break;
        case "g":
          addRole();
          break;
        case "h":
          deleteRole();
          break;
        case "i":
          updateEmployeeRole();
          break;
        case "j":
          viewAllRoles();
          break;
        case "k":
          addDepartment();
          break;
        case "l":
          deleteDepartment();
          break;
        case "m":
          viewAllDepartments();
          break;
        case "n":
          viewStaffBudget();
          break;
        case "o":
          process.exit();
      }
    })
    .catch((err) => console.error(err));
};

const init = () => {
  console.log(banner);
  ask();
};

init();

// Query functions

function viewStaffBudget() {
  sql
    .promise()
    .query()
    .then()
    .catch((err) => console.error(err));
}

function deleteDepartment() {
  sql
    .promise()
    .query(`SELECT id, name FROM department`)
    .then((data) => JSON.parse(JSON.stringify(data[0])))
    .then((objectified) => {
      const departmentIdsAndNames = objectified;
      const departmentNames = departmentIdsAndNames.map(
        (department) => department.name
      );
      inquirer
        .prompt([
          {
            type: "list",
            name: "department",
            message: "Which department would you like to delete?",
            choices: departmentNames,
          },
        ])
        .then((result) => {
          // Get role id and name
          const [department] = departmentIdsAndNames.filter((department) => {
            return result.department === department.name;
          });
          sql.query(`DELETE FROM department WHERE id = ${department.id}`);
          console.log(`The department ${department.name} has been deleted!`);
          ask();
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function addDepartment() {
  sql
    .promise()
    .query(`SELECT * FROM department`)
    .then((data) => JSON.parse(JSON.stringify(data[0])))
    .then((results) => {
      const departmentIdsAndNames = results;
      const departmentNames = departmentIdsAndNames.map(
        (department) => department.name
      );
      inquirer
        .prompt([
          {
            type: "input",
            name: "department",
            message: "What department would you like to add?",
            validate: (input) => {
              const regexp = new RegExp(/^[0-9 a-z,.'-@]+$/, "i");
              return regexp.test(input) && input.length > 0
                ? true
                : "Input not valid!";
            },
          },
        ])
        .then((data) => {
          sql.query(`INSERT INTO department (name) VALUES (?)`, [
            `${data.department}`,
          ]);
          console.log(`New department ${data.department} has been added!`);
          ask();
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function updateEmployeeRole() {
  sql
    .promise()
    .query(
      `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`
    )
    .then(([rows, fields]) => JSON.parse(JSON.stringify(rows)))
    .then((objectified) => {
      const employeesIdsAndNames = objectified;
      const employeeNames = employeesIdsAndNames.map(
        (employee) => employee.name
      );
      inquirer
        .prompt([
          {
            type: "list",
            name: "name",
            message: "Which employee would you like to update role for?",
            choices: employeeNames,
          },
        ])
        .then((person) => {
          const [employee] = employeesIdsAndNames.filter((employee) => {
            return employee.name === person.name;
          });

          sql.query(`SELECT id, title FROM role`, (err, data) => {
            if (err) throw err;
            const roles = JSON.parse(JSON.stringify(data));
            const titles = roles.map((role) => role.title);
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "title",
                  message: `Which role would you like to assign to ${employee.name}?`,
                  choices: titles,
                },
              ])
              .then((result) => {
                const [roleIdAndTitle] = roles.filter((role) => {
                  return role.title === result.title;
                });
                sql.query(
                  `UPDATE employee SET role_id = ${roleIdAndTitle.id} WHERE id = ${employee.id}`
                );
                console.log(`The employee ${employee.name}'s role is updated!`);
                ask();
              })
              .catch((err) => console.error(err));
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function deleteRole() {
  sql
    .promise()
    .query(`SELECT id, title FROM role`)
    .then((data) => JSON.parse(JSON.stringify(data[0])))
    .then((objectified) => {
      const roleIdsAndTitles = objectified;
      const titles = roleIdsAndTitles.map((role) => role.title);
      inquirer
        .prompt([
          {
            type: "list",
            name: "title",
            message: "Which role would you like to delete?",
            choices: titles,
          },
        ])
        .then((result) => {
          // Get role id and name
          const [role] = roleIdsAndTitles.filter((role) => {
            return result.title === role.title;
          });
          sql.query(`DELETE FROM role WHERE id = ${role.id}`);
          console.log(`The role ${role.title} has been deleted!`);
          ask();
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function addRole() {
  sql
    .promise()
    .query(`SELECT * FROM department`)
    .then((data) => JSON.parse(JSON.stringify(data[0])))
    .then((objectified) => {
      const departmentIDsAndNames = objectified;
      const departments = departmentIDsAndNames.map(
        (department) => department.name
      );
      inquirer
        .prompt([
          {
            type: "input",
            name: "title",
            message: "What role would you like to add?",
            validate: (input) => {
              const regexp = new RegExp(/^[0-9 a-z,.'-@]+$/, "i");
              return regexp.test(input) && input.length > 0
                ? true
                : "Input not valid!";
            },
          },
          {
            type: "input",
            name: "salary",
            message: "How much is the salary?",
            validate: (input) => {
              const regexp = new RegExp(/^[0-9]+$/);
              return regexp.test(input) && parseInt(input) > 1000
                ? true
                : "Input not valid!";
            },
          },
          {
            type: "list",
            name: "department",
            message: "Which department does this role belong?",
            choices: departments,
          },
        ])
        .then((newRole) => {
          const [department] = departmentIDsAndNames.filter((department) => {
            return newRole.department === department.name;
          });
          sql.query(
            `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ${department.id})`,
            [`${newRole.title}`, `${newRole.salary}`]
          );
          console.log(`New role ${newRole.title} has been created!`);
          ask();
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function viewEmployeesByDepartment() {
  sql
    .promise()
    .query(`SELECT name AS department FROM department`)
    .then((rows, fields) => JSON.parse(JSON.stringify(rows[0])))
    .then((data) => {
      const departments = data.map((item) => item.department);
      inquirer
        .prompt([
          {
            type: "list",
            name: "department",
            message: "Which department would you like view employees in?",
            choices: departments,
          },
        ])
        .then((selection) => {
          const departmentName = selection.department;
          sql.query(
            `SELECT e.id, CONCAT(e.first_name, " ", e.last_name) AS employee, title, salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = "${departmentName}"`,
            (err, result) => {
              if (err) throw err;
              console.table(result);
              ask();
            }
          );
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function viewEmployeesByManager() {
  sql
    .promise()
    .query(
      `SELECT DISTINCT e.manager_id, CONCAT(m.first_name, " ", m.last_name) AS managerName FROM employee m INNER JOIN employee e ON m.id = e.manager_id`
    )
    .then((rows, fields) => JSON.parse(JSON.stringify(rows[0])))
    .then((managers) => {
      const managersIDsAndNames = managers;
      const managerNames = managersIDsAndNames.map(
        (managerIdAndName) => managerIdAndName.managerName
      );
      inquirer
        .prompt([
          {
            type: "list",
            name: "manager",
            message: "Which manager's group would you like to view?",
            choices: managerNames,
          },
        ])
        .then((result) => {
          const [targetManager] = managersIDsAndNames.filter(
            (managerIdAndName) =>
              managerIdAndName.managerName === result.manager
          );
          sql.query(
            `SELECT employee.id, CONCAT(first_name, " ", last_name) AS employee, title, salary, name AS department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE manager_id = ${targetManager.manager_id}`,
            (err, result) => {
              if (err) throw err;
              console.table(result);
              ask();
            }
          );
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

function deleteEmployee() {
  sql
    .promise()
    .query(
      `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`
    )
    .then(([rows, fields]) => JSON.parse(JSON.stringify(rows)))
    .then((data) => {
      const idsAndNames = data; // Store data for later use
      const names = idsAndNames.map((idAndName) => idAndName.name);
      inquirer
        .prompt([
          {
            type: "list",
            name: "name",
            message: "Which employee would you like to delete?",
            choices: names,
          },
        ])
        .then((person) => {
          // Get back employee's id and name for later use
          const [employee] = idsAndNames.filter((idAndName) => {
            return idAndName.name === person.name;
          });
          sql.query(`DELETE FROM employee WHERE id = ${employee.id}`);
          console.log(`The employee ${employee.name} has been deleted!`);
          ask();
        })
        .catch((err) => console.error(err));
    })

    .catch((err) => console.error(err));
}

function updateEmployeeManager() {
  sql
    .promise()
    .query(
      `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`
    )
    .then(([rows, fields]) => JSON.parse(JSON.stringify(rows)))
    .then((data) => {
      const idsAndNames = data;
      const names = idsAndNames.map((idAndName) => idAndName.name);
      inquirer
        .prompt([
          {
            type: "list",
            name: "name",
            message: "Whose manager would you like to update?",
            choices: names,
          },
        ])
        .then((person) => {
          const [employee] = idsAndNames.filter((idAndName) => {
            return idAndName.name === person.name;
          });
          sql.query(
            `SELECT id, CONCAT(first_name, " ", last_name) AS manager FROM employee WHERE manager_id IS NULL`,
            (err, data) => {
              if (err) throw err;
              const supervisors = JSON.parse(JSON.stringify(data));
              const managers = supervisors.map(
                (supervisor) => supervisor.manager
              );
              // If the target person happens to be a manager, the list should exclude self.
              const realManagers = managers.filter((manager) => {
                return manager !== employee.name;
              });

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "name",
                    message: `Who should be ${employee.name}'s manager?`,
                    choices: realManagers,
                  },
                ])
                .then((manager) => {
                  const [managerIdAndName] = supervisors.filter(
                    (supervisor) => {
                      return supervisor.manager === manager.name;
                    }
                  );
                  sql.query(
                    `UPDATE employee SET manager_id = ${managerIdAndName.id} WHERE id = ${employee.id}`
                  );
                  console.log(
                    `The employee ${employee.name}'s manager is updated!`
                  );
                  ask();
                })
                .catch((err) => console.error(err));
            }
          );
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

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
      ask();
    })
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
      ask();
    })
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
                `INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)`,
                [`${answers.first_name}`, `${answers.last_name}`, `${id[0].id}`] // Prepared statement
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
                  console.log("New Employee Added!");
                  ask();
                })
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
