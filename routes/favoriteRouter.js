const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
	Favorites.find({})
	.populate('dishes')
	.populate('user')
	.then((Favorites) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(Favorites);
	}, (err) => next(err))
	.catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,  (req,res,next) => {
	Favorites.find()
	.then((query) =>{
		if (query.length>0) {	// Theres a record for favorites
			Favorites.update({'$addToSet': {"dishes": { $each: req.body}}}) //The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.
			.then((dish) => {
									res.statusCode = 200;
									res.setHeader('Content-Type', 'application/json');
									res.json(dish);
								}, (err) => next(err))
								.catch((err) => next(err));
		}else{					// No existe registro para favoritos y se crea
			obj = {
				user: "",
				dishes: []
			}
			obj.user = req.user._id;
			let dishes = [];
			for (i=0; i<req.body.length; i++)
				 dishes.push(req.body[i]._id);	// adds new dishId to the array list
			obj.dishes = dishes;
			Favorites.create(obj)
			.then((query) =>
			{
				console.log("Favorite created");
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(query);
			}, (err) => next(err));
		}

		}, (err) => next(err))
		.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,  (req,res,next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /Favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,  (req,res,next) => {
	Favorites.remove({})
	.then((resp) =>{
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	},(err) => next(err))
	.catch((err) => next(err)); 
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /Favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,  (req,res,next) => {
	Favorites.find()
	.then((query) =>{
		if (query.length>0) {	// Theres a record for favorites
			fav_id = query[0]._id;
			dishes = query[0].dishes;
			Favorites.find({dishes:  req.params.dishId})
			.then((query) =>{
					if (query.length>0) {	// dishId has been added as a favorite for this user
								err = new Error('Dish ' + req.params.dishId + ' already added as a favorite for this user');
								err.status = 403;
								return next(err);
					}else   // dishId has not been added as a favorite for this user, Updating
					{		
							req.body.user = req.user._id;
							dishes.push(req.params.dishId);	// adds new dishId to the array list
							req.body.dishes = dishes;
							Favorites.findByIdAndUpdate(fav_id, {
									$set: req.body
							}, {new: true})
							.then((dish) => {
									res.statusCode = 200;
									res.setHeader('Content-Type', 'application/json');
									res.json(dish);
								}, (err) => next(err))
								.catch((err) => next(err));
					}
			}, (err) => next(err));
		}else{					// No existe registro para favoritos y se crea
			obj = {
				user: "",
				dishes: []
			}
			obj.user = req.user._id;
			obj.dishes = req.params.dishId;
			Favorites.create(obj)
			.then((query) =>
			{
				console.log("Favorite created");
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(query);
			}, (err) => next(err));
		}

		}, (err) => next(err))
		.catch((err) => next(err));
})   
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,  (req,res,next) => {
	Favorites.update({'$pull': {"dishes": req.params.dishId}})
	.then((resp) =>{
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	},(err) => next(err))
	.catch((err) => next(err)); 
});

module.exports = favoriteRouter;