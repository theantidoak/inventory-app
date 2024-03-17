const Genre = require('../models/genre');
const Application = require('../models/application');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { createSlug } = require('../src/shortcodes');

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ "name": 1}).exec();

  res.render('genre/genre_list', { title: 'Genres', genre_list: allGenres })
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  const [genre, applicationsInGenre] = await Promise.all([
    Genre.findOne({ slug: slug }).exec(),
    Application.find({ "genre.slug": slug }).exec()
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render('genre/genre_detail', { 
    title: 'Genres',
    genre: genre,
    genre_applications: applicationsInGenre
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
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(name);
    const genre = new Genre({ name: name, slug: slug, description: req.body.description });
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
  const [genre, applicationsInGenre] = await Promise.all([
    Genre.findOne({ slug: req.params.slug }).exec(),
    Application.find({ 'genre.slug': req.params.slug }, "name description slug").exec()
  ]);

  if (genre === null) {
    res.redirect('/genres');
  }

  res.render('genre/genre_delete', {
    title: 'Delete Genre',
    genre: genre,
    genre_applications: applicationsInGenre
  })
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, applicationsInGenre] = await Promise.all([
    Genre.findOne({ slug: req.body.genreslug }).exec(),
    Application.find({ 'genre.slug': req.body.genreslug }, "name description slug").exec()
  ])

  if (applicationsInGenre.length > 0) {
    res.render('genre/genre_delete', {
      title: 'Delete Genre',
      genre: genre,
      genre_applications: applicationsInGenre
    });
  } else {
    await Genre.findOneAndDelete({ slug: req.body.genreslug }).exec();
    res.redirect('/genres');
  }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findOne({ slug: req.params.slug }).exec();

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
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1})
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(name);
    const genre = new Genre({ name: name, slug: slug, description: req.body.description });
    if (!errors.isEmpty()) {
      res.render("genre/genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array()
      })
      return;
    } else {
      const genreExists = await Genre.findOne({ name: name }).exec();
      const { _id, ...modifiedGenre } = genre._doc;
      const searchSlug = genreExists ? slug : req.params.slug;
      const genreField = genreExists ? { 'genre.$[]._id': genreExists._id, 'genre.$[].slug': genreExists.slug } : { 'genre.$[].slug': slug };
      const [ updatedGenre, updatedApplications] = await Promise.all([
        Genre.findOneAndUpdate({ slug: searchSlug }, modifiedGenre, { new: true }).exec(),
        Application.updateMany({ 'genre.slug': req.params.slug }, { $set: genreField }).exec()
      ]);
      res.redirect(updatedGenre.url);
    }
  })
];