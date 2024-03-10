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
      return;
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
  const genre = await Genre.findOne({ slug: req.params.id }).exec();

  if (genre === null) {
    res.redirect('/genres');
  }

  res.render('genre/genre_delete', {
    title: 'Delete Genre',
    genre: genre
  })
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, applicationsInGenre] = await Promise.all([
    Genre.findOne({ slug: req.params.id }).exec(),
    Application.find({ 'genre.slug': req.params.id }, "name description").exec()
  ])

  if (applicationsInGenre) {
    res.render('genre/genre_delete', {
      title: 'Delete Genre',
      genre: genre,
      applications: applicationsInGenre
    });
  } else {
    await Genre.findOneAndDelete({ slug: req.params.id });
    res.redirect('/genres');
  }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findOne({ slug: req.params.id });

  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre/genre_form', {
    title: 'Update Genre',
    genre: genre
  })
});

exports.genre_update_post = [
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
        title: "Update Genre",
        genre: genre,
        errors: errors.array()
      })
      return;
    } else {
      const updatedGenre = await Genre.findOneAndUpdate({ slug: slug }, genre, {})
      res.redirect(updatedGenre.url);
    }
  })
];