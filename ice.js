/* Body */
var xmlhttp;
var xDown,yDown,xUp,yUp = null;

if (window.XMLHttpRequest) {
  /* code for IE7+, Firefox, Chrome, Opera, Safari */
  xmlhttp=new XMLHttpRequest();
}
else {
  /* code for IE6, IE5 */
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4 && xmlhttp.status==200) {
    //console.log(xmlhttp.responseText);
    var data = eval("(" + xmlhttp.responseText + ")");
    switch (data.action) {
      case "refresh":
        refresh(data.response);
        break;
      case "save":
          var msg = (data.status == "ok" ? "Saved" : (data.status == "error" ? data.error_msg : "???"))
          toaster(msg);
        break;
      case "load":
        console.log(typeof data.stations.jazz);
        break;
      default:
        alert('Я таких значений не знаю');
    }
  }
}
/* Init */
function init() {
  addHandler(window, 'DOMMouseScroll', wheel); /* Gecko */
  //addHandler(window, 'mousewheel', wheel); /* Opera */
  addHandler(document, 'mousewheel', wheel); /* IE */
  addHandler(document, 'keyup', keyboard);
  addHandler(document, 'touchstart', touchStart);
  addHandler(document, 'touchmove', touchMove);
  addHandler(document, 'touchend', touchEnd);

  var aList = document.getElementsByClassName("refresh");
  for ( var i = 0; i < aList.length; i++) {addHandler(aList[i], 'click', aOnClick);}

  var a2List = document.getElementsByClassName("save");
  for ( var i = 0; i < aList.length; i++) {addHandler(a2List[i], 'click', sOnClick);}

  var a3List = document.getElementsByClassName("load");
  for ( var i = 0; i < aList.length; i++) {a3List[i].href="savenload.php?action=load&station=" + a3List[i].id.replace("Load","");}

  addHandler(document.getElementById("hint"), 'click', function(event){toaster("test")});

  request('all');
}

function addHandler(object, event, handler, useCapture) {
    if (object.addEventListener) {
        object.addEventListener(event, handler, useCapture ? useCapture : false);
    } else if (object.attachEvent) {
        object.attachEvent('on' + event, handler);
    } else alert("Add handler is not supported");
}

/* Handlers */
function aOnClick(event) {
event.preventDefault();
event.stopPropagation();
event.stopImmediatePropagation();
  console.log("click")
  request(this.id.replace("Refresh",""));
}

function sOnClick(event) {
  console.log("click")
  save(this.id.replace("Save",""));
}

function keyboard(event) {
  if (event.keyCode == 115) {
    request('all');
  }
}

function wheel(event) {
  var delta;
  event = event || window.event;
  if (event.wheelDelta) {
    delta = event.wheelDelta / 120;
    if (window.opera) delta = -delta;
  } else if (event.detail) {
    delta = -event.detail / 3;
  }
  if (event.preventDefault)  event.preventDefault();
  event.returnValue = false;
  if (delta == 1) {moveLeft();} else if (delta == -1) {moveRight();}
}

function touchStart(evt) {
console.log("start")
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
}

function touchMove(evt) {
console.log("move")
  if ( ! xDown || ! yDown ) {return;}
  xUp = evt.touches[0].clientX;
  yUp = evt.touches[0].clientY;
}

function touchEnd(evt) {
  if ( ! xUp || ! yUp ) {return;}
console.log("end")
  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
console.log("xDiff " + xDiff)
console.log("yDiff " + yDiff)
console.log("abs xDiff " + Math.abs( xDiff ))
console.log("abs yDiff " + Math.abs( yDiff ))
  if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
    if ( xDiff > 100 ) {
console.log("right\n")
      moveRight();
    } else if (xDiff < -100) {
console.log("left\n")
      moveLeft();
    }
  } else {
    if ( yDiff > 100 ) {
      console.log("up\n")
      request('all');
    } else if (yDiff < -100) {
    /* down swipe */
console.log("down\n")
    }
  }
  xDown = null;
  yDown = null;
  xUp = null;
  yUp = null;
}

function request(data) {
  console.log(data)
  if (data == "all") {var msg = "Updating all stations...";} else {var msg = "Updating...";}
  toaster (msg);
  spinner_on(data);
  xmlhttp.open("GET","ice.php?station="+data,true);
  xmlhttp.send();
}

function save(data) {
  toaster ("Saving...");
  var song = document.getElementById(data+"songName").innerHTML;
  xmlhttp.open("GET","savenload.php?action=save&station="+data+"&song="+song,true);
  xmlhttp.send();
}

function refresh(data) {
  for (var key in data) {
    document.getElementById(key+"songName").innerHTML=data[key];
    document.getElementById(key+"Search").href="https://www.google.ru/search?q="+data[key];
    spinner_off(key);
  }
}

function spinner_on(data) {
  if (data=='all') {
    var elementList1 = document.getElementsByClassName("songName");
    for ( var i = 0; i < elementList1.length; i++) {elementList1[i].style.display="none";}
    var elementList2 = document.getElementsByClassName("spinner");
    for ( var i = 0; i < elementList2.length; i++) {elementList2[i].style.display="block";}
  } else {
    document.getElementById(data+"songName").style.display="none";
    document.getElementById(data+"spinner").style.display="block";
  }
}

function spinner_off(data) {
  document.getElementById(data+"spinner").style.display="none";
  document.getElementById(data+"songName").style.display="block";
}

function moveRight() {
  var size = parseFloat(getComputedStyle(document.getElementById('wrapper'), '').fontSize) * 20;
  var left = parseInt(window.getComputedStyle(document.getElementById('wrapper')).left);
  if (left > -size*5) {
    left = left - size;
    document.getElementById('wrapper').style.left = left + "px";
  } else {toaster ("No more stations");}
}
function moveLeft() {
  var size = parseFloat(getComputedStyle(document.getElementById('wrapper'), '').fontSize) * 20;
  var left = parseInt(window.getComputedStyle(document.getElementById('wrapper')).left);
  if (left < 0) {
    left = left + size;
    document.getElementById('wrapper').style.left = left + "px";
  } else {toaster ("It's a first station");}
}

function toaster(msg) {
  var toaster_container = document.createElement('div');
  var toaster = document.createElement('span');
  toaster_container.setAttribute('class', 'toaster_container');
  toaster_container.setAttribute('id', 'toaster');
  toaster.setAttribute('class', 'toaster');
  toaster.innerHTML = msg;
  toaster.className += " toaster-fadein";
  toaster_container.appendChild(toaster);
  document.body.appendChild(toaster_container);
  
  setTimeout(function(){toaster.className = toaster.className.replace("toaster-fadein", "toaster-fadeout" );}, 2000);
  setTimeout(function(){document.body.removeChild(toaster_container);}, 4000);
}
