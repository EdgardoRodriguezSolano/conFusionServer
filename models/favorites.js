const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const favoriteSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},

	dishes: [{
		    type: mongoose.Schema.Types.ObjectId,
			ref: 'Dish'
	}]
},{
		usePushEach: true,
		timestamps: true
});


var Favorites = mongoose.model('Favorite', favoriteSchema);


module.exports = Favorites;