// Created by Diori

document.addEventListener('DOMContentLoaded',() => {

	const socket = io('/',{query: 'token=A'});
	var domElement = document.getElementById('grid');
	velocity = 0;

	// ======= CallBack cursor to draw coordinates trail  =======
	$(domElement).on("mousedown", function() {
		mouse_coors(0);
	});

	var drawArray = [];
	var timer;

	// ======= Stop cursor trail event after ending cursor movement =======
	$(domElement).on("mouseup", function() {
		$(domElement).off("mouseup").off("mousemove");
	});

	// ======= Stop cursor trail event after going outside box =======
	$(document).on("mouseup", function() {
		$(domElement).off("mouseup").off("mousemove");
	});

	// ======= Get cursor coordinates and velocity value =======
	function mouse_coors(x2){
		$(domElement).on("mousemove", function(e) {
			e.preventDefault();
			var x = e.clientX,
			velocity = Math.abs(x-x2);
			handleMouseMove(e,velocity);

			$(domElement).off("mousemove");
			setTimeout(function() {
				x2 = e.clientX;
				mouse_coors(x2);
			}, 100);

		});

		$(domElement).on("mouseup", function() {
			socket.emit('stepOne',drawArray,true);
      		drawArray = [];
			$(domElement).off("mouseup").off("mousemove");
		});

	}

	// ======= Bind trail (dots) array on trail box (500x500) =======
    function handleMouseMove(event,velocity) {

	  var dot, eventDoc, doc, body, pageX, pageY;
	  event = event || window.event;

	  var ele = document.getElementById('grid');
	  eventDoc = (event.target && event.target.ownerDocument) || document;

      clientX = $(ele).offset().left;
      clientY = $(ele).offset().top;

      pageX = (event.clientX - clientX);
      pageY = (event.clientY - clientY);

	  var obj = {
      	'pageX' : pageX,
      	'pageY' : pageY,
      	'speed' : velocity
	  }

	      // ======= Create dot-trail to follow the cursor =======
      dot = document.createElement('div');
      dot.className = "dot";
      dot.style.left = pageX + "px";
      dot.style.top = pageY + "px";
      domElement.appendChild(dot);
      drawArray.push(obj);

      // ======= Draw trail based on the array =======
      socket.emit('stepOne',drawArray,false);
    }

    // ======= CallBack to reset cursor trail =======
    socket.on('stepOneReset',()=>{
    	$(domElement).find('.dot').remove();
    });

})
