var https = require('https'),
	http = require('http'),
	fs = require('fs');


fnLoad();
var symbolArr = ['yunbibtccny', 'yunbiethcny', 
				'yunbidgdcny', 'yunbieoscny', 'yunbisccny',
				'yunbi1stcny', 'yunbianscny', 'yunbietccny', 
				'yunbigntcny', 'yunbiqtumcny', 'yunbibtscny', 'yunbigxscny']

//step=60     1分钟
//step=180    3分钟
//step=300    5分钟
//step=600    10分钟
//step=900    15分钟
//step=1800   30分钟
//step=3600   1小时
//step=7200   2小时
//step=14400  4小时
//step=21600  6小时
//step=43200  12小时
//step=86400  1天
//step=259200 3天
//step=604800 周线
symbolArr.forEach(function(e){
	fnLoad(e)
});
function fnLoad(name){

	https.get("https://plugin.sosobtc.com/widgetembed/data/period?symbol="+name+"&step=900", function(res) {
		var size = 0,
			chunks = [];
		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});
		res.on('end', function(e){
			data = Buffer.concat(chunks, size),
			dataJSON = data.toString();
			console.log(name)
			fs.writeFile('json/'+name+'.json', dataJSON, function(err){
				console.log('err' +err)
			});	
		});
		/*http.createServer(function(req,res){
			res.writeHead(200, {'Content-type' : 'text/html'});
			res.write(dataJSON);
			res.end();
		}).listen(6000);*/
	});
}