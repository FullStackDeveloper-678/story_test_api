const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(cors());
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

let interval;
io.on("connection", (socket) => {
	console.log("New client connected");
	if (interval) {
		clearInterval(interval);
	}
	socket.on("test_api", (data) => {
		if (data.api === "test_api_1") {
			interval = setInterval(() => getApiAndEmit(socket), 2000);
		} else {
			let i = 1;
			if (data.restart) {
				clearInterval(interval);
			}
			interval = setInterval(() => memoryResponseApi(socket, i++), 2000);
		}
		console.log("api is runing for", data.api);
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected");
		clearInterval(interval);
	});
});
const generateRandomString = function (length = 6) {
	return Math.random().toString(20).substr(2, length);
};

const getApiAndEmit = (socket) => {
	var result = [0, 0.5, 1];
	var data = {
		index: Math.floor(Math.random() * 19 + 1),
		response: generateRandomString(Math.floor(Math.random() * 9 + 1)),
		result: result[Math.floor(Math.random() * 3)],
	};
	const response = data;
	// Emitting a new message. Will be consumed by the client
	socket.emit("FromAPI", response);
};

const memoryResponseApi = (socket, i) => {
	var result = [0, 1];
	var data = {
		index: Math.floor(Math.random() * 10 + 1),
		order: i,
		result: result[Math.floor(Math.random() * 2)],
	};
	const response = data;
	// Emitting a new message. Will be consumed by the client
	socket.emit("FromMemoryApi", response);
};
// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static("client/build"));

// 	app.get("*", (req, res) => {
// 		res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// 	});
// }

server.listen(port, () => console.log(`Listening on port ${port}`));
