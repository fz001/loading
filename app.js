var http = require("http");
var fs = require("fs");
var url = require("url");
var qstr = require("querystring");
var path = require("path");

var pid;

var server = http.createServer();
// console.log(path);
// console.log(url);
server.on("request",function(req,res){
	var urlObj = url.parse(req.url,true);
	// console.log(urlObj);
	var pathname = urlObj.pathname;

	if(pathname =="/bg.jpg" && req.method == "GET"){
		fs.readFile("./bg.jpg",function(err,data){
			res.writeHead(200,{
				"Content-Type" : "image/jpg;"
			})
			res.end(data);
		})
	}

	function file(){
		console.log(urlObj.pathname);
		if(path.extname(urlObj.pathname).split(".")[1]){
			fs.readFile("."+urlObj.pathname,"utf8",function(err,data){
				res.writeHead(200,{"Content-Type" : "text/"+path.extname(urlObj.pathname).split(".")[1]+";charset=utf8"});				
				res.end(data)
			})
		}
		
	}
	file()

	//注册失焦验证
	if(urlObj.pathname == "/reg_user" && req.method == "GET" && urlObj.query.uname){
		fs.stat("./yh/reg.json",function(err,stats){
			if(!stats.isDirectory()){
				fs.readFile("./yh/reg.json",function(err,data){
					data = JSON.parse(data)
					for(var i in data){
						if(urlObj.query.uname == data[i].uname){
							res.end('0');
						}
					}
					res.end("1");
				})
			}
		})
		//登录
	}else if(urlObj.pathname == "/login" && req.method == "POST"){
		var data = "";
		req.on("data",function(chunk){
			console.log(chunk);
			data += chunk;
		})
		console.log(data);
		req.on("end",function(){
			var dataObj = qstr.parse(data);
			console.log(dataObj);
			if(dataObj.uname && dataObj.upassword){
				fs.readFile("./yh/reg.json","utf8",function(err,data){
					data = JSON.parse(data);
					for(var j in data){
						console.log(data[j]);
						if(data[j].uname == dataObj.uname && data[j].upassword == dataObj.upassword){

							res.end("1")
						}
					}
					res.end("2")
				})
			}else{
				res.end("0")
			}
		})
		//注册
	}else if(urlObj.pathname == "/reg" && req.method == "POST"){
		var data = "";
		req.on("data",function(chunk){
			data += chunk;
		})
		req.on("end",function(){
			var dataObj = qstr.parse(data);
			if(dataObj.uname && dataObj.upassword){
				fs.writeFileSync("./data/"+dataObj.uname+".json","[]","utf8");
					fs.readFile("./yh/reg.json","utf8",function(err,data){
						data = JSON.parse(data);
						data.push(dataObj)
						fs.writeFile("./yh/reg.json",JSON.stringify(data),"utf8",function(){
							res.end("1");
						})
					})
			}else{
				res.end("0");
			}
		})
	}else if(urlObj.pathname == "/getdata" && req.method == "GET" && urlObj.query.uname){
		fs.stat("./data/"+ urlObj.query.uname+".json",function(err,stats){
			if(!stats.isDirectory()){
				fs.readFile("./data/"+urlObj.query.uname+".json","utf8",function(err,data){
					var data = JSON.parse(data);
					data = JSON.stringify(data);
					res.end(data);
				})
			}
		})
		
		//增加
	}else if(urlObj.pathname == "/adddata" && req.method == "POST"){
		var data = "";
		req.on("data",function(chunk){
			data += chunk;
		}).on("end",function(){
			dataObj = qstr.parse(data);
			fs.stat("./data/"+ dataObj.uname+".json",function(err,stats){
				if(!stats.isDirectory()){
					fs.readFile("./data/"+dataObj.uname+".json","utf8",function(err,data){
						var data = JSON.parse(data);
						var dt = {};
						for(var i in dataObj){
							if(i == "uname"){
								continue;
							}
							dt[i] = dataObj[i];
						}
						console.log(5,pid);
						if(!data.length){
							pid = 0;
							dt.pid = pid;
							obj = {
								message : "OK",
								data : [dt]
							}
							data.push(obj)
							console.log(3,pid);
						}else if(data[0].data.length){
							if(!pid){
								pid = data[0].data[data[0].data.length-1].pid + 1;
								console.log(2,pid);
							}
							dt.pid = pid;
							data[0].data.push(dt)
						}else{
							pid = 0;
							dt.pid = pid;
							data[0].data.push(dt)
						}
												
						pid++;
						data = JSON.stringify(data)
						fs.writeFile("./data/"+ dataObj.uname+".json",data,function(err){							
							res.end("1")
						})						
					})
				}
			})
		})
		// 删除
	}else if(urlObj.pathname == "/deldata" && req.method == "GET" && urlObj.query.uname && urlObj.query.pid){
		fs.stat("./data/"+ urlObj.query.uname+".json",function(err,stats){
			if(!stats.isDirectory()){
				fs.readFile("./data/"+urlObj.query.uname+".json","utf8",function(err,data){
					var data = JSON.parse(data);
					
					for( var m in data[0].data ){
						console.log(data[0].data[m].pid);
						if(data[0].data[m].pid == urlObj.query.pid){
							data[0].data.splice(m,1);
							break;
						}
					}
					console.log(data[0].data.length);
					data = JSON.stringify(data);
					fs.writeFile("./data/"+urlObj.query.uname+".json",data,function(err){
						res.end("1")
					})
				})
			}
		})
		//修改
	}else if(urlObj.pathname == "/revisedata" && req.method == "POST"){
		var data = "";
		req.on("data",function(chunk){
			data += chunk;
		}).on("end",function(){
			dataObj = qstr.parse(data);
			fs.stat("./data/"+ dataObj.uname+".json",function(err,stats){
				if(!stats.isDirectory()){					
					fs.readFile("./data/"+dataObj.uname+".json","utf8",function(err,data){
						var data = JSON.parse(data);
						console.log(data);
						for(var n in data[0].data){
							if(data[0].data[n].pid == dataObj.pid){
								for( var x in dataObj){
									if( x == "uname" || x == "pid"){
										continue;
									}else{
										data[0].data[n][x] = dataObj[x];
									}									
								}
							} 
						}
						data = JSON.stringify(data)
						fs.writeFile("./data/"+dataObj.uname+".json",data,function(err){
							
							res.end("1")
						})						
					})
				}
			})
		})
	}
})

server.listen(3001);
console.log("server is running in 127.0.0.1:3001")