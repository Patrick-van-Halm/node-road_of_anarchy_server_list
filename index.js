import express from "express";
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

import { createClient } from 'redis';
const client = createClient({
    url: 'redis://db'
});
await client.connect();

app.post("/servers", async (req, res) => {
    console.log("POST\n" + req.body);
    if(!req.body.ip || !req.body.port || !req.body.name) return res.status(400) && res.send("Invalid data");

    let servers = JSON.parse(await client.get("servers")) || [];

    let server = servers.find(s => s.ip === req.body.ip);
    if(server && server.port === req.body.port) return res.status(200) && res.send("OK");

    if(server){
        server.port = req.body.port;
        server.name = req.body.name;
        server.player_count = 1;
    }
    else servers.push({ip: req.body.ip, port: parseInt(req.body.port), name: req.body.name, player_count: 1});

    await client.set("servers", JSON.stringify(servers));

    res.status(201);
    res.send("Inserted");
})

app.delete("/servers", async (req, res) => {
    console.log("DELETE\n" + req.query);
    if(!req.query.ip || !req.query.port) return res.status(400) && res.send("Invalid data");

    let servers = JSON.parse(await client.get("servers"));
    if(!servers) return res.status(200) && res.send("OK");

    let i = servers.findIndex(s => s.ip === req.query.ip && s.port === parseInt(req.query.port));
    if(i < 0) return res.status(200) && res.send("OK");

    servers.splice(i, 1);
    await client.set("servers", JSON.stringify(servers));
    res.status(200);
    res.send("OK");
})

app.get("/servers", async (req, res) => {
    console.log("GET");
    res.json(JSON.parse(await client.get("servers")));
})

app.post("/join", async (req, res) => {
    if(!req.query.ip || !req.query.port) return res.status(400) && res.send("Invalid data");

    let servers = JSON.parse(await client.get("servers"));
    if(!servers) return res.status(200) && res.send("OK");

    let server = servers.find(s => s.ip === req.query.ip && s.port === parseInt(req.query.port));
    if(!server) return res.status(200) && res.send("OK");

    server.player_count++;

    await client.set("servers", JSON.stringify(servers));
    res.status(200);
    res.send("OK");
})

app.post("/leave", async (req, res) => {
    if(!req.query.ip || !req.query.port) return res.status(400) && res.send("Invalid data");

    let servers = JSON.parse(await client.get("servers"));
    if(!servers) return res.status(200) && res.send("OK");

    let server = servers.find(s => s.ip === req.query.ip && s.port === parseInt(req.query.port));
    if(!server) return res.status(200) && res.send("OK");

    server.player_count--;

    await client.set("servers", JSON.stringify(servers));
    res.status(200);
    res.send("OK");
})

app.listen(3000, () => {
    console.log("Server is now listening")
})