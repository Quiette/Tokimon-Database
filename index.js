const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

var pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    console.log("used old");
}
else {
    pool = new Pool({

        user: 'postgres',
        host: 'localhost',
        database: 'tokimon',
        password: 'password'
    });
    console.log("here");
}

 
 /*var pool;
 pool=new Pool({
 connectionString: process.env.DATABASE_URL
 })*/
 

var app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'));
app.post('/home', (req, res) => res.redirect('/'));

var count = 0;
///is equivalent to .get('/', function (req, res) {res.render('pages/index'})

pool.query('DELETE FROM tokimons', (err, res) => { //REMOVES ROWS
    if (err) {
        console.log(err, res);
    }
});

pool.query('DELETE FROM trainers', (err, res) => { //REMOVES ROWS
    if (err) {
        console.log(err, res);
    }
});

pool.query("INSERT INTO tokimons (name, weight, height, fly, fight, fire, water, electric, ice, total, trainer)VALUES('Edelgard', 120, 125, 0, 55, 90, 0, 0, 0, 105, 'Byleth') ON CONFLICT (name) DO NOTHING", (err, res) => {
    if (err) {
        console.log(err, res);
    } else {
        count++;
    }
});//WORKS

pool.query("INSERT INTO tokimons (name, weight, height, fly, fight, fire, water, electric, ice, total, trainer)VALUES('Dimitri', 145, 115, 0, 60, 0, 90, 0, 24, 174, 'Byleth') ON CONFLICT (name) DO NOTHING", (err, res) => {
    if (err) {
        console.log(err, res);
    } else {
        count++;
    }
});//WORKS

pool.query("INSERT INTO tokimons (name, weight, height, fly, fight, fire, water, electric, ice, total, trainer)VALUES('Claude', 112, 123, 88, 40, 0, 0, 9 , 0, 137, 'Byleth') ON CONFLICT (name) DO NOTHING", (err, res) => {
    if (err) {
        console.log(err, res);
    } else {
        count++;
    }
});//WORKS

pool.query("INSERT INTO trainers (name,  tokinum) values('Byleth', 3) ON CONFLICT (name) DO NOTHING", (err, res) => { //REMOVES ROWS
    if (err) {
        console.log(err, res);
    }
});

pool.query("INSERT INTO trainers (name, tokinum) values('Rhea', 0) ON CONFLICT (name) DO NOTHING", (err, res) => { //REMOVES ROWS
    if (err) {
        console.log(err, res);
    }
});

//////////////////TRAINER PAGES////////////
app.post('/trainers', async (req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM trainers ORDER BY name DESC');
        const results = { 'results': (result) ? result.rows : null };
        res.render('pages/trainers', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/trainer/:name/details', async (req, res)=> {
    console.log(req.params.name);
    try {
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM tokimons WHERE trainer = '" + req.params.name + "' ");
        const results = { 'results': (result) ? result.rows : null };
        const trainer = await client.query("SELECT * FROM trainers WHERE name = '" + req.params.name + "' ");
        const trainers = { 'trainers': (trainer) ? trainer.rows : null };
        var datas = {};
        datas.results = (result) ? result.rows : null;
        datas.trainers = (trainer) ? trainer.rows : null;
        console.log("datatrain=", datas.trainers);
        const data = { 'data': (datas) };
        res.render('pages/trainersdetails', data);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/trainer/:name/edit', async (req, res) => {
    console.log(req.params.name);
    try {
        const name = { 'name': (req.params.name) };
        res.render('pages/traineredit', name);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.post('/trainer/:name/update', async (req, res) => {
    var flag = true;
    const client = await pool.connect();
    console.log("OG: ", req.params.name);
    console.log("NEW: ", req.body.newname);
    const check = await client.query('SELECT * FROM trainers ORDER BY name DESC');
    const checking = (check) ? check.rows : null;
    console.log(checking);
    checking.forEach(function (c) {
       // console.log("c", c);
       // console.log("c.name ", c.name);
        if (c.name == req.body.newname) {
            flag = false;
        }
    });
    try {
        var datas = {};
        if (flag==true) {
            const resulttoki = await client.query("UPDATE tokimons SET trainer = '" + req.body.newname + "' WHERE  trainer = '" + req.params.name + "' ");
            const resulttrainer = await client.query("UPDATE trainers SET name = '" + req.body.newname + "' WHERE  name = '" + req.params.name + "' ");
            var message = "Success! Trainer " + req.params.name + " has been renamed to " + req.body.newname;
            var newname = req.body.newname;
            datas.name = newname;
            var color = "green";
        }
        else {
            var message = "Sorry! " + req.body.newname + " is already in use.";
            var color = "red";
            datas.name = req.params.name;
        }
            datas.old = req.params.name;
            datas.msg = message;
            datas.color = color;
            console.log("datas=", datas);
            const data = { 'data': (datas) };
            res.render('pages/updatetrainer', data);
            client.release();
    }
    catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

//////////////////TOKIMON PAGES////////////
app.post('/tokimons', async (req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM tokimons');
        const results = { 'results': (result) ? result.rows : null };
        res.render('pages/tokimons', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/tokimon/:name/details', async (req, res) => {
    console.log(req.params.name);
    console.log("SELECT * FROM tokimons WHERE name = '" + req.params.name + "'");
    try {
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM tokimons WHERE name = '" + req.params.name + "'");
        const results = { 'results': (result) ? result.rows : null };
        res.render('pages/tokimonsdetails', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/tokimon/:name/edit', async (req, res) => {
    console.log(req.params.name);
    try {
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM tokimons WHERE name = '" + req.params.name + "'");
        //const results = { 'results': (result) ? result.rows : null };
        const train = await client.query('SELECT * FROM trainers ORDER BY name ASC');
        //const trainers = { 'trainers': (train) ? train.rows : null };
        var datas = {};
        datas.results =  (result) ? result.rows : null;
        datas.trainers = (train) ? train.rows : null;
        console.log("datasresultsname", datas.results.name);
        console.log("datastrainers", datas.trainers);
        const data = { 'data': (datas) };
        res.render('pages/tokimonedit', data);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});


app.post('/login', (req, res) => {
    //console.log("post");
    console.log(req.body);
    console.log(req.body.user);
    console.log(req.body.pwd);
    var username = req.body.user;
    var password = req.body.pwd;
    res.send(`Hello, ${username}. You have password ${password}`) //`` means act as really long strings
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

