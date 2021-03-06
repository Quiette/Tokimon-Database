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
/////is equivalent to .get('/', function (req, res) {res.render('pages/index'})

/*pool.query('DELETE FROM tokimons', (err, res) => { //REMOVES ROWS
    if (err) {
        console.log(err, res);
    }
});

pool.query('DELETE FROM trainers', (err, res) => { //REMOVES ROWS
    if (err) {
        console.log(err, res);
    }
});*/

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
    if (req.params.name == req.body.newname) {
        console.log("same name");
        flag = false;
    }
    else {
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
    }
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

app.get('/trainer/:name/delete', async (req, res) => {
    const client = await pool.connect();
    var check = await client.query("SELECT tokinum FROM trainers WHERE name= '" + req.params.name+"'");
    const checking = (check) ? check.rows : null;
    console.log("checking[0].tokinum: ", checking[0].tokinum);
    var datas = {};
    var message; 
    var color;
    if (checking[0].tokinum == 0) {
        check = await client.query("DELETE FROM trainers WHERE name= '" + req.params.name + "'");
        message = "Trainer " + req.params.name + " has been deleted!";
        color = "green";

    }
    else {
        message = "Trainer " + req.params.name + " has " + checking[0].tokinum + " Tokimon and therefore cannot be deleted!";
        color = "red";
    }
    console.log("msg: ", message);
    datas.color = color;
    datas.message = message;
    datas.name = req.params.name;
    const data = { 'data': (datas) };
    res.render('pages/trainerdel', data);
    //const check = await client.query("DELETE FROM trainers WHERE name= '" + req.params.name+"'");*/
});

app.get('/trainer/new', async (req, res) => {
    res.render('pages/trainernew');
});

app.post('/trainer/add', async (req, res) => {
    const client = await pool.connect();
    var flag = true;
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
        if (flag == true) {
            const resulttoki = await client.query("INSERT INTO trainers(name, tokinum) values('" + req.body.newname +"', 0)");
            var message = "Success! Trainer " + req.body.newname + " has been added!";
            var name = req.body.newname;
            datas.name = name;
            var color = "green";
        }
        else {
            var message = "Sorry! " + req.body.newname + " is already in use.";
            var color = "red";
            datas.name = "Trainer Not";
        }
        datas.old = req.params.name;
        datas.msg = message;
        datas.color = color;
        console.log("datas=", datas);
        const data = { 'data': (datas) };
        res.render('pages/traineradd', data);
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

app.post('/tokimon/:name/:trainer/update', async (req, res) => {
    var sametrainer = false;
    var totalstats = parseInt(req.body.newfly) + parseInt(req.body.newfight) + parseInt(req.body.newfire) + parseInt(req.body.newwater) + parseInt(req.body.newelectric) + parseInt(req.body.newice);
    console.log("newstatstotal: ", totalstats);
    var usedname = false;
    const client = await pool.connect();
    console.log("OG name: ", req.params.name);
    console.log("NEW name: ", req.body.newname);
    if (req.params.name == req.body.newname) {
        usedname == false
        console.log("usedname=false");
    }
    else {
        const check = await client.query('SELECT * FROM tokimons ORDER BY name DESC');
        const checking = (check) ? check.rows : null;
        console.log(checking);
        checking.forEach(function (c) {
            // console.log("c", c);
            // console.log("c.name ", c.name);
            if (c.name == req.body.newname) {
                usedname = true;
                console.log("usedname=true");
            }
        });
    }
    console.log("OG trainer: ", req.params.trainer);
    console.log("NEW trainer: ", req.body.newtrainer);
    if (req.body.newtrainer == req.params.trainer) {
        sametrainer = true;
    }
    try {
        var edittrain = true;
        var datas = {};
        if (usedname == false) { //update name not in use (expect if own name)
            var resulttoki = await client.query("UPDATE tokimons SET name = '" + req.body.newname+ "' WHERE name = '" + req.params.name + "' ");
           resulttoki = await client.query("UPDATE tokimons SET weight=" + req.body.neww + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET height=" + req.body.newh + " WHERE name = '" + req.body.newname + "' ");
           resulttoki = await client.query("UPDATE tokimons SET fly=" + req.body.newfly + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET fight=" + req.body.newfight + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET fire=" + req.body.newfire + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET water=" + req.body.newwater + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET electric=" + req.body.newelectric + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET ice=" + req.body.newice + " WHERE name = '" + req.body.newname + "' ");
            resulttoki = await client.query("UPDATE tokimons SET total=" + totalstats + " WHERE name = '" + req.body.newname + "' ");
           resulttoki = await client.query("UPDATE tokimons SET trainer='" + req.body.newtrainer + "' WHERE name = '" + req.body.newname + "' ");
            // need to update const resulttrainer = await client.query("UPDATE trainers SET name = '" + req.body.newname + "' WHERE  name = '" + req.params.name + "' ");
            var message = "Success! Tokimon " + req.params.name + " has been updated!";
            var newname = req.body.newname;
            datas.name = newname;
            var color = "green";
        }
        else { //update name in use, exitttt with this message
            var message = "Sorry! " + req.body.newname + " is already in use.";
            var color = "red";
            datas.name = req.params.name;
            edittrain = false;
        }
        if (sametrainer == false && edittrain == true) {
            var lowercount=0;
            var highercount = 0;//update trainer for count-- and new trainer count++
            console.log("START lower and higher: ", lowercount, highercount);
            console.log('in fixing trainer')
            const check = await client.query('SELECT * FROM trainers');
            const checking = (check) ? check.rows : null;
            console.log("checking: ",checking);
            checking.forEach(function (c) {
                 console.log("c", c);
                console.log("c.name c.num: ", c.name, c.tokinum);
                if (c.name == req.body.newtrainer) {
                    highercount = parseInt(c.tokinum);
                    highercount++;
                }
                if (c.name == req.params.trainer) {
                    lowercount = parseInt(c.tokinum);
                    lowercount--;
                }
            });
            console.log("done loop, updating");
            console.log("lower and higher: ", lowercount, highercount);
            var updatetokicount = await client.query("UPDATE trainers SET tokinum=" + lowercount + " WHERE name = '" + req.params.trainer + "' ");
            var updatetokicount = await client.query("UPDATE trainers SET tokinum=" + highercount + " WHERE name = '" + req.body.newtrainer + "' ");
        }
        datas.old = req.params.name;
        datas.msg = message;
        datas.color = color;
        console.log("datas=", datas);
        const data = { 'data': (datas) };
        res.render('pages/updatetokimon', data);
        client.release();
    }
    catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/tokimon/:name/:trainer/delete', async (req, res) => {
    const client = await pool.connect();
    var check = await client.query("DELETE FROM tokimons WHERE name= '" + req.params.name + "'");
    check = await client.query("SELECT tokinum FROM trainers WHERE name= '" + req.params.trainer + "'");
    const checking = (check) ? check.rows : null;
    console.log("checking[0].tokinum: ", checking[0].tokinum);
    var newtokinum = parseInt(checking[0].tokinum);
    newtokinum--;
    console.log("newtokinum= ", newtokinum);
    check = await client.query("UPDATE trainers SET tokinum=" + newtokinum + " WHERE name = '" + req.params.trainer + "' ");
    var datas = {};
    var message = "Tokimon " + req.params.name + " has been deleted!";
    var color = "green";
    console.log("msg: ", message);
    datas.color = color;
    datas.message = message;
    datas.name = req.params.name;
    const data = { 'data': (datas) };
    res.render('pages/tokimondel', data);
    //const check = await client.query("DELETE FROM trainers WHERE name= '" + req.params.name+"'");*/
});

app.get('/tokimon/new', async (req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM trainers');
        const results = { 'results': (result) ? result.rows : null };
        res.render('pages/tokimonnew', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.post('/tokimon/add', async (req, res) => {
    const client = await pool.connect();
    var usedname = false;
    var totalstats = parseInt(req.body.newfly) + parseInt(req.body.newfight) + parseInt(req.body.newfire) + parseInt(req.body.newwater) + parseInt(req.body.newelectric) + parseInt(req.body.newice);
    var check = await client.query('SELECT * FROM tokimons');
    var checking = (check) ? check.rows : null;
    console.log(checking);
    checking.forEach(function (c) {
        // console.log("c", c);
        // console.log("c.name ", c.name);
        if (c.name == req.body.newname) {
            usedname = true;
            console.log("usedname=true");
        }
    });
    try {
        var datas = {};
        if (usedname == false) { //make new tokimon
            check = await client.query("INSERT INTO tokimons (name, weight, height, fly, fight, fire, water, electric, ice, total, trainer)VALUES( '" + req.body.newname + "', " + req.body.neww + ", " + req.body.newh + ", " + req.body.newfly + ", " + req.body.newfight + ",  " + req.body.newfire + ",  " + req.body.newwater + ",  " + req.body.newelectric + ",  " + req.body.newice + ",  " + totalstats + ", '" + req.body.newtrainer + "' )");
            check = await client.query("SELECT tokinum FROM trainers WHERE name= '" + req.body.newtrainer + "'");
            checking = (check) ? check.rows : null;
            var newtokinum = parseInt(checking[0].tokinum);
            newtokinum++;
            console.log("newtokinum= ", newtokinum);
            check = await client.query("UPDATE trainers SET tokinum=" + newtokinum + " WHERE name = '" + req.body.newtrainer + "' ");
            datas.color = "green";
            datas.message = "Tokimon " + req.body.newname + " has been added!";
            datas.name = req.body.newname;
        }
        else {
            datas.color = "red";
            datas.message = "Tokimon " + req.body.newname + " is already in the database!";
            datas.name = "Tokimon Not";
        }
        console.log("datas=", datas);
        const data = { 'data': (datas) };
        res.render('pages/tokimonadd', data);
        client.release();
    }
    catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});
//////////////////////////////////////

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

