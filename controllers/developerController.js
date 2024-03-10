const Developer = require('../models/developer');
const Application = require('../models/application');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { createSlug } = require('../src/shortcodes');

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

exports.developer_create_get = (req, res, next) => {
  res.render("developer/developer_form", { title: "Add Developer" });
};

exports.developer_create_post = [
  body("name", "Developer name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(name);
    const developer = new Developer({ name: name, slug: slug });

    if (!errors.isEmpty()) {
      res.render("application_form", {
        title: "Add Developer",
        developer: developer,
        errors: errors.array()
      });
      return;
    } else {
      const developerExists = await Developer.findOne({ name: req.body.name }).exec();
      if (developerExists) {
        res.redirect(developerExists.url);
      } else {
        await developer.save();
        res.redirect(developer.url);
      }
    }
  })
];

exports.developer_delete_get = asyncHandler(async (req, res, next) => {

});

exports.developer_delete_post = asyncHandler(async (req, res, next) => {
  
});

exports.developer_update_get = asyncHandler(async (req, res, next) => {

});

exports.developer_update_post = asyncHandler(async (req, res, next) => {
  
});