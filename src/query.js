const sql = require("../config/mysqlConnect");
const cTable = require("console.table");

const viewAllDepartments = () => {
  sql
    .promise()
    .query(`SELECT * FROM department`)
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .catch(console.error)
    .then(() => sql.end());
};

const viewAllRoles = () => {
  sql
    .promise()
    .query(
      `SELECT role.id, title, name AS department, salary FROM role INNER JOIN department ON role.department_id = department.id`
    )
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .catch(console.error)
    .then(() => sql.end());
};

const viewAllEmployees = () => {
  sql
    .promise()
    .query(
      `SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id`
    )
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .catch(console.error)
    .then(() => sql.end());
};

const addDepartment = (name) => {
  sql
    .promise()
    .query(`INSERT INTO department (name) VALUES (?)`, [name])
    .catch(console.error)
    .then(() => sql.end());
};

const addRole = (name, salary, department_id) => {
  sql
    .promise()
    .query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [
      name,
      salary,
      department_id,
    ])
    .catch(console.error)
    .then(() => sql.end());
};

const addEmployee = (first_name, last_name, role_id, manager_id) => {
  sql
    .promise()
    .query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
      [first_name, last_name, role_id, manager_id]
    )
    .catch(console.error)
    .then(() => sql.end());
};

const updateEmployeeRole = (employee_id, role_id) => {
  sql
    .promise()
    .query(`UPDATE employee SET role_id = ? WHERE id = ?`, [
      role_id,
      employee_id,
    ])
    .catch(console.error)
    .then(() => sql.end());
};
