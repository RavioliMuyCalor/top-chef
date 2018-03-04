var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var pSettle = require('p-settle');

var michelin = require('./michelin_module');

function write_la_fourchette(restaurants)
{	
	try{
		fs.writeFile('la_fourchette_restaurants.json', '', function(){console.log('Clearing La Fourchette File')})

		fs.appendFile('la_fourchette_restaurants.json', JSON.stringify(restaurants, null, 4), function(err){
			console.log('La fourchette restaurants written');
		})
	}

	catch (err){
		return err;
	}
}

function write_final_file(restaurants)
{	
	try{
		fs.writeFile('my-app/src/' + 'restaurants_with_sales.json' , '', function(){console.log('Clearing Restaurant with sales file in src')})

		fs.appendFile('my-app/src/' + 'restaurants_with_sales.json', JSON.stringify(restaurants, null, 4), function(err){
			console.log('Restaurants with sales file written in src');
		})
	}

	catch (err){
		return err;
	}
}

function find_la_fourchette_restaurant(michelin_restaurant)
{

	return new Promise((resolve, reject) => {

		let url ="https://m.lafourchette.com/api/restaurant-prediction?name=" + michelin_restaurant.title;
		let matching_restaurant = null;

		request({url:url, json:true}, function(error, response, html)
		{
			try
			{
				// for (var j = 0; j < html.length; j++) 
				html.forEach(function(element)
				 {   	

					let restaurant = { id : "", title : "", postal_code : ""};

					restaurant.id = element.id;
					restaurant.title = element.name;
					restaurant.postal_code = element.address.postal_code;	

					//console.log(html[j].address.postal_code);

					if(restaurant.postal_code == michelin_restaurant.postal_code && restaurant.title.includes(michelin_restaurant.title))
					{
						matching_restaurant = restaurant;
					}

				})

				if(matching_restaurant !=null)
					resolve(matching_restaurant);

				else
					reject();
					
			}

			catch(err)
			{
				reject(err);
			}
			
		})
	})
}

function get_all_la_fourchette_matching_restaurants()
{
	return new Promise((resolve, reject) => {

		matching_restaurants = michelin.get_michelin_JSON().map(restaurant => find_la_fourchette_restaurant(restaurant));
		let la_fourchette_restaurants = [];

		pSettle(matching_restaurants).then(result => {
			let i = 0;
			let restaurant = { id : "", title : "", postal_code : ""};

			result.forEach(function(elem){

				if(elem.isFulfilled)
				{	
					la_fourchette_restaurants.push(elem.value);
					i++;
				}
			})

				write_la_fourchette(la_fourchette_restaurants);

			console.log("\nRestaurants found on La Fourchette : "+i);

		})
		
	})
}

function get_sale(restaurant)
{
	return new Promise((resolve, reject) => {

		let all_sales = [];
		let sale_exists = false;

		let restaurant_with_sales = { id : "", title : "", postal_code : "", sales : ""};

		let url = "https://m.lafourchette.com/api/restaurant/" + restaurant.id + "/sale-type";

		request({url:url, json:true}, function(error, response, html)
		{
			try
			{
				html.forEach(function(element)
				 {   	
				 	if(element.is_special_offer)
				 	{
				 		let sale = {title : "", details : "", discount_amount :""}

				 		sale_exists = true;

				 		sale.title = element.title;
				 		sale.details = element.exclusions;
				 		sale.discount_amount = element.discount_amount;

				 		all_sales.push(sale);
				 	}
				 })

				 if(sale_exists)
				 {
				 	restaurant_with_sales.id = restaurant.id;
				 	restaurant_with_sales.title = restaurant.title;
				 	restaurant_with_sales.postal_code = restaurant.postal_code;
				 	restaurant_with_sales.sales = all_sales;

					resolve(restaurant_with_sales);
				 }

				else
					reject();
			}
			catch(err)
			{
				reject(err);
			}

		})
	})
}

function get_all_sales()
{
	return new Promise((resolve, reject) => {

		unstructured_restaurants_with_sales = get_la_fourchette_JSON().map(restaurant => get_sale(restaurant));
		let restaurants_with_sales = [];

		pSettle(unstructured_restaurants_with_sales).then(result => {
			let i = 0;

			result.forEach(function(elem){
				if(elem.isFulfilled)
				{	
					restaurants_with_sales.push(elem.value);
					i++;
				}
			})

				console.log(restaurants_with_sales);
				write_final_file(restaurants_with_sales);

				console.log("\nRestaurants wtih sales : "+i);
		
		})
	})

}

function get_la_fourchette_JSON()
{
	return JSON.parse(fs.readFileSync('la_fourchette_restaurants.json'));
}

function get_restaurants_with_sales_JSON()
{
	return JSON.parse(fs.readFileSync('restaurants_with_sales.json'));
}

module.exports = {
	get_all_la_fourchette_matching_restaurants : get_all_la_fourchette_matching_restaurants,
	get_all_sales : get_all_sales,
	get_la_fourchette_JSON : get_la_fourchette_JSON,
	get_restaurants_with_sales_JSON : get_restaurants_with_sales_JSON,
};