
module.exports = function(directoryName, ext, callback)
{
	var fs = require('fs');
	fs.readdir(directoryName, function doneReading(err, list){

		if(err)
			return callback(err);

		var new_list = [];
		for(i = 0; i < list.length; i++)
		{
			if(list[i].split('.')[1] == ext)
				new_list.push(list[i]);
		}
		callback(null, new_list);

	})
}