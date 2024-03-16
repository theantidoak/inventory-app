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

DeveloperSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const fieldsToSanitize = ['name', 'slug'];

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

DeveloperSchema.virtual("url").get(function() {
  return `/developers/${this.slug}`;
})

module.exports = mongoose.model("Developer", DeveloperSchema);