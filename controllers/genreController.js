const Genre = require('../models/genre');
const Application = require('../models/application');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { createSlug } = require('../src/shortcodes');

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ "name": 1}).exec();

  res.render('genre/genre_list', { title: 'Types of Applications', genre_list: allGenres })
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const slug = req.params.id;
  const [genre, applicationsInGenre] = await Promise.all([
    Genre.findOne({ slug: slug }).exec(),
    Application.find({ "genre.slug": slug })
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render('genre/genre_detail', { 
    title: 'Types of Applications',
    genre: genre,
    applications: applicationsInGenre
  })
});

exports.genre_create_get = (req, res, next) => {
  res.render('genre/genre_form', { title: 'Add Genre' });
};

exports.genre_create_post = [
  body("name", "Genre must contain at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(name);
    const genre = new Genre({ name: name, slug: slug });
    if (!errors.isEmpty()) {
      res.render("genre/genre_form", {
        title: "Add Genre",
        genre: genre,
        errors: errors.array()
      })
    } else {
      const genreExists = await Genre.findOne({ name: name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  })
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {

});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {

});

exports.genre_update_post = asyncHandler(async (req, res, next) => {
  
});