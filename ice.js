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

  var aList = document.getElementsByClassName("refresh");
    for ( var i = 0; i < aList.length; i++) {
      addHandler(aList[i], 'click', aOnClick);
    }

  var a2List = document.getElementsByClassName("save");
    for ( var i = 0; i < aList.length; i++) {
      addHandler(a2List[i], 'click', sOnClick);
    }

  request('all');
  load('all');

}

function request(data) {
  spinner_on(data);
  xmlhttp.open("GET","ice.php?station="+data,false);
  xmlhttp.send();
}

function save(data) {
  var song = document.getElementById(data+"songName").innerHTML;
  xmlhttp.open("GET","savenload.php?action=save&station="+data+"&song="+song,false);
  xmlhttp.send();
}

function load(data) {
  xmlhttp.open("GET","savenload.php?action=load&station="+data,false);
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
var busy = true;

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
    console.log(xmlhttp.responseText);
    var data = eval("(" + xmlhttp.responseText + ")");
    switch (data.action) {
      case "refresh":
        refresh(data.response);
        break;
      case "save":
        if (data.status == "error") {
          alert(data.error_msg);
        } else {
          alert(data.status);
          load(data.station);
        }
        break;
      case "load":
        console.log(typeof data.stations.jazz);
        break;
      default:
        alert('Я таких значений не знаю');
    }

/*
    if (data.hasOwnProperty('save')) {
      if (data.save.status == "error") {
        alert(data.save.error_msg);
      } else {
        alert(data.save.status);
        load(data.save.station);
      }
    } else if (data.hasOwnProperty('load')) {
      console.log(data.songs);
    } else {
      refresh(data);
    }
*/
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
