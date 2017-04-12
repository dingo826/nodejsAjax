var https = require('https'),
	http = require('http'),
	fs = require('fs');


fnLoad();

function fnLoad(){
	https.get("https://www.worldcoinindex.com/apiservice/json?key=IGjD81kLunvK3IxD2AxUPY6Gt", function(res) {
		var size = 0,
			chunks = [];
		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});
		res.on('end', function(e){
			data = Buffer.concat(chunks, size),
			dataJSON = data.toString();
			console.log(dataJSON)
			fs.writeFile('22.json', dataJSON, function(err){
				console.log('err' +err)
			});	
		});
		http.createServer(function(req,res){
			res.writeHead(200, {'Content-type' : 'text/html'});
			res.write(dataJSON);
			res.end();
		}).listen(6000);
	});
}