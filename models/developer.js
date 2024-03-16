const mongoose = require("mongoose");
const he = require('he');
const Schema = mongoose.Schema;

const DeveloperSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
})

DeveloperSchema.pre('save', function(next) {
  const fieldsToSanitize = ['name', 'slug'];

  fieldsToSanitize.forEach((field) => {
    this[field] = he.decode(this[field]);
  })

  next();
});

DeveloperSchema.virtual("url").get(function() {
  return `/developers/${this.slug}`;
})

module.exports = mongoose.model("Developer", DeveloperSchema);