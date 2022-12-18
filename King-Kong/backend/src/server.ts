import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import { Server } from 'socket.io';
import { airdrop2CollectionHolders, gamePlayListener, getGamePlayHistory, getGameStats, getPlayerInfo, getUserStats, registerAvatar4Game } from './process';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get('/', async (req, res) => {
  res.status(200).send("server is running...");
})

app.get('/api/user_stats', async (req, res) => {
  let result = await getUserStats();
  res.status(200).send(result);
})

app.get('/api/game_stats', async (req, res) => {
  let result = await getGameStats();
  res.status(200).send(result)
})

app.get('/api/game_play', async (req, res) => {
  let result = await getGamePlayHistory();
  res.status(200).send(result)
});

app.get('/api/get_player_info', async (req, res) => {
  try {
    let player = req.query.player as string;
    let result = await getPlayerInfo(player);
    if (result < 0) res.status(500).send({ "error code": result });
    else res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send({ "error": e })
  }
})

app.post('/register_avatar_game', async (req, res) => {
  try {
    let address = req.body.user;
    let avatar = req.body.avatar;
    let result = await registerAvatar4Game(address, avatar);
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send({ "error": e })
  }
})

io.on('connection', async (socket) => {
  console.log("New Connection Established");

  socket.on('disconnect', () => {
    console.log("One socket is disonnected");
  });
})

server.listen(port, () => {
  console.log(`server is listening on ${port}`);
  gamePlayListener(io);
  return;
});