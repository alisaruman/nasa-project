const http = require("http");

require("dotenv").config();

const app = require("./app");
const PORT = process.env.PORT || 5000;
const { mongoConnect } = require("./services/mongo");
const { loadPlanets } = require("./models/planets/planets.model");
const { loadLaunchesData } = require("./models/launches/launches.model");

const server = http.createServer(app);

const startServer = async () => {
  await mongoConnect();
  await loadPlanets();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};
startServer();
