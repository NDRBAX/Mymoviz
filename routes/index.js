var express = require("express");
var router = express.Router();
var request = require("sync-request");

var movieModel = require("../models/movies");
var myApiKey = "8df37053ba9ef22aeb5453b87146e98a";

/* 1 - Une des fonctionnalités principales de l’app est d'obtenir les films les plus populaires. Pour cela il faudra que le Backend puisse répondre à cette question.
GET pour lire de l'information. Les envois GET devront toujours être traités par une route définie en get et les informations reçues seront disponibles dans l'objet req.query. */
router.get("/new-movies", function (req, res, next) {
  var data = request(
    "GET",
    `https://api.themoviedb.org/3/discover/movie?api_key=${myApiKey}&language=fr-FR&region=FR&sort_by=release_date.desc&include_adult=false&include_video=false&page=1&release_date.lte=2020-01-01`
  );
  var dataParse = JSON.parse(data.body);
  // La réponse à renvoyer au Frontend sera toujours au format JSON.
  res.json({ result: true, movies: dataParse.results });
});

/* 2 - L’utilisateur peut ensuite mettre des films en wishlist. Là encore, si l’on souhaite enregistrer durablement la wishlist, il faudra utiliser une base de données. Et pour cela, il faut encore une fois un Backend qui puisse réaliser cette opération.
POST pour écrire de l’information. Les envois POST devront toujours être traités par une route définie en post et les informations reçues seront disponibles dans l'objet req.body.  */
router.post("/wishlist-movie", async function (req, res, next) {
  var newMovie = new movieModel({
    movieName: req.body.name,
    movieImg: req.body.img,
  });
  // requête en base de données qui permette d’enregistrer le nom du film reçu et disponible via la propriété movieName.
  var movieSave = await newMovie.save();
  var result = false;
  if (movieSave.movieName) {
    result = true;
  }
  // Renvoyez une réponse au format JSON.
  res.json({ result });
});

/* 3 - L’utilisateur peut également supprimer un film de la wishlist. Il faudra donc pouvoir demander au Backend d'exécuter cette opération en supprimant le film de la base de données. */
router.delete("/wishlist-movie/:name", async function (req, res, next) {
  var returnDb = await movieModel.deleteOne({ movieName: req.params.name });
  var result = false;
  if (returnDb.deletedCount == 1) {
    result = true;
  }
  res.json({ result });
});

/* 4 - Récupérer les films de la wishlist. Il faudra demander au Backend de retourner l'intégralité des films qu’il aura enregistré auparavant en base de données. */
router.get("/wishlist-movie", async function (req, res, next) {
  var movies = await movieModel.find();
  res.json({ movies });
});

module.exports = router;
