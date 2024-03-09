const express = require('express');
const router = express.Router();

const application_controller = require("../controllers/applicationController");
const developer_controller = require("../controllers/developerController");
const genre_controller = require("../controllers/genreController");

/// APPLICATION ROUTES ///

router.get("/", application_controller.index);

router.get("/application/create", application_controller.application_create_get);

router.post("/application/create", application_controller.application_create_post);

router.get("/application/:id/delete", application_controller.application_delete_get);

router.post("/application/:id/delete", application_controller.application_delete_post);

router.get("/application/:id/update", application_controller.application_update_get);

router.post("/application/:id/update", application_controller.application_update_post);

router.get("/application/:id", application_controller.application_detail);

router.get("/applications", application_controller.application_list);

/// DEVELOPER ROUTES ///

router.get("/developer/create", developer_controller.developer_create_get);

router.post("/developer/create", developer_controller.developer_create_post);

router.get("/developer/:id/delete", developer_controller.developer_delete_get);

router.post("/developer/:id/delete", developer_controller.developer_delete_post);

router.get("/developer/:id/update", developer_controller.developer_update_get);

router.post("/developer/:id/update", developer_controller.developer_update_post);

router.get("/developer/:id", developer_controller.developer_detail);

router.get("/developers", developer_controller.developer_list);

/// GENRE ROUTES ///

router.get("/genre/create", genre_controller.genre_create_get);

router.post("/genre/create", genre_controller.genre_create_post);

router.get("/genre/:id/delete", genre_controller.genre_delete_get);

router.post("/genre/:id/delete", genre_controller.genre_delete_post);

router.get("/genre/:id/update", genre_controller.genre_update_get);

router.post("/genre/:id/update", genre_controller.genre_update_post);

router.get("/genre/:id", genre_controller.genre_detail);

router.get("/genres", genre_controller.genre_list);

module.exports = router;