//load lib
const express = require('express');
const request = require('request');
const hbs = require('express-handlebars');
const mysql = require('mysql');
const bodyParser = require('body-parser');

//tunables
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

//sql query statements
const SQL_Employee = 'select * from employees limit ? offset ?'
const SQL_Employee_Search = 'select * from employees where first_name like ? limit 20 '
const SQL_Team_Search = 'select * from employees'

//create connection pool
const pool = mysql.createPool(require('./config.json'));

//create an instance of the application
const app = express();

//configure handlebars
app.engine('hbs', hbs());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.get('/employee', (req,res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    pool.getConnection((err,conn) => {
        if(err) {
            res.status(400);
            res.type('text/plain')
            res.send(err);
            return;
        }
        conn.query(SQL_Employee,
            [ limit, offset ],
            (err,results) =>{
                conn.release();
                const prevOff = offset - limit;
                const nextOff = offset + limit;
                res.status(200);
                res.type('text/html');
                res.render('employee', {
                    layout : false,
                    employee : results,
                    prev_offset : prevOff,
                    next_offset : nextOff
                })

            })
    }
)}
)

app.get('/search', (req,res) => {
    const empName = req.query.empName;
    pool.getConnection((err, conn) => {
        if(err) {
            res.status(400);
            res.type('text/plain')
            res.send(err);
            return;
        }
        conn.query(SQL_Employee_Search,
            [`%${empName}%`],
            (err, results) => {
                conn.release();
                res.status(200);
                res.type('text/html');
                res.render('team', {
                    layout : false,
                    employee : results,
                    empName : empName
                })
            })
    })
})

const team = []

app.post('/team', (req,res) => {
    const newName = req.body.newName;
    console.log(newName)
    team.push(newName)
    console.log(team)
    
    res.status(200);
    res.type('text/html');
    res.render('team', {
        layout : false,
        team : team
    })
})

app.use(/.*/, express.static(__dirname + '/public'))

//start the server
app.listen(PORT, () =>{
    console.info(`Application started on ${new Date()} at port ${PORT}`)
})