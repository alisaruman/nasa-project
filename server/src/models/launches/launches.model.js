const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("../planets/planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100, //flight_number
  launchDate: new Date("March 20, 2025"), //date_local
  mission: "Reach new worlds", // name
  rocket: "Explorer ISI", //rocket.name
  destination: "Kepler-442 b", //not applicable
  customers: ["Saruman", "NASA"], //payloads.customers for each payload
  success: true, //success
  upcoming: true, //upcoming
};

const existsLaunchWithId = async (launchId) => {
  return await findLaunch({
    flightNumber: launchId,
  });
};

const getAllLaunches = async (skip, limit) => {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

const saveLaunch = async (launch) => {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
};

saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const populateLaunch = async () => {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.error("Failed to fetch launch data:", response.status);
    throw new Error("Failed to fetch launch data");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      launchDate: launchDoc["date_local"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      success: launchDoc["success"],
      upcoming: launchDoc["upcoming"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
};

const loadLaunchesData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded");
  } else {
    console.log("Downloading launch data...");
    await populateLaunch();
  }
};

const findLaunch = async (filter) => {
  return await launchesDatabase.findOne(filter);
};

const getLatestFlightNumber = async () => {
  const latestFlightNumber = await launchesDatabase
    .findOne()
    .sort("-flightNumber");

  if (!latestFlightNumber) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestFlightNumber.flightNumber;
};

const postNewLaunch = async (launch) => {
  const planet = await planets.findOne({
    keplerName: launch.destination,
  });

  if (!planet) {
    throw new Error("Destination planet not found.");
  }

  const latestFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Saruman", "NASA"],
    flightNumber: latestFlightNumber,
  });

  await saveLaunch(newLaunch);
};

const abortLaunchById = async (launchId) => {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
};

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  loadLaunchesData,
  postNewLaunch,
  abortLaunchById,
};
