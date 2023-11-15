USE main_db;

INSERT INTO department (name)
VALUES ("Technology"),
       ("Sales"),
       ("Marketing"),
       ("Engineering"),
       ("Accounting");

INSERT INTO role (title, salary, department_id)
VALUES ("Owner", 50000, 1),
       ("Manager", 30000, 2),
       ("Maintenance", 40000, 3),
       ("Janitor", 20000, 4),
       ("Analyst", 40000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Jane', 'Smith', 2, 1),
       ('Bob', 'Johnson', 4, 1),
       ('Alice', 'Williams', 5, 1);
