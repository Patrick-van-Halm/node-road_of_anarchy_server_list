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
    if(!req.body.ip || !req.body.port) return res.status(400) && res.send("Invalid data");
    let servers = JSON.parse(await client.get("servers")) || [];
    let server = servers.find(s => s.ip === req.body.ip);
    if(server && server.port === req.body.port) return res.status(200) && res.send("OK");
    if(server) server.port = req.body.port;
    else servers.push({ip: req.body.ip, port: req.body.port});
    await client.set("servers", JSON.stringify(servers));
    res.status(201);
    res.send("Inserted");
})

app.get("/servers", async (req, res) => {
    res.json(JSON.parse(await client.get("servers")));
})

app.listen(3000, () => {
    console.log("Server is now listening")
})