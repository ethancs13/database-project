const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('public'))

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
});

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: 'root',
        database: 'main_db'
    },
);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err)
    } else {
        // console.log("Connected to the MySQL database.")
    }
})

const inquirer = require('inquirer');
// Inquirer
const questions = [
    {
        name: 'main',
        type: 'list',
        message: "What would you like to do?",
        choices: [
            'View All Employees',
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            `Add Department\n`
        ]
    }
]
const questionsAlt = [
    {
        name: 'main',
        type: 'list',
        message: "What would you like to do next?",
        choices: [
            'View All Employees',
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            `Add Department\n`
        ]
    }
]
const heading = `+----------------------------------+
|         Company Database         |
+----------------------------------+`
console.log(heading)
// question list
async function main(questions) {

    const getResponse = inquirer
        .prompt(questions)
        .then((answers) => {
            // Use user feedback.

            switch (answers.main) {
                case 'View All Employees':
                    // Use queryAsync to perform the database query
                    db.query(`SELECT e.id AS employee_id, e.first_name, e.last_name, r.title AS job_title, d.name AS department, r.salary, m.first_name AS manager_first_name, m.last_name AS manager_last_name FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id INNER JOIN employee m ON e.manager_id = m.id;
                `, function (err, results) {
                        console.table(results);
                        main(questionsAlt);
                    });
                    break;

                case 'Add Employee':
                    inquirer.prompt([
                        {
                            name: 'first',
                            type: 'input',
                            message: 'Please enter the first name for this employee.'
                        },
                        {
                            name: 'last',
                            type: 'input',
                            message: 'Please enter the last name for this employee.'
                        },
                        {
                            name: 'role',
                            type: 'input',
                            message: 'Please enter the role for this employee.'
                        },
                        {
                            name: 'manager',
                            type: 'input',
                            message: 'Please enter the manager for this employee.'
                        }
                    ]).then((response) => {
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${response.first}','${response.last}','${response.role}','${response.manager}');`)
                        db.query(`SELECT * FROM employee;`, (err, res) => {
                            console.table(res)
                        })
                    })
                    // Add logic for adding an employee

                    // console.log("Success.")

                    break;

                case 'Update Employee Role':
                    // Add logic for updating employee role
                    namePrompt()
                    async function namePrompt() {
                        await inquirer.prompt(
                            {
                                name: 'name',
                                type: 'input',
                                message: "Please enter the employee's full name",
                            }
                        ).then((answer) => {

                            let full_name = answer.name.split(' ');
                            let first_name = full_name[0];

                            let last_name = full_name[1];

                            if (answer.name == '' || !answer.name) {
                                console.log('No name entered.')
                                namePrompt()
                                return;
                            }

                            try {
                                db.query(`
                                SELECT *
                                FROM employee
                                WHERE first_name LIKE '${first_name}%'
                                AND last_name LIKE '${last_name}%';`,

                                    function (err, results, fields) {

                                        if (results.length < 1) {
                                            console.log('No matching employee found.');
                                            namePrompt();
                                            return;
                                        }
                                        if (err) {
                                            console.error(err);

                                        } else if (results) {
                                            console.table(results);

                                            inquirer.prompt(
                                                {
                                                    name: 'role',
                                                    type: 'input',
                                                    message: "Please enter the employee's new role ID",
                                                }
                                            ).then((answer) => {
                                                try {
                                                    db.query(`UPDATE employee SET role_id=${answer.role} WHERE first_name LIKE '${first_name}%'
                                                    AND last_name LIKE '${last_name}%';`);
                                                } catch (err) {
                                                    console.error(err)
                                                    return;
                                                }

                                                console.log('Employee role ID updated successfully.')
                                                main(questionsAlt);
                                                return;
                                            })
                                        }
                                    })

                            } catch (error) {
                                console.error(error);
                            }
                        })
                    }
                    break;

                case 'View All Roles':
                    // Add logic for viewing all roles
                    // job title, role id, the department that role belongs to, and the salary for that role
                    db.query(`SELECT role.title AS Job_Title, role.id AS role_id, department.name AS department_name, role.salary FROM role JOIN department ON role.department_id = department.id;`)
                    main(questionsAlt);
                    break;

                case 'Add Role':
                    // Add logic for adding a role
                    inquirer.prompt([
                        {
                            name: 'name',
                            type: 'input',
                            message: 'Please enter the name for this role.'
                        },
                        {
                            name: 'salary',
                            type: 'input',
                            message: 'Please enter the salary for this role.'
                        },
                        {
                            name: 'department',
                            type: 'input',
                            message: 'Please enter the department ID for this role.'
                        }]).then((responses) => {
                            db.query(`INSERT INTO role (title, salary, department_id)
                        VALUES ("${responses.name}",${responses.salary}, ${responses.department});
                        `);
                            console.log('Saved.')
                            main(questionsAlt);
                        })
                    break;

                case 'View All Departments':
                    // Add logic for viewing all departments
                    try {
                        db.query(`SELECT * FROM department;`, function (err, res, fields) {
                            console.table(res);
                        })
                    } catch (err) {
                        console.error(err);
                    }
                    break;

                case 'Add Department':
                    // Add logic for adding a department
                    inquirer.prompt({
                        name: 'department_name',
                        type: 'input',
                        message: "Please enter the department name to be added.",
                    }).then((answer) => {
                        db.query(`INSERT INTO department (name)
                        VALUES ("${answer.department_name}");
                        `)
                        console.log('Success.')
                        main(questionsAlt);
                    })
                    break;

                default:
                    console.log('Invalid option.');
                    main(questions);
                    return;
            }

        })
        .catch((error) => {
            if (error) {
                // Prompt couldn't be rendered in the current environment
                console.error(error)
            }
        });


}
main(questions)