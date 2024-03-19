const mongoose = require("mongoose");
const he = require('he');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: Buffer },
  img_mimetype: { type: String }
});

GenreSchema.pre('save', function(next) {
  const fieldsToSanitize = ['name', 'slug', 'description'];

  fieldsToSanitize.forEach((field) => {
    this[field] = he.decode(this[field]);
  })

  next();
});

GenreSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const fieldsToSanitize = ['name', 'slug', 'description'];

  fieldsToSanitize.forEach((field) => {
    update[field] = he.decode(update[field]);
  });

  if (update.$set) {
    fieldsToSanitize.forEach((field) => {
      update.$set[field] = he.decode(update.$set[field]);
    });
  }

  next();
});

GenreSchema.virtual("url").get(function() {
  return `/genres/${this.slug}`;
});

GenreSchema.virtual("img").get(function () {
  return this.image && this.image != '' ? this.image.toString('base64') : null
});

module.exports = mongoose.model("Genre", GenreSchema);