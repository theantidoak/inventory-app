const mongoose = require("mongoose");
const he = require('he');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: true }
});

GenreSchema.pre('save', function(next) {
  const fieldsToSanitize = ['name', 'slug', 'description'];

  fieldsToSanitize.forEach((field) => {
    this[field] = he.decode(this[field]);
  })

  next();
});

GenreSchema.virtual("url").get(function() {
  return `genres/${this.slug}`;
});

module.exports = mongoose.model("Genre", GenreSchema);