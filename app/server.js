const express = require('express');

var la_fourchette = require('./la_fourchette_module.js');

const app = express();
const port = process.env.PORT || 5000;

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/api/fetch_sales', (req, res) => {
	console.log("Updating sales");
	la_fourchette.get_all_sales();
});

app.listen(port, () => console.log(`Listening on port ${port}`));