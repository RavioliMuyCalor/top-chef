async function get_restaurants_with_sales()
{
	return JSON.parse(fs.readFileSync('restaurants_with_sales.json'));
}