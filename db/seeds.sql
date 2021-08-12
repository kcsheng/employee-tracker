INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"), 
       ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
       ("Salesperson", 80000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 120000, 2),
       ("Account Manager", 160000, 3),
       ("Accountant", 125000, 3),
       ("Legal Team Lead", 250000, 4),
       ("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, null),
       ("Mike", "Chan", 2, 1),
       ("Tim", "McDonald", 2, 1),
       ("Ash", "Rodridge", 3, null),
       ("Kev", "Topz", 4, 4),
       ("Eve", "Mitchel", 4, 4),
       ("Kurt", "Singh", 5, null),
       ("Maira", "Brown", 6, 7),
       ("Debra", "Donovan", 6, 7),
       ("Sarah", "Lourd", 7, null),
       ("Tom", "Allen", 8, 10),
       ("Elec", "Baldwen", 8, 10);