var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var pSettle = require('p-settle');

function write_michelin(json)
{	
	try{

		fs.writeFile('michelin_restaurants.json', '', function(){console.log('Clearing Michelin File')})
		fs.appendFile('michelin_restaurants.json', JSON.stringify(json, null, 4), function(err){
			console.log('Michelin restaurants written');
		})
	}

	catch (err){
		return err;
	}
}

function scrape_url(url)
{
	return new Promise((resolve, reject) => {
		request(url, function(error, response, html){
			if(!error){
				var $ = cheerio.load(html);
				var url_array = [];

				$('a[class=poi-card-link]').each(function (i, element) {

					url_array.push('https://restaurant.michelin.fr' + $(element).attr('href'));

				});

				resolve(url_array);
			}
			else
				reject();
			
		})
	})
}

function scrape_all_urls(url_array)
{
	return new Promise((resolve, reject) => {
		raw_urls = url_array.map(page_url => scrape_url(page_url));
		let all_restaurants_urls = [];

			pSettle(raw_urls).then(result => {

			result.forEach(function(elem){
				if(elem.isFulfilled)
				{	
					elem.value.forEach(function(url)
					{
						all_restaurants_urls.push(url);
					})
					
				}
			})

			//console.log(all_restaurants_urls);
			console.log("\nGot all restaurant urls");
			resolve(all_restaurants_urls);
		
		})

	})
}

function get_michelin_JSON()
{
	return JSON.parse(fs.readFileSync('michelin_restaurants.json'));
}

function scrape_restaurant_details(url)
{
	return new Promise((resolve, reject) => {

		let title;
		let postal_code;
		let restaurant = { title : "", postal_code : ""};

		request(url, function(error, response, html)
		{
			if(!error){
				var $ = cheerio.load(html);	

				$('.poi_intro-display-title').filter(function() {

					var data = $(this);

					title = data.text();
					title = title.slice(7, title.length-4);
		
					restaurant.title = title;

				});

				$('.postal-code').filter(function() {
					var data = $(this);

					postal_code = data.text();
					restaurant.postal_code = postal_code;
				});

				console.log(restaurant);
				resolve(restaurant);
			}

			else
				reject();

		})

	})
}

async function scrape_restaurants()
{
	let url_array = [];

	for(i = 1; i < 35; i++)
	{
		url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
		url += "/page-" + i;

		//scrape_url(url, scrape_all_restaurant_details);
		url_array.push(url);
	}

	const all_restaurant_urls = await scrape_all_urls(url_array);

	found_restaurants = all_restaurant_urls.map(url => scrape_restaurant_details(url));

	let michelin_restaurants = [];

	pSettle(found_restaurants).then(result => {
		let i = 0;
		//let restaurant = { id : "", title : "", postal_code : ""};

		result.forEach(function(elem){

			if(elem.isFulfilled)
			{	
				michelin_restaurants.push(elem.value);
				i++;
			}
		})

		write_michelin(michelin_restaurants);

		console.log("\nRestaurants found on Michelin : "+i);

	})
}

module.exports = {
	scrape_restaurants : scrape_restaurants,
	get_michelin_JSON : get_michelin_JSON,
};
