// Created by Diori

document.addEventListener('DOMContentLoaded',() => {
	const socket = io('/',{query: 'token=B'});

	var domElement = document.getElementById('grid');
  	var getAllGridValue = [];

  	// ======= Append html statistics of cursor trail  =======
	function bindHTMLData(){
		var groupByIDs = [];
		getAllGridValue.filter(function(obj){
			var ind = groupByIDs.findIndex((x) => x.id == obj.id);
			if(ind == -1){
				groupByIDs.push(obj);
			}
		});

		html = '';
		var callBack = groupByIDs.filter(function(obj){

			speed = 0;
			counter = 0;
			lastSpeed = 0;
			var returnList = getAllGridValue.filter(function(ele){
				if(ele.id == obj.id){
					speed = speed + ele.speed;
					lastSpeed = ele.speed;
					counter = counter + 1;
					return true;
				}

			});

			if(returnList.length){
				html = html + '<div class="list">';
				html = html + '<div><span>Box : </span><span>'+ obj.id.replace('box','') + '</span></div>';
				html = html + '<div><span>Current : </span><span>'+ lastSpeed + '</span></div>';
				html = html + '<div><span>Average : </span><span>'+ (speed / counter).toFixed(2) +'</span></div>';
				html = html + '</div>';
				return true;
			}

		});

		if(callBack.length){
			$('.showList').html(html);
		}
	}

	// ======= Get cursor coordinates from trail =======
	socket.on('stepTwoData',(dotArray,replay)=>{
		if(replay){
			getAllGridValue = [];
			if(dotArray.data && dotArray.data.length){
				dotLength = $(domElement).find('.dot').remove();
				dotArray.data.filter(function(obj,index){
					obj['group_'+(index + 1)].filter(function(ele,ind){
						if(ind < obj['group_'+(index + 1)].length - 1){
							dot = document.createElement('div');
							dot.className = "dot";
							dot.style.left = ele['second_'+(ind + 1)]['pageX'] + "px";
							dot.style.top = ele['second_'+(ind + 1)]['pageY'] + "px";
							dot.style.display = 'none';
							var timeZone = ele['second_'+(ind + 1)]['timestamp'];
							timeZone = new Date(timeZone);
							$(dot).appendTo(domElement).show('slow');

							$(domElement).find('.box').each(function(inum){
								var getCurrentBoxPosLeft = Number($(this).css('left').replace('px',''));
								var getCurrentBoxPosTop = Number($(this).css('top').replace('px',''));
								var boxRadiusLeft = $(this).width() + getCurrentBoxPosLeft;
								var boxRadiusTop = $(this).height() + getCurrentBoxPosTop;

								if(ele['second_'+(ind + 1)]['pageX'] >= getCurrentBoxPosLeft && ele['second_'+(ind + 1)]['pageY'] >= getCurrentBoxPosTop && ele['second_'+(ind + 1)]['pageY'] <= boxRadiusTop && ele['second_'+(ind + 1)]['pageX'] <= boxRadiusLeft){
									var id = $(this).attr('id');
									var emptyArray = {'id':id,'speed':ele['second_'+(ind + 1)]['speed'],'counter':1};
									getAllGridValue.push(emptyArray);
									$(this).html(ele['second_'+(ind + 1)]['speed']);
								}
							});
						}
					});
				});
				bindHTMLData();
			}
		}else{

			// Bind cursor trail coordinates from App A into a temporary array for App B
			var dotLength = dotArray.filter(function(data){
				dot = document.createElement('div');
				dot.className = "dot";
				$(domElement).find('.box').each(function(inum){
					var getCurrentBoxPosLeft = Number($(this).css('left').replace('px',''));
					var getCurrentBoxPosTop = Number($(this).css('top').replace('px',''));
					var boxRadiusLeft = $(this).width() + getCurrentBoxPosLeft;
					var boxRadiusTop = $(this).height() + getCurrentBoxPosTop;

					if(data['pageX'] >= getCurrentBoxPosLeft && data['pageY'] >= getCurrentBoxPosTop && data['pageY'] <= boxRadiusTop && data['pageX'] <= boxRadiusLeft){
						var id = $(this).attr('id');
						var emptyArray = {'id':id,'speed':data['speed'],'counter':1};
						getAllGridValue.push(emptyArray);
						$(this).html(data['speed']);
					}
				});

				dot.style.left = data['pageX'] + "px";
				dot.style.top = data['pageY'] + "px";
				domElement.appendChild(dot);
				return true;
			})
			if(dotLength.length){
				bindHTMLData();
			}

		}

	});

	// =======  Go to replay view =======
 	callBackReplay = function(){
		socket.emit('stepTwo',false);
	}

	// =======  Go to live view =======
	callBackLive = function(){
		$(domElement).find('.dot').remove();
		$(domElement).find('.box').html('');
		$('.showList').html('');
		socket.emit('stepTwo',true);

	}
});
