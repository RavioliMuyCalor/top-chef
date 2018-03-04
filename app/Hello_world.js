// LEARN YOU NODE 

// EXERCICE 1
//console.log("HELLO WORLD");

// EXERCICE 2
/*
var result = 0;

process.argv.forEach((val, index) => {
	if(index > 1)
  		result += Number(val);
}); 

console.log(result);
*/

// EXERCICE 3
/*
var fs = require('fs');
var str = (fs.readFileSync(process.argv[2])).toString();

var end_str = str.split('\n');

console.log(end_str.length -1);

*/

// EXERCICE 4
/*
var fs = require('fs');
fs.readFile(process.argv[2], function doneReading(err, fileContents){ 

	var str = fileContents.toString();
	var end_str = str.split('\n');
	console.log(end_str.length -1);
});
*/

// CORRECTION 

/* var fs = require('fs')
 var file = process.argv[2]

 fs.readFile(file, function (err, contents) {
   if (err) {
     return console.log(err)
   }
   // fs.readFile(file, 'utf8', callback) can also be used
   var lines = contents.toString().split('\n').length - 1
   console.log(lines)
})*/

// EXERCICE 5

/*
var fs = require('fs');
var file = process.argv[2];
var ext = process.argv[3];

fs.readdir(file, function callback(err, list){

	if(err)
	{
		return console.log(err);
	}

	for(i = 0; i < list.length; i++)
	{
		if(list[i].split('.')[1] == ext)
			console.log(list[i]);
	}
})
*/

// EXERCICE 6
/*

var dir_name = process.argv[2];
var ext = process.argv[3];

var mymodule = require('./module_exo6');

mymodule(dir_name, ext, printResult);

function printResult(err, data)
{
	if(err)
		return console.log(err);

	else
		for(i = 0; i < data.length; i++)
		{
			console.log(data[i]);
		}
		
}
*/

// EXERCICE 7

/*var https = require('https');

 https.get(process.argv[2], function (response){
	response.setEncoding('utf8')
	response.on('error', function (err)
	{
		return console.log(err);
	})

	response.on('data', function(data)
	{

		console.log(data);
	})

})*/

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var pSettle = require('p-settle');

var allRestaurants = [];


async function write_to_file(json)
{	
	try{
		var sep = ",\n";

		fs.appendFile('output.json', sep + JSON.stringify(json, null, 4), function(err){
			console.log('Michelin restaurants written');
		})
	}

	catch (err){
		return err;
	}
}

async function write_to_la_fourchette(restaurants)
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

async function write_final_file(restaurants)
{	
	try{
		fs.writeFile('restaurants_with_sales.json', '', function(){console.log('Clearing Restaurant with sales File')})

		fs.appendFile('restaurants_with_sales.json', JSON.stringify(restaurants, null, 4), function(err){
			console.log('Restaurants with sales file written');
		})
	}

	catch (err){
		return err;
	}
}

function scrape_url(url, callback)
{
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);
			var url_array = [];

			$('a[class=poi-card-link]').each(function (i, element) {
				//new_url_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));

				url_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));


			});
			//console.log(url_array);
			callback(url_array);
		}
		

	})
	
}

function scrape_restaurant_details(url_array)
{
	url_array.forEach(function (element)
	{
		request(element, function(error, response, html)
		{
			if(!error){
				var $ = cheerio.load(html);	

				let title;
				let postal_code;

				let json = { title : "", postal_code : ""};

				$('.poi_intro-display-title').filter(function() {
				//new_url_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));

				//url_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));
					var data = $(this);

					title = data.text();
					title = title.slice(7, title.length-4);
		
					json.title = title;
					//console.log("test");

				});

				$('.postal-code').filter(function() {
					var data = $(this);

					postal_code = data.text();
					json.postal_code = postal_code;
					//console.log("test");
				});

				write_to_file(json);
			}

		})

	})
}

function get_restaurants_name()
{ 

	var pages_done = 0;
	var test = false;

	for(i = 1; i < 35; i++)
	{
		url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
		url += "/page-" + i;

	//return new Promise((resolve, reject) => {
	   request(url, function(error, response, html){
	        if(!error){

	            var $ = cheerio.load(html);
	            console.log("===================== PAGE " + url);

	            //let restaurants = [];
	            let title;

	            let json = { title : ""};	
				
		            $('.poi_card-display-title').filter(function(){
		                var data = $(this);
		                title = data.text();

		                console.log(title);

		                json.title = title;
		               // restaurants.push(json);

		                //fin(json)
		            })
		            //console.log(restaurants);
		     // return resolve(fin(restaurants));
	        }
	    	})
	    //})   
	}

}

function test()
{

	for(i = 1; i < 35; i++)
	{
		url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
		url += "/page-" + i;

		scrape_url(url, scrape_restaurant_details);
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

function get_michelin_JSON()
{
	return JSON.parse(fs.readFileSync('output.json'));
}

function get_la_fourchette_JSON()
{
	return JSON.parse(fs.readFileSync('la_fourchette_restaurants.json'));
}

function get_all_la_fourchette_matching_restaurants()
{
	return new Promise((resolve, reject) => {

		matching_restaurants = get_michelin_JSON().restaurants.map(restaurant => find_la_fourchette_restaurant(restaurant));
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

				write_to_la_fourchette(la_fourchette_restaurants);

			console.log("\nRestaurants found on La Fourchette : "+i);

		})
		
	})
}

function get_sale(restaurant)
{
	return new Promise((resolve, reject) => {

		let sale = {title : "", details : "", discount_amount :""}
		let all_sales = [];
		let sale_exists = false;

		let restaurant_with_sales = { id : "", title : "", postal_code : "", sales : ""};

		let url = "https://m.lafourchette.com/api/restaurant/" + restaurant.value.id + "/sale-type";

		request({url:url, json:true}, function(error, response, html)
		{
			try
			{
				html.forEach(function(element)
				 {   	
				 	if(element.is_special_offer)
				 	{
				 		sale_exists = true;

				 		sale.title = element.title;
				 		sale.details = element.exclusions;
				 		sale.discount_amount = element.discount_amount;

				 		all_sales.push(sale);
				 	}
				 })

				 if(sale_exists)
				 {
				 	restaurant_with_sales.id = restaurant.value.id;
				 	restaurant_with_sales.title = restaurant.value.title;
				 	restaurant_with_sales.postal_code = restaurant.value.postal_code;
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

function main()
{
	//get_la_fourchette_matching_restaurants();

	//write_to_la_fourchette();

	get_all_la_fourchette_matching_restaurants();
	get_all_sales();


	//test();


}

main();

/*var restaurantList = [];

// For each .item, we add all the structure of a company to the companiesList array
// Don't try to understand what follows because we will do it differently.
$('.poi-search-result').find("li:not(.icon-mr)").each(function(index, element){
	console.log("JJJJ");
	restaurantList[index] = {};

	var details = $(element).find('.poi_card-description');
	restaurantList[index]['restaurants'] = {};
	restaurantList[index]['restaurants']['title'] = $(details).find('[class=poi_card-display-title]').text();
});


console.log(restaurantList); // Output the data in the terminal*/


 // EXERCICE 8
/*
var http = require('http');

 http.get(process.argv[2], function (response){
	response.setEncoding('utf8')
	response.on('error', function (err)
	{
		return console.log(err);
	})

	var final_str;
	var str1 ="";
	var str2 ="";


	response.on('data', function(data)
	{
		var splitted = data.split('.');
		str1 = splitted[0] + splitted[1];
	})

	response.on('data', function(data)
	{
		var splitted = data.split('.');
		str1 = splitted[0] + splitted[1];
	})


	response.on('end', function(end)
	{	
		final_str = str1 + str2;

		console.log(final_str.length);
		console.log(final_str);
	})

})

*/