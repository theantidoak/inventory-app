const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeveloperSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
})

DeveloperSchema.virtual("url").get(function() {
  return `inventory/developer/${this.slug}`;
})

module.exports = mongoose.model("Developer", DeveloperSchema);