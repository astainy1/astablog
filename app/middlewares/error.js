// Middleware to throw error

const express = require("express");
const app = express();

const notFound = function notFoundGetRoute(req, res, next) {
  res.status(404);
  res.render("404", { title: "Not Found | astaBlog" });

  return next();
};

const serverError = function serverErrorRoute(err, req, res, next) {
  if (err) {
    console.error(`Server Error: ${err.stack}`);
  }

  res.status(500);
  res.render("500", { title: "Server Error | astaBlog" });

  return next();
};

module.exports = {
  notFound,
  serverError,
};
