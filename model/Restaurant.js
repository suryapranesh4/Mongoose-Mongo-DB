const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  city: {
    type: String,
    require: true,
  },
  cuisine: String,
  name: {
    type: String,
    require: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Restaurant = mongoose.model(
  "Restaurant",
  RestaurantSchema,
  "Restaurants"
);
module.exports = Restaurant;
