$(function(){
	var a = window.location.href.split("?")[1].split("=")[1];
	var arr = ["name","sex","age","mail","phone"];
	var obj,objs;
	var reg_num = /^\d$/;
	// var reg_uname = /^[\da-zA-Z_]$/;
	var reg_name = /^[\u4e00-\u9fff]{1,5}$/;
	var reg_sex = /^[男女]$/;
	var reg_age = /^\d{1,2}$/;
	var reg_mail = /^[\da-zA-Z]{3,9}@[\da-zA-Z]{1,9}.cn|com$/;
	var reg_phone = /^1[329568][0-9]{9}$/;
	var flag_num = false;
	// var flag_uname = false;
	var flag_name = false;
	var flag_sex = false;
	var flag_age = false;
	var flag_mail = false;
	var flag_phone = false;
	// 刷新内容
	function fun(){
		// 每次都清空
		$(".contain").html("");
		$.ajax({
			type : "get",
			url : "/getdata?uname=" + a,
			success : function(data){
				// 服务器数据
				console.log(data);
				var data = eval("("+data+")");
				// 用全局变量存储
				console.log(data);
				if(data.length){
					obj = data[0].data;
				}else{
					obj = [];
				}
				objs = [];
				console.log(obj);
				if($("#ss").val() != "" && obj){
					console.log(111);
					for( var k in obj){
						if($("#ss").val() == "男" && obj[k].sex == "0"){
							obj[k].sex = "男";
						}else if($("#ss").val() == "女" && obj[k].sex == "1"){
							obj[k].sex = "女";
						}
						if(JSON.stringify(obj[k]).indexOf($("#ss").val()) != -1){
							objs.push(obj[k]);						 		
						}
						if(obj[k].sex == "男"){
							obj[k].sex = "0"
						}else if(obj[k].sex == "女"){
							obj[k].sex = "1"
						}
					}
				}else if(obj){
					objs = obj;
				}else{
					objs = [];
				}
				console.log(objs);
				console.log(data);
				// 循环增加ul
				for(var i = 0 ; i < objs.length ; i++){
					var ul = document.createElement("ul");		
					// 循环增加li
					for (var j = 0; j < 7; j++) {
						if(j == 0){
							// 第一个是编号
							var li = document.createElement("li");
							li.innerText = i + 1;
							ul.append(li);
						}else if(j == 6){
							// 第7个是删除按钮
							var li = document.createElement("li");
							var but = document.createElement("button");
							// 删除
							$(but).text("删除").click(function(){
								var no = this.value;
								$.ajax({
									type : "get",
									url : "/deldata",
									data : {
										uname : a,
										pid : no
									},
									success : fun
								})
							}).val(objs[i].pid)
							li.appendChild(but);
							ul.append(li);
						}else{
							var li = document.createElement("li");
							if(j == 5 || j == 4){
								$(li).addClass("li-w")
							}
							if(j == 2){
								console.log(objs[i][arr[j-1]]);
								objs[i][arr[j-1]] = objs[i][arr[j-1]] == 0 ? "男":"女";
							}
							li.innerText = objs[i][arr[j-1]];
							ul.append(li);
						}
						
					}
					$(ul).addClass("clearfix")
					$(".contain").append(ul)
				}
				
			}
		})
	}
	// 获取焦点时边框颜色
	$(".list").on("focus","input",function(){
		this.style.borderColor = "#333"
	})
	fun()
	// 编号验证
	$("#noo").blur(function(){
		if(reg_num.test($("#noo").val()) && $("#noo").val () > 0 && $("#noo").val() <= objs.length){
			this.style.borderColor = "#999";
			flag_num = true;
					
		}else{
			this.style.borderColor = "#e00";
			flag_num = false;
		}
	})

	// 验证
	$("#name").blur(function(){
		console.log(reg_name.test($("#name").val()));
		if(reg_name.test($("#name").val())){
			this.style.borderColor = "#999";
			flag_name = true;
		}else{
			this.style.borderColor = "#e00";
			flag_name = false;
		}
	})
	$("#sex").blur(function(){
		if(reg_sex.test($("#sex").val())){
			this.style.borderColor = "#999";
			flag_sex = true;
		}else{
			this.style.borderColor = "#e00";
			flag_sex = false;
		}
	})
	$("#age").blur(function(){
		if(reg_age.test($("#age").val())){
			this.style.borderColor = "#999";
			flag_age = true;
		}else{
			this.style.borderColor = "#e00";
			flag_age = false;
		}
	})
	$("#mail").blur(function(){
		if(reg_mail.test($("#mail").val())){
			this.style.borderColor = "#999";
			flag_mail = true;
		}else{
			this.style.borderColor = "#e00";
			flag_mail = false;
		}
	})
	$("#phone").blur(function(){
		if(reg_phone.test($("#phone").val())){
			this.style.borderColor = "#999";
			flag_phone = true;
		}else{
			this.style.borderColor = "#e00";
			flag_phone = false;
		}
	})
	// 增加
	$("#add").click(function(){
		if(flag_phone&&flag_mail&&flag_sex&&flag_age&&flag_name){
			$.ajax({
				type : "post",
				url : "/adddata",
				data : {
					uname : a,
					name : $("#name").val(),
					// 男0女1转换
					sex : $("#sex").val() == "男" ? 0:1,
					age : $("#age").val(),
					mail : $("#mail").val(),
					phone : $("#phone").val()
				},
				success : fun
			})
		}
	})
	// 修改
	$("#change").click(function(){
		console.log(objs[$("#noo").val() - 1].pid)
		console.log(flag_num)
		if(flag_num == true){
			if(flag_name || flag_sex || flag_age || flag_mail || flag_phone){
				$.ajax({
					type : "post",
					url : "/revisedata",
					data : {
						uname : a,
						pid : objs[$("#noo").val() - 1].pid,
						// 有就改，没有就不改
						name : flag_name ? $("#name").val():objs[$("#noo").val()-1].name,
						sex : flag_sex ? $("#sex").val() == "男" ? 0:1:objs[$("#noo").val()-1].sex == "男" ? 0:1,
						age : flag_age ? $("#age").val():objs[$("#noo").val()-1].age,
						mail : flag_mail ? $("#mail").val():objs[$("#noo").val()-1].mail,
						phone : flag_phone ? $("#phone").val():objs[$("#noo").val()-1].phone,
					},
					success : fun
				})
			}
		}
	})
	//搜索
	$("#search").click(fun);

	var nuser = document.getElementById('nuser');
	var address = window.location.href;
	nuser.innerText = address.split('=')[1];
})