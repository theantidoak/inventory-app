const Application = require('../models/application');
const Developer = require('../models/developer');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { createSlug } = require('../src/shortcodes');

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
  body("genre.*").escape(),
  body("platforms")
    .exists({ checkFalsy: true }).withMessage('Platforms must not be empty')
    .isArray({ min: 1 }).withMessage('At least one platform must be selected'),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(req.body.name);

    const application = new Application({
      name: name,
      slug: slug,
      developer: req.body.developer,
      description: req.body.description,
      rating: req.body.rating == '' ? 0 : +req.body.rating,
      price: req.body.price == '' ? 0 : +req.body.price,
      genre: req.body.genre,
      platforms: req.body.platforms
    });

    if (!errors.isEmpty()) {
      const [allDevelopers, allGenres] = await Promise.all([
        Developer.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 })
      ]);

      for (const genre of allGenres) {
        if (application.genre.includes(genre._id)) {
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
      const sameApp = applicationsExist.find((application) => application.developer.name === req.body.developer);
      if (sameApp) {
        res.redirect(sameApp.url);
      } else {
        const numApplications = applicationsExist ? '-' + (applications.length + 1) : '';
        application.slug = createSlug(name + `${numApplications}`)
        await application.save();
        res.redirect(application.url);
      }
    }
  })
];

exports.application_delete_get = asyncHandler(async (req, res, next) => {
  const application = await Application.findOne({ slug: req.params.id }).exec();

  if (application == null) {
    res.redirect('/applications');
  }

  res.render('application/application_delete', {
    title: 'Delete Application',
    application: application
  })  
});

exports.application_delete_post = asyncHandler(async (req, res, next) => {
  await Application.findOneAndDelete({ slug: req.body.id });
  res.redirect('/applications');
});

exports.application_update_get = asyncHandler(async (req, res, next) => {
  const [application, allDevelopers, allGenres] = await Promise.all([
    Application.findOne({ slug: req.params.id }),
    Developer.find().sort({ name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec()
  ]);

  res.render('application/application_form', {
    title: 'Add Application',
    application: application,
    developers: allDevelopers,
    genres: allGenres
  });
});

exports.application_update_post = [
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
  body("genre.*").escape(),
  body("platforms")
    .exists({ checkFalsy: true }).withMessage('Platforms must not be empty')
    .isArray({ min: 1 }).withMessage('At least one platform must be selected'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const slug = createSlug(req.body.name);

    const application = new Application({
      name: name,
      slug: slug,
      developer: req.body.developer,
      description: req.body.description,
      rating: req.body.rating == '' ? 0 : +req.body.rating,
      price: req.body.price == '' ? 0 : +req.body.price,
      genre: req.body.genre,
      platforms: req.body.platforms
    });

    if (!errors.isEmpty()) {
      const [allDevelopers, allGenres] = await Promise.all([
        Developer.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 })
      ]);

      for (const genre of allGenres) {
        if (application.genre.includes(genre._id)) {
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
      const sameApp = applicationsExist.find((application) => application.developer.name === req.body.developer);
      if (sameApp) {
        res.redirect(sameApp.url);
      } else {
        const updatedApplication = await Application.findOneAndUpdate({ slug: req.params.id }, application, {});
        res.redirect(updatedApplication.url);
      }
    }
  })
];