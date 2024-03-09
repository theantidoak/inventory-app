const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  name: { type: String, required: true },
  developer: { type: Schema.Types.ObjectId, ref: "Developer", required: true },
  description: { type: String, required: true },
  rating: { type: Number, required: true },
  price: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre", required: true }],
  platforms: [{ type: String, required: true }]
})

ApplicationSchema.virtual("url").get(function () {
  return `/inventory/application/${this._id}`;
});

module.exports = mongoose.model("Application", ApplicationSchema)