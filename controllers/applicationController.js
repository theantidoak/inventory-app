const Application = require('../models/application');
const Developer = require('../models/developer');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
  const [
    numApplications,
    numDevelopers,
    numGenres
  ] = await Promise.all([
    Application.countDocuments({}).exec(),
    Developer.countDocuments({}),
    Genre.countDocuments({})
  ]);

  res.render('index', {
    title: 'Application Station',
    count: { numApplications, numDevelopers, numGenres }
  });
})

exports.application_list = asyncHandler(async (req, res, next) => {
  const allApplications = await Application.find().sort({ "name": 1}).exec();

  res.render('application_list', { title: 'Types of Applications', application_list: allApplications })
});

exports.application_detail = asyncHandler(async (req, res, next) => {

});

exports.application_create_get = asyncHandler(async (req, res, next) => {

});

exports.application_create_post = asyncHandler(async (req, res, next) => {
  
});

exports.application_delete_get = asyncHandler(async (req, res, next) => {

});

exports.application_delete_post = asyncHandler(async (req, res, next) => {
  
});

exports.application_update_get = asyncHandler(async (req, res, next) => {

});

exports.application_update_post = asyncHandler(async (req, res, next) => {
  
});