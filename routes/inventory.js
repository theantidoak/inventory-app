const express = require('express');
const router = express.Router();

const application_controller = require("../controllers/applicationController");
const developer_controller = require("../controllers/developerController");
const genre_controller = require("../controllers/genreController");

/// APPLICATION ROUTES ///

router.get("/", application_controller.index);

router.get("/applications/create", application_controller.application_create_get);

router.post("/applications/create", application_controller.application_create_post);

router.get("/applications/:slug/delete", application_controller.application_delete_get);

router.post("/applications/:slug/delete", application_controller.application_delete_post);

router.get("/applications/:slug/update", application_controller.application_update_get);

router.post("/applications/:slug/update", application_controller.application_update_post);

router.get("/applications/:slug", application_controller.application_detail);

router.get("/applications", application_controller.application_list);

/// DEVELOPER ROUTES ///

router.get("/developers/create", developer_controller.developer_create_get);

router.post("/developers/create", developer_controller.developer_create_post);

router.get("/developers/:slug/delete", developer_controller.developer_delete_get);

router.post("/developers/:slug/delete", developer_controller.developer_delete_post);

router.get("/developers/:slug/update", developer_controller.developer_update_get);

router.post("/developers/:slug/update", developer_controller.developer_update_post);

router.get("/developers/:slug", developer_controller.developer_detail);

router.get("/developers", developer_controller.developer_list);

/// GENRE ROUTES ///

router.get("/genres/create", genre_controller.genre_create_get);

router.post("/genres/create", genre_controller.genre_create_post);

router.get("/genres/:slug/delete", genre_controller.genre_delete_get);

router.post("/genres/:slug/delete", genre_controller.genre_delete_post);

router.get("/genres/:slug/update", genre_controller.genre_update_get);

router.post("/genres/:slug/update", genre_controller.genre_update_post);

router.get("/genres/:slug", genre_controller.genre_detail);

router.get("/genres", genre_controller.genre_list);

module.exports = router;