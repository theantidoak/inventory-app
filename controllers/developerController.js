const Developer = require('../models/developer');
const Application = require('../models/application');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.developer_list = asyncHandler(async (req, res, next) => {
  const allDevelopers = await Developer.find().sort({ "name": 1}).exec();

  res.render('developer/developer_list', { title: 'Types of Applications', developer_list: allDevelopers })
});

exports.developer_detail = asyncHandler(async (req, res, next) => {
  const slug = req.params.id;
  const [ developer, applications ] = await Promise.all([
    Developer.findOne({ slug: slug }),
    Application.find({ 'developer.slug': slug })
  ])

  if (developer === null) {
    const err = new Error("Developer not found");
    err.status = 404;
    return next(err);
  }

  res.render('developer/developer_detail', {
    title: developer.name,
    developer: developer,
    applications: applications
  })

});

exports.developer_create_get = asyncHandler(async (req, res, next) => {

});

exports.developer_create_post = asyncHandler(async (req, res, next) => {
  
});

exports.developer_delete_get = asyncHandler(async (req, res, next) => {

});

exports.developer_delete_post = asyncHandler(async (req, res, next) => {
  
});

exports.developer_update_get = asyncHandler(async (req, res, next) => {

});

exports.developer_update_post = asyncHandler(async (req, res, next) => {
  
});