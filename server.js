//Install express server
var db = require("./db.js");
const express = require('express');
const path = require('path');
const port = 3000
const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./dist/vja-covid-vaccination'));

app.get('/', (req, res) =>
    res.sendFile('index.html', { root: 'dist/vja-covid-vaccination/' }),
);

app.get('/resetdatabase', (req, res) => {
    db.createTable().then((re) => {
        res.status(200).send("OK");
    })
})

app.post('/create', (req, res) => {
    db.create(req.body).then((re) => {
        res.status(200).send("OK");
    })
})

app.get("/getall", (req, res) => {
    const request = [req.query.limit, req.query.offset];
    db.getall(request).then(data => {
        res.send(data);
    });
})

app.get("/removetable", (req, res) => {
    db.deleteTable().then(() => {
        res.status(200).send("OK");
    });
})


app.post("/delete/:id", (req, res) => {
    const id = [req.params.id];
    db.delete(id).then(message => {
        res.send(message);
    });
});

app.post('/create', (req, res) => {
    const input = [req.body.check_in_kimma, req.body.check_in_bv, req.body.note, req.body.id]
    db.update(input).then((re) => {
        res.status(200).send("OK");
    })
})



// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 3000,()=>{
    console.log(`App listening at http://localhost:${port}`)
});
