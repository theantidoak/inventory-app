const Application = require('../models/application');
const Developer = require('../models/developer');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { createSlug } = require('../src/shortcodes');
const multer  = require('multer');
const upload = multer();
require('dotenv').config();

exports.index = asyncHandler(async (req, res, next) => {
  const [
    numApplications,
    numDevelopers,
    numGenres
  ] = await Promise.all([
    Application.countDocuments({}).exec(),
    Developer.countDocuments({}).exec(),
    Genre.countDocuments({}).exec()
  ]);

  res.render('index', {
    title: 'Organize Your Apps',
    items: [ 
      { name: 'Applications', num: numApplications}, 
      { name: 'Developers', num: numDevelopers }, 
      { name: 'Genres', num: numGenres }
    ]
  });
})

exports.application_list = asyncHandler(async (req, res, next) => {
  const allApplications = await Application.find({}, 'name slug developer').populate({path: 'developer._id', model: 'Developer'}).sort({ "name": 1}).exec();
  const apps = allApplications ? allApplications.map((app) => Object.assign({}, app._doc, { developer: app._doc.developer._id, url: app.url } ) ) : [];
  res.render('application/application_list', { title: 'Applications', application_list: apps })
});

exports.application_detail = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  const application = await Application.findOne({ slug: slug }).populate({path: 'developer._id', model: 'Developer'}).populate({path: 'genre._id', model: 'Genre'}).exec();

  if (application == null) {
    res.redirect('/applications');
  }
  
  const app = Object.assign({}, application._doc, { 
    developer: application._doc.developer._id, 
    genre: application.genre.map((genre) => genre._id),
    img: application.img,
    url: application.url 
  });

  res.render("application/application_detail", {
    title: app.name,
    application: app
  })
});

exports.application_create_get = asyncHandler(async (req, res, next) => {
  const [allDevelopers, allGenres] = await Promise.all([
    Developer.find().sort({ name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec()
  ]);

  res.render('application/application_form', {
    title: 'Add Application',
    developers: allDevelopers,
    genres: allGenres
  });
});

exports.application_create_post = [
  upload.single('uploaded_file'),
  body("name", "Name must not be empty")
    .trim().isLength({ min: 1 }).escape(),
  body("developer", "Developer must not be empty")
    .trim().isLength({ min: 1}).escape(),
  body("description", "Description must not be empty")
    .trim().isLength({ min: 1}).escape(),
  body("rating", "Rating must be a number")
    .optional({ checkFalsy: true })  
    .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
    .custom(value => {
      if (!/^\d+(\.\d{1})?$/.test(value)) {
        throw new Error('Rating must be a number with up to one decimal place');
      }
      return true;
    })
    .escape(),
  body("price", "Price must be a number")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .custom(value => {
      if (!/^\d+(\.\d{2})?$/.test(value)) {
        throw new Error('Price must be a number with up to two decimal places');
      }
      return true;
    })
    .escape(),
  body("genre")
    .exists({ checkFalsy: true }).withMessage('Genre must not be empty')
    .escape(),
  body("platforms")
    .exists({ checkFalsy: true }).withMessage('Platforms must not be empty')
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(req.body.name);
    const developer = req.body.developer.split("|");
    const genres = [].concat(req.body.genre).map(item => {
      const genre = item.split("|");
      return {_id: genre[0], slug: genre[1] }
    });

    const application = new Application({
      name: name,
      slug: slug,
      developer: { _id: developer[0], slug: developer[1] },
      description: req.body.description,
      rating: req.body.rating == '' ? 0 : +req.body.rating,
      price: req.body.price == '' ? 0 : +req.body.price,
      genre: genres,
      platforms: [].concat(req.body.platforms),
      image: req.file && req.file.buffer ? req.file.buffer : ''
    });

    if (!errors.isEmpty()) {
      const [allDevelopers, allGenres] = await Promise.all([
        Developer.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec()
      ]);

      for (const genre of allGenres) {
        if (application.genre.includes(genre.slug)) {
          genre.checked = true;
        }
      }

      res.render("application/application_form", {
        title: "Add Application",
        application: application,
        developers: allDevelopers,
        genres: allGenres,
        errors: errors.array()
      })
      return;
    } else {
      const applications = await Application.find({ name: name }).exec();
      const applicationsExist = applications && applications.length > 0 ? true : false;
      const developerName = req.body.developer ? req.body.developer.split("|")[1]  : '';
      const sameApp = applicationsExist ? applications.find((application) => application.developer.slug === developerName) : null;
      if (sameApp) {
        res.redirect(sameApp.url);
      } else {
        const numApplications = applicationsExist ? '-' + (applications.length + 1) : '';
        application.slug = createSlug(name + `${numApplications}`);
        await application.save();
        res.redirect(application.url);
      }
    }
  })
];

exports.application_delete_get = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  const application = await Application.findOne({ slug: slug }).populate({path: 'developer._id', model: 'Developer'}).populate({path: 'genre._id', model: 'Genre'}).exec();
  
  if (application == null) {
    res.redirect('/applications');
  }

  const app = { ...application._doc };
  app.developer = application.developer._id;
  app.genre = application.genre.map((genre) => genre._id);
  app.url = application.url;

  res.render('application/application_delete', {
    title: 'Delete Application',
    application: app
  })  
});

exports.application_delete_post = asyncHandler(async (req, res, next) => {
  if (!req.body.admin_password || req.body.admin_password !== process.env.ADMIN) return res.status(401).send("Unauthorized: Incorrect admin password");
  await Application.findOneAndDelete({ slug: req.body.applicationslug }).exec();
  res.redirect('/applications');
});

exports.application_update_get = asyncHandler(async (req, res, next) => {
  const [application, allDevelopers, allGenres] = await Promise.all([
    Application.findOne({ slug: req.params.slug }).exec(),
    Developer.find().sort({ name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec()
  ]);

  res.render('application/application_form', {
    title: 'Update Application',
    application: application,
    developers: allDevelopers,
    genres: allGenres
  });
});

exports.application_update_post = [
  upload.single('uploaded_file'),
  body("name", "Name must not be empty")
    .trim().isLength({ min: 1 }).escape(),
  body("developer", "Developer must not be empty")
    .trim().isLength({ min: 1}).escape(),
  body("description", "Description must not be empty")
    .trim().isLength({ min: 1}).escape(),
  body("rating", "Rating must be a number")
    .optional({ checkFalsy: true })  
    .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
    .custom(value => {
      if (!/^\d+(\.\d{1})?$/.test(value)) {
        throw new Error('Rating must be a number with up to one decimal place');
      }
      return true;
    })
    .escape(),
  body("price", "Price must be a number")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .custom(value => {
      if (!/^\d+(\.\d{2})?$/.test(value)) {
        throw new Error('Price must be a number with up to two decimal places');
      }
      return true;
    })
    .escape(),
  body("genre")
    .exists({ checkFalsy: true }).withMessage('Genre must not be empty')
    .escape(),
  body("platforms")
    .exists({ checkFalsy: true }).withMessage('Platforms must not be empty')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(req.body.name);
    const developer = req.body.developer.split("|");
    const genres = [].concat(req.body.genre).map(item => {
      const genre = item.split("|");
      return {_id: genre[0], slug: genre[1] }
    });

    const application = new Application({
      name: name,
      slug: slug,
      developer: { _id: developer[0], slug: developer[1] },
      description: req.body.description,
      rating: req.body.rating == '' ? 0 : +req.body.rating,
      price: req.body.price == '' ? 0 : +req.body.price,
      genre: genres,
      platforms: [].concat(req.body.platforms),
      image: req.file && req.file.buffer ? req.file.buffer : ''
    });

    if (!errors.isEmpty()) {
      const [allDevelopers, allGenres] = await Promise.all([
        Developer.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec()
      ]);

      for (const genre of allGenres) {
        if (application.genre.includes(genre.slug)) {
          genre.checked = true;
        }
      }

      res.render("application/application_form", {
        title: "Update Application",
        application: application,
        developers: allDevelopers,
        genres: allGenres,
        errors: errors.array()
      })
      return;
    } else {
      const applications = await Application.find({ name: name }).exec();
      const applicationsExist = applications && applications.length > 0 ? true : false;
      const developerName = req.body.developer ? req.body.developer.split("|")[1]  : '';
      const sameApp = applicationsExist ? applications.find((application) => application.developer.slug === developerName) : null;
      const { _id, ...modifiedApp } = application._doc;
      const numApplications = applicationsExist ? '-' + (applications.length + 1) : '';
      modifiedApp.slug = sameApp ? modifiedApp.slug : createSlug(name + `${numApplications}`);
      const searchSlug = sameApp ? modifiedApp.slug : req.params.slug;
      if (req.body.remove_image === "on") {
        modifiedApp.image = ''
      }
      if (!req.body.admin_password || req.body.admin_password !== process.env.ADMIN) return res.status(401).send("Unauthorized: Incorrect admin password");
      const updatedApplication = await Application.findOneAndUpdate({ slug: searchSlug }, modifiedApp, { new: true }).exec();
      res.redirect(updatedApplication.url);
    }
  })
];