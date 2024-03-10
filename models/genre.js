const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: true }
});

GenreSchema.virtual("url").get(function() {
  return `inventory/genre/${this.slug}`;
});

module.exports = mongoose.model("Genre", GenreSchema);