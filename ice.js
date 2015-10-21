/* Body */
var name;
var xmlhttp;
var xDown,yDown,xUp,yUp = null;

var strings = {
  'SAVED':          'Сохранено',
  'SAVING':         'Сохранение...',
  'DELETED':        'Удалено',
  'DELETING':       'Удаление...',
  'TEST':           'Тест',
  'UPD_ALL':        'Обновление всех радиостанций...',
  'UPD':            'Обновление...',
  'PLS_REG':        'Пожалуйста, зарегистрируйтесь.',
  'OK_REG':         'Регистрация прошла успешно.',
  'USR_NAME_EMPTY': 'Имя пользователя не заполнено.',
  'ALREADY_REG':    'Вы уже зарегистрированы.',
  'REG':            'Регистрация',
  'CANCEL':         'Отмена',
  'EMPTY':          'Нет сохраненных композиций.',
  'SEARCH':         'Поиск',
  'REMOVE':         'Удалить',
  'CLOSE':          'Закрыть'
};

if (window.XMLHttpRequest) {
  /* code for IE7+, Firefox, Chrome, Opera, Safari */
  xmlhttp = new XMLHttpRequest();
}
else {
  /* code for IE6, IE5 */
  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}
xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4 && xmlhttp.status==200) {
    var data = eval("(" + xmlhttp.responseText + ")");
    switch (data.action) {
      case "refresh":
        refresh(data.response);
        break;
      case "save":
          var msg = (data.status == "ok" ? strings.SAVED : (data.status == "error" ? data.error_msg : "???"))
          toaster(msg);
        break;
      case "delete":
          var msg = (data.status == "ok" ? strings.DELETED : (data.status == "error" ? data.error_msg : "???"))
          toaster(msg);
          if (data.status == "ok") remove_li (data.id)
        break;
      case "load":
        display(data.songs);
        break;
      case "list":
        createPage(data.stations);
        break;
      default:
        console.log('Действие указано не верно');
    }
  }
}
/* Init */
function init() {
  getStations();
/* 
  username = getCookie("username");
  if(username) {
    document.getElementById("user-name").innerHTML = username;
  }
  addHandler(window, 'DOMMouseScroll', wheel); /* Gecko */
  //addHandler(window, 'mousewheel', wheel); /* Opera */
 /* addHandler(document, 'mousewheel', wheel); /* IE */
/*  addHandler(document, 'keyup', keyboard);
  addHandler(document, 'touchstart', touchStart);
  addHandler(document, 'touchmove', touchMove);
  addHandler(document, 'touchend', touchEnd);

  var aList = document.getElementsByClassName("refresh");
  for ( var i = 0; i < aList.length; i++) {addHandler(aList[i], 'click', aOnClick);}

  var a2List = document.getElementsByClassName("save");
  for ( var i = 0; i < aList.length; i++) {addHandler(a2List[i], 'click', sOnClick);}

  var a3List = document.getElementsByClassName("load");
  for ( var i = 0; i < aList.length; i++) {addHandler(a3List[i], 'click', lOnClick);}

  addHandler(document.getElementById("hint"), 'click', function(event){toaster(strings.TEST)});

  request('all');
}

function addHandler(object, event, handler, useCapture) {
    if (object.addEventListener) {
        object.addEventListener(event, handler, useCapture ? useCapture : false);
    } else if (object.attachEvent) {
        object.attachEvent('on' + event, handler);
    } else console.log("Add handler is not supported");
*/
}

/* Handlers */
function aOnClick(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  request(this.id.replace("Refresh",""));
}

function sOnClick(event) {
  save(this.id.replace("Save",""));
}

function lOnClick(event) {
  load(this.id.replace("Load",""));
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
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
}

function touchMove(evt) {
  if ( ! xDown || ! yDown ) {return;}
  xUp = evt.touches[0].clientX;
  yUp = evt.touches[0].clientY;
}

function touchEnd(evt) {
  if ( ! xUp || ! yUp ) {return;}
  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
    if ( xDiff > 100 ) {
      moveRight();
    } else if (xDiff < -100) {
      moveLeft();
    }
  } else {
    if ( yDiff > 100 ) {
      request('all');
    } else if (yDiff < -100) {
    /* down swipe */
    }
  }
  xDown = null;
  yDown = null;
  xUp = null;
  yUp = null;
}

function getStations(data) {
  xmlhttp.open("GET","/icecast/ice.php?action=list",false);
  xmlhttp.send();
}

function request(data) {
  if (data == "all") {var msg = strings.UPD_ALL;} else {var msg = strings.UPD;}
  toaster (msg);
  spinner_on(data);
  xmlhttp.open("GET","/icecast/ice.php?action=request&station="+data,true);
  xmlhttp.send();
}

function save(data) {
  if(username) {
  toaster (strings.SAVING);
  var song = document.getElementById(data+"songName").innerHTML;
  xmlhttp.open("GET","/icecast/ice.php?user=" + username + "&action=save&station="+data+"&song=" + song,true);
  xmlhttp.send();
  } else {
     toaster (strings.PLS_REG);
  }
}

function refresh(data) {
  for (var key in data) {
    document.getElementById(key+"songName").innerHTML = data[key];
    document.getElementById(key+"Search").href = "https://www.google.ru/search?q=" + data[key];
    spinner_off(key);
  }
}

function display(data) {
  var song_list_container = document.createElement('div');
  song_list_container.setAttribute('id', 'songs-list');

  var song_list_close = document.createElement('a');
  song_list_close.setAttribute('id', 'close');
  song_list_close.setAttribute("href","#");
  song_list_close.setAttribute("title",strings.CLOSE);
  addHandler(song_list_close, 'click', list_close);

  song_list_container.appendChild(song_list_close);


  if (data.length > 0 ){
    var song_list = document.createElement('ul');
    song_list_container.appendChild(song_list);
    for (i = 0; i < data.length; ++i) {
      var song_list_song = document.createElement('li');
      var song_list_search = document.createElement('a');
      var song_list_remove = document.createElement('a');
      var song_list_name = document.createElement('span');

      song_list_song.setAttribute("id","line" + data[i].id);
      song_list_search.setAttribute("target","_blank");
      song_list_search.setAttribute("class","search");
      song_list_search.setAttribute("title",strings.SEARCH);
      song_list_remove.setAttribute("id",data[i].id);
      song_list_remove.setAttribute("href","#");
      song_list_remove.setAttribute("class","remove");
      song_list_remove.setAttribute("title",strings.REMOVE);

      song_list_song.appendChild(song_list_search);
      song_list_song.appendChild(song_list_remove);
      song_list_song.appendChild(song_list_name);

      song_list_search.href="https://www.google.ru/search?q="+data[i].song;
      addHandler(song_list_remove, 'click', remove);
      song_list_name.innerHTML=data[i].song;

      song_list.appendChild(song_list_song);
    }

  } else {
    var song_list_empty = document.createElement('p');
    song_list_empty.innerHTML=strings.EMPTY;
    song_list_container.appendChild(song_list_empty);
  }
    document.body.appendChild(song_list_container);
}

function remove() {
  if(username) {
  toaster (strings.DELETING);
  xmlhttp.open("GET","/icecast/ice.php?user=" + username + "&action=delete&song=" + this.id,true);
  xmlhttp.send();
  } else {
     toaster (strings.PLS_REG);
  }
}

function remove_li(id) {
  var song_list_container = document.getElementById("songs-list");
  var song_list = song_list_container.getElementsByTagName("ul")[0];
  var song_list_song = document.getElementById("line" + id);

  song_list_song.parentNode.removeChild(song_list_song);

  if (song_list.getElementsByTagName('li').length < 1) {
    song_list_container.removeChild(song_list);

    var song_list_empty = document.createElement('p');
    song_list_empty.innerHTML=strings.EMPTY;

    song_list_container.appendChild(song_list_empty);
  }
}

function list_close() {
  document.body.removeChild(document.getElementById("songs-list"));
}

function load(data) {
  if(username) {
    xmlhttp.open("GET","/icecast/ice.php?user=" + username + "&action=load&station=" + data,true);
    xmlhttp.send();
  } else {
    toaster (strings.PLS_REG);
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
  }
}

function moveLeft() {
  var size = parseFloat(getComputedStyle(document.getElementById('wrapper'), '').fontSize) * 20;
  var left = parseInt(window.getComputedStyle(document.getElementById('wrapper')).left);
  if (left < 0) {
    left = left + size;
    document.getElementById('wrapper').style.left = left + "px";
  }
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

function user() {
  if(!username) {
    var reg_container = document.createElement('div');
    var inputs_container = document.createElement('div');
    var reg_name_input = document.createElement('input');
    var reg_submit = document.createElement('input');
    var reg_cancel = document.createElement('input');

    reg_container.setAttribute('id', 'reg_container');

    inputs_container.setAttribute('id', 'inputs_container');

    reg_name_input.setAttribute('id', 'reg_name_input');
    reg_name_input.setAttribute('type',"text");
    reg_name_input.setAttribute('name',"username");

    reg_submit.setAttribute('id', 'reg_submit');
    reg_submit.setAttribute('type',"button");
    reg_submit.setAttribute('value',strings.REG);

    reg_cancel.setAttribute('id', 'reg_cancel');
    reg_cancel.setAttribute('type',"button");
    reg_cancel.setAttribute('value',strings.CANCEL);

    addHandler(reg_cancel, 'click',   close);
    addHandler(reg_submit, 'click', register);
    addHandler(reg_name_input, 'keyup', function (event) {if (event.keyCode == "13") register();});

    inputs_container.appendChild(reg_name_input);
    inputs_container.appendChild(reg_submit);
    inputs_container.appendChild(reg_cancel);
    reg_container.appendChild(inputs_container);

    document.body.appendChild(reg_container);
    reg_name_input.focus();
  } else {
    toaster (strings.ALREADY_REG);
  }
}

function register() {
  username = document.getElementById('reg_name_input').value;
  if(username) {
    date = new Date();
    date.setMonth(date.getMonth() + 12);
    setCookie("username", username,{expires:date})
    toaster (strings.OK_REG);
    document.getElementById("user-name").innerHTML = username;
  } else {
    toaster (strings.USR_NAME_EMPTY);
  }
  close();
}

function close() {
  document.body.removeChild(document.getElementById('reg_container'));
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
  options = options || {};
  var expires = options.expires;
  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }
  value = encodeURIComponent(value);
  var updatedCookie = name + "=" + value;
  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

function createPage(data) {
  console.log(data);
}
