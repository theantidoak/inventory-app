const Developer = require('../models/developer');
const Application = require('../models/application');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { createSlug } = require('../src/shortcodes');
const multer  = require('multer')
const upload = multer();
require('dotenv').config();

exports.developer_list = asyncHandler(async (req, res, next) => {
  const allDevelopers = await Developer.find().sort({ "name": 1}).exec();

  res.render('developer/developer_list', { title: 'Developers', developer_list: allDevelopers })
});

exports.developer_detail = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  const [ developer, applications ] = await Promise.all([
    Developer.findOne({ slug: slug }).exec(),
    Application.find({ 'developer.slug' : slug }).exec()
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
  upload.single('uploaded_file'),
  body("name", "Developer name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(name);
    const developer = new Developer({ 
      name: name, 
      slug: slug,
      image: req.file && req.file.buffer ? req.file.buffer : '',
      img_mimetype: req.file && req.file.mimetype ? req.file.mimetype : ''
    });

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
  const [developer, applicationsByDeveloper] = await Promise.all([
    Developer.findOne({ slug: req.params.slug }).exec(),
    Application.find({ 'developer.slug': req.params.slug}).exec()
  ])

  if (developer === null) {
    res.redirect('/developers');
  }

  res.render('developer/developer_delete', {
    title: 'Delete Developer',
    developer: developer,
    developer_applications: applicationsByDeveloper
  });
});

exports.developer_delete_post = asyncHandler(async (req, res, next) => {
  const [developer, applicationsByDeveloper] = await Promise.all([
    Developer.find({ slug: req.body.developerslug }).exec(),
    Application.find({ 'developer.slug': req.body.developerslug }).exec()
  ])

  if (applicationsByDeveloper.length > 0) {
    res.render('developer/developer_delete', {
      title: 'Delete Developer',
      developer: developer,
      developer_applications: applicationsByDeveloper
    });
  } else {
    if (!req.body.admin_password || req.body.admin_password !== process.env.ADMIN) return res.status(401).send("Unauthorized: Incorrect admin password");
    await Developer.findOneAndDelete({ slug: req.body.developerslug }).exec()
    res.redirect('/developers')
  }
});

exports.developer_update_get = asyncHandler(async (req, res, next) => {
  const developer = await Developer.findOne({ slug: req.params.slug }).exec();

  if (developer === null) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(404);
  }

  res.render('developer/developer_form', {
    title: 'Update Developer',
    developer: developer
  })
});

exports.developer_update_post = [
  upload.single('uploaded_file'),
  body("name", "Developer name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(name);
    const developer = new Developer({ 
      name: name, 
      slug: slug,
      image: req.file && req.file.buffer ? req.file.buffer : '',
      img_mimetype: req.file && req.file.mimetype ? req.file.mimetype : ''
    });

    if (!errors.isEmpty()) {
      res.render("application_form", {
        title: "Update Developer",
        developer: developer,
        errors: errors.array()
      });
      return;
    } else {
      const developerExists = await Developer.findOne({ slug: slug }).exec();
      const { _id, ...modifiedDev } = developer._doc;
      const searchSlug = developerExists ? slug : req.params.slug;
      const developerField = developerExists ? { 'developer._id': developerExists._id, 'developer.slug': developerExists.slug } : { 'developer.slug': slug };
      if (req.body.remove_image === "on") {
        modifiedDev.image = ''
      }
      if (!req.body.admin_password || req.body.admin_password !== process.env.ADMIN) return res.status(401).send("Unauthorized: Incorrect admin password");
      const [ updatedDeveloper, updatedApplications] = await Promise.all([
        Developer.findOneAndUpdate({ slug: searchSlug }, modifiedDev, { new: true }).exec(),
        Application.updateMany({ 'developer.slug': req.params.slug }, { $set: developerField }).exec()
      ]);
      res.redirect(updatedDeveloper.url);
    }
  })
];