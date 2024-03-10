const Genre = require('../models/genre');
const Application = require('../models/application');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

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

exports.genre_create_post = asyncHandler(async (req, res, next) => {
  
});

exports.genre_delete_get = asyncHandler(async (req, res, next) => {

});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {

});

exports.genre_update_post = asyncHandler(async (req, res, next) => {
  
});