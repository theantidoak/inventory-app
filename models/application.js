const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  developer: {
    _id: { type: Schema.Types.ObjectId, ref: "Developer", required: true },
    slug: { type: String, required: true}
  },
  description: { type: String, required: true },
  rating: { type: Number, required: true },
  price: { type: Number, required: true },
  genre: [{
    _id: { type: Schema.Types.ObjectId, ref: "Genre", required: true },
    slug: { type: String, required: true },
  }],
  platforms: [{ type: String, required: true }]
})

ApplicationSchema.virtual("url").get(function () {
  return `/applications/${this.slug}`;
});

module.exports = mongoose.model("Application", ApplicationSchema)