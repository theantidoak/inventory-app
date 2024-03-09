const Application = require('../models/application');
const Developer = require('../models/developer');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');