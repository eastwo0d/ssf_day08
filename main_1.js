//load lib
const express = require('express');
const request = require('request');
const hbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


//tunables
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

//create an instance of the application
const app = express();

//configure handlebars
app.engine('hbs', hbs());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.use('/welcome', (req, res)=>{
    res.status(200);
    res.type('text/html');
    res.sendFile(__dirname + '/public/welcome.html')
})
let db = {}

app.get('/cart', (req,res) => {
    const name = req.query.name
    let cart = [];
    if( name in db) {
        cart = db[name]
    } else {
        db[name] = []
    }
    res.cookie("custName", name, {httpOnly:true, maxAge: 1000* 60 * 60 * 24})
    console.log(name);

    res.status(200);
    res.type('text/html');
    res.render('cart', {
        layout : false,
        name : name,
        item : cart
    })
})

app.post('/cart', (req, res)=> {
    const name = req.body.name;
    const toAdd = req.body.toAdd;
    const cart = db[name] || [];
    cart.push(toAdd);

    res.status(200);
    res.type('text/html');
    res.render('cart', {
        layout : false,
        name : name,
        item : cart
    })
})

app.post('/update', (req,res)=> {
    const name = req.body.name
    const delItem = req.body.delItem
    console.log(delItem);
    console.log(name)
    console.log(db[name]);
})


app.use(/.*/, express.static(__dirname + '/public'))

//start the server
app.listen(PORT, () =>{
    console.info(`Application started on ${new Date()} at port ${PORT}`)
})