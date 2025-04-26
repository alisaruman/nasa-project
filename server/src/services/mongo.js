const mongoose = require("mongoose");

const NODE_URL = process.env.NODE_URL;

mongoose.connection.once("open", () => {
  console.log("DB Connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("DB Connection error:", err);
});

const mongoConnect = async () => {
  return await mongoose.connect(NODE_URL);
};

const mongoDisconnect = async () => {
  return await mongoose.disconnect();
};

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
