const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
  },
  item: {
    type: String,
    require: true,
  },
  customer_name: {
    type: String,
    require: true,
  },
});

const Order = mongoose.model("Order", OrderSchema, "Orders");
module.exports = Order;
