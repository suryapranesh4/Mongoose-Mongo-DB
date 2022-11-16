const http = require("http"),
  url = require("url"),
  fs = require("fs"),
  io = require("socket.io"),
  mongoose = require("mongoose");

const Restaurant = require("./model/Restaurant");
const Order = require("./model/Order");

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Mongoose connected successfully ");
    },
    (error) => {
      console.log("Mongoose could not connected to database : " + error);
    }
  );

const server = http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname;
  switch (path) {
    case "/":
      fs.readFile(__dirname + "/index.html", function (err, data) {
        if (err) return send404(res);
        res.writeHead(200, {
          "Content-Type": path == "json.js" ? "text/javascript" : "text/html",
        });
        res.write(data, "utf8");
        res.end();
      });
      break;

    default:
      send404(res);
  }
});
const send404 = function (res) {
  res.writeHead(404);
  res.write("404");
  res.end();
};

const PORT = 8080;
server.listen(PORT, () => console.log(`server started on localhost:${PORT}`));

// socket.io, I choose you
const ioServer = io.listen(server);

// socket.io setup and manager
ioServer.on("connection", function (socket) {
  // now we have a client object!
  console.log("Connection accepted.");

  // event listeners
  socket.on("message", function (message) {
    console.log(`Recieved message: ${message} - from client`);
    socket.emit("msgreceived");
  });

  socket.on("disconnect", function () {
    console.log("Disconnected...");
  });

  socket.on("get-restaurants", () => {
    console.log("server - get-restarants called");
    // socket.emit("restaurants-data", ["pizza", "chicken sandwiches"]);

    Restaurant.find(
      { city: "Queens", cuisine: "Delicatessen" },
      (error, documents) => {
        if (error) console.log(`Error occured on Restaurant.find(): ${error}`);
        else {
          console.log(`Restaurant.find() returned documents : ${documents}`);
          const restaurants = documents.map((x) => ({
            name: x["name"],
            cuisine: x["cuisine"],
          }));
          console.log("Restaurants", restaurants);
          socket.emit("restaurants-data", restaurants);
        }
      }
    );
  });

  socket.on("get-orders", () => {
    console.log("server - get-orders called");

    Order.find((error, documents) => {
      if (error) console.log(`Error occured on Order.find(): ${error}`);
      else {
        console.log(`Order.find() returned documents : ${documents}`);
        const orders = documents.map((x) => x["item"]);
        console.log("Order Item name :", orders);
        socket.emit("order-data", orders);
      }
    });
  });

  socket.on("add-order", async () => {
    console.log("server - add-orders called");

    try {
      var newOrder = new Order({
        order_id: 3,
        customer_name: "krishnan",
        item: "keys",
      });
      const response = await newOrder.save();

      console.log("Order was added by server", response);
      socket.emit("order-added", response);
    } catch (error) {
      console.log("Error caught", error);
      return res.status(500).send("Server Error");
    }
  });
});
