//console.log(window.getComputedStyle(document.getElementById("wrapper"),null).getPropertyValue("width"));
//console.log(window.getComputedStyle(document.getElementsByClassName("container")[0],null).getPropertyValue("width"));

function addHandler(object, event, handler, useCapture) {
    if (object.addEventListener) {
        object.addEventListener(event, handler, useCapture ? useCapture : false);
    } else if (object.attachEvent) {
        object.attachEvent('on' + event, handler);
    } else alert("Add handler is not supported");
}

function init() {
  addHandler(window, 'DOMMouseScroll', wheel); //Gecko
  //addHandler(window, 'mousewheel', wheel); //Opera
  addHandler(document, 'mousewheel', wheel); //IE
  addHandler(document, 'keyup', keyboard);
  addHandler(document, 'touchstart', touchstart);
  addHandler(document, 'touchmove', touchmove);
  addHandler(document, 'touchend', touchend);


  var aList = document.getElementsByClassName("refresh");
    for ( var i = 0; i < aList.length; i++) {
      addHandler(aList[i], 'click', aOnClick);
    }

  var a2List = document.getElementsByClassName("save");
    for ( var i = 0; i < aList.length; i++) {
      addHandler(a2List[i], 'click', sOnClick);
    }

  var a3List = document.getElementsByClassName("load");
    for ( var i = 0; i < aList.length; i++) {
      a3List[i].href="savenload.php?action=load&station=" + a3List[i].id.replace("Load","");
    }

  request('all');
}

function request(data) {
  spinner_on(data);
  xmlhttp.open("GET","ice.php?station="+data,true);
  xmlhttp.send();
}

function save(data) {
  var song = document.getElementById(data+"songName").innerHTML;
  xmlhttp.open("GET","savenload.php?action=save&station="+data+"&song="+song,true);
  xmlhttp.send();
}

function refresh(data) {
  for(var key in data) {
    document.getElementById(key+"songName").innerHTML=data[key];
    document.getElementById(key+"Search").href="https://www.google.ru/search?q="+data[key];
    spinner_off(key);
  }
  
}

function spinner_on(data) {
  if (data=='all') {
    var elementList1 = document.getElementsByClassName("songName");
    for ( var i = 0; i < elementList1.length; i++) {
      elementList1[i].style.display="none";
    }
    var elementList2 = document.getElementsByClassName("spinner");
    for ( var i = 0; i < elementList2.length; i++) {
      elementList2[i].style.display="block";
    }
  }
  else {
    document.getElementById(data+"songName").style.display="none";
    document.getElementById(data+"spinner").style.display="block";
  }
}

function spinner_off(data) {
  document.getElementById(data+"spinner").style.display="none";
  document.getElementById(data+"songName").style.display="block";
}

//body
var xmlhttp;

if (window.XMLHttpRequest) {
  // code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
}
else {
  // code for IE6, IE5
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
        if (data.status == "error") {
          toaster(data.error_msg);
        } else {
          toaster(data.status);
        }
        break;
      case "load":
        console.log(typeof data.stations.jazz);
        break;
      default:
        alert('Я таких значений не знаю');
    }
  }
}

//Handlers
function aOnClick(event) {
  request(this.id.replace("Refresh",""));
}

function sOnClick(event) {
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
    if (window.opera)
      delta = -delta;
    }
    else if (event.detail) {
      delta = -event.detail / 3;
    }
    if (event.preventDefault)  event.preventDefault();
    event.returnValue = false;
    if (delta == 1) {
      moveLeft();
    } else if (delta == -1) {
      moveRight();
    }
}

function moveRight()
{
  var left =  parseInt(window.getComputedStyle(document.getElementById('wrapper')).left);
  if (left > -1600) {
    left = left - 320;
    document.getElementById('wrapper').style.left = left + "px";
  }
}
function moveLeft()
{
  var left =  parseInt(window.getComputedStyle(document.getElementById('wrapper')).left);
  if (left < 0) {
    left = left + 320;
    document.getElementById('wrapper').style.left = left + "px";
  }
}

function toaster(msg) {
  var toaster_container = document.createElement('div');
  toaster_container.setAttribute('class', 'toaster_container');
  toaster_container.setAttribute('id', 'toaster');
  var toaster = document.createElement('span');
  toaster.setAttribute('class', 'toaster');
  toaster.innerHTML = msg;
  toaster.className += " toaster-fadein";
  toaster_container.appendChild(toaster);
  document.body.appendChild(toaster_container);

  
  setTimeout(function(){toaster.className = toaster.className.replace("toaster-fadein", "toaster-fadeout" );}, 2000);
  setTimeout(function(){document.body.removeChild(toaster_container);}, 4000);
}

function touchstart(event) {
  //console.log("START");
  if (typeof(e_x) != "undefined") {
    s_x = event.touches[0].pageX;
    //s_y = event.touches[0].pageY;
    //s_x = Math.floor(s_x*100)/100;
    //s_y = Math.floor(s_y*100)/100;
  }
}
function touchmove(event) {
  //console.log("MOVE");
  e_x = event.touches[0].pageX;
  //e_y = event.touches[0].pageY;
  //e_x = Math.floor(e_x*100)/100;
  //e_y = Math.floor(e_y*100)/100;
}
function touchend(event) {
  if (typeof(s_x) != "undefined") {
    //console.log("END");
    //console.log("START: x=" + s_x + " y=" + s_y);
    //console.log("END: x=" + e_x + " y=" + e_y);
    diff_x = s_x - e_x;
    //toaster("X DIFF=" + diff_x);
    if (diff_x < -100) {/*console.log("X DIFF=" + diff_x + "Left");*/moveLeft();}
    if (diff_x > 100)  {/*console.log("X DIFF=" + diff_x + "Right")*/;moveRight();}
    delete s_x;
    delete e_x;
  }
}
