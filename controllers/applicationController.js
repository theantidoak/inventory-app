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
    items: [ 
      { name: 'Applications', num: numApplications}, 
      { name: 'Developers', num: numDevelopers }, 
      { name: 'Genres', num: numGenres }
    ]
  });
})

exports.application_list = asyncHandler(async (req, res, next) => {
  const allApplications = await Application.find().sort({ "name": 1}).exec();

  res.render('application/application_list', { title: 'Types of Applications', application_list: allApplications })
});

exports.application_detail = asyncHandler(async (req, res, next) => {
  const slug = req.params.id;
  const application = await Application.findOne({ slug: slug });

  if (application === null) {
    const err = new Error("Application not found");
    err.status = 404;
    return next(err);
  }

  res.render("application/application_detail", {
    title: application.name,
    application: application
  })
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