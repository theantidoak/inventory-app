#! /usr/bin/env node

console.log(
  'This script populates some test applications, developers, and genres to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/inventory_app?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Application = require("../../models/application");
const Developer = require("../../models/developer");
const Genre = require("../../models/genre");
const { createSlug } = require("../../src/shortcodes");

const genres = [];
const developers = [];
const applications = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createGenres();
  await createDevelopers();
  await createApplications();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function genreCreate(index, name, description) {
  const genre = await Genre.findOneAndUpdate({ name: name }, { name: name, slug: createSlug(name), description: description }, { new: true, upsert: true });
  genres[index] = genre;
  console.log(`Added/Updated genre: ${name}`);
}

async function developerCreate(index, name) {
  const developer = await Developer.findOneAndUpdate({ name: name }, { name: name, slug: createSlug(name) }, { new: true, upsert: true });
  developers[index] = developer;
  console.log(`Added/Updated developer: ${name}`);
}

async function applicationCreate(index, name, developer, description, rating, price, genre, platforms) {
  const applicationdetail = {
    name: name,
    slug: createSlug(name),
    developer: developer,
    description: description,
    rating: rating,
    price: price,
    platforms: platforms,
  };
  if (genre != false) applicationdetail.genre = genre;

  const application = await Application.findOneAndUpdate({ name: name, developer: developer }, applicationdetail, { new: true, upsert: true });
  applications[index] = application;
  console.log(`Added/Updated application: ${name}`);
}


async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate(0, "Self-help", "An application to help you better yourself."),
    genreCreate(1, "Gym", "An application to help specifically with physical exercise."),
    genreCreate(2, "Games", "An application with a game to pass the time."),
    genreCreate(3, "Lifestyle", "An application to accelerate or support individual facets of everyday life.")
  ]);
}

async function createDevelopers() {
  console.log("Adding developers");
  await Promise.all([
    developerCreate(0, "David Crane PhD"),
    developerCreate(1, "Leap Fitness Group"),
    developerCreate(2, "Poteau"),
    developerCreate(3, "Nintendo Co., Ltd."),
    developerCreate(4, "TP-LINK GLOBAL INC."),
  ]);
}

async function createApplications() {
  console.log("Adding Applications");
  await Promise.all([
    applicationCreate(0,
      "Smoke Free - Quit Smoking Now",
      developers[0],
      "Over 40 different, evidence-based, techniques will help you get - and stay - smoke free. See and celebrate how long you’ve been quit, how your health is improving how much money you're saving, how many cigarettes you've not smoked, how much life you've regained, and more.",
      4.8,
      0,
      [genres[0]],
      ["Android", "iOS"]
    ),
    applicationCreate(1,
      "Home Workout - No Equipments",
      developers[1],
      "Home Workout app is an expertly crafted fitness app that offers a variety of workouts and plans suitable for everyone, from fitness beginners to experts.",
      4.9,
      0,
      [genres[1]],
      ["Android", "iOS"]
    ),
    applicationCreate(2,
      "Poteau",
      developers[2],
      "Find football games near you and join them in a few seconds. Let's play soccer!",
      4.7,
      0,
      [genres[1]],
      ["Android", "iOS"]
    ),
    applicationCreate(3,
      "Nintendo Switch Parental Control",
      developers[3],
      "An application dedicated to parents to control children's play time",
      4.5,
      0,
      [genres[3]],
      ["Android", "iOS"]
    ),
    applicationCreate(4,
      "Tapo",
      developers[4],
      "Control your Tapo smart devices from anywhere.",
      4.6,
      0,
      [genres[3]],
      ["Android", "iOS"]
    ),
  ]);
}
