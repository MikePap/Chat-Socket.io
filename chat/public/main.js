!function chat(){ 

	const TYPING_TIMER_LENGTH = 300; // ms (erano 400)
	const usernameInput = document.querySelector('.usernameInput');
	const messages = document.querySelector('.messages');
	const inputMessage = document.querySelector('.inputMessage');
	const loginPage = document.querySelector('.login.page');
	const chatPage = document.querySelector('.chat.page');
	
	var username;
	var connected = false;
	var typing = false;
	var lastTypingTime;
	var color;
	
	usernameInput.focus();
	const socket = io();

	
//	Rimpiazza alcuni caratteri speciali, che potrebbero essere oggetto di iniezione di codice dannoso 	
	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
			.replace(/\//g, "&#x2F;")  
	} 

	
	function setUsername () {
		username = usernameInput.value;
		username = escapeHtml(username);	
		if (username) {
			loginPage.style['display'] = "none";
			chatPage.style['display'] = "block";
			inputMessage.focus();
			color = getUsernameColor();											
			socket.emit('add user', {username: username, color:color });		
		}
	}
	
	function addParticipantsMessage (data) {
		var message = '';
		if (data.numUsers === 1) {
			message += "C'è un utente connesso: " +data.userNames;
		} else {
			message += "Ora ci sono " + data.numUsers + " utenti connessi: " +data.userNames;
		}
		log(message);
	}

	function sendMessage () {
		var message = inputMessage.value;
		message = escapeHtml(message);
		if (message && connected) {
			inputMessage.value = '';
			addChatMessage({
				username: username,
				message: message,
				color:color		
			});
			socket.emit('new message', message);
		}
	}
		

	function log (message, options) {
		var el = document.createElement('li');
		el.className = 'log';
		el.innerHTML = message;
		addMessageElement(el, options);
	}
	
		
	function addChatMessage (data, options) {
		options = options || {};
		var usernameDiv = document.createElement('span');
		usernameDiv.className = 'username';
		usernameDiv.innerHTML = data.username+ ":";				
		if(data.color)	
			usernameDiv.style['color'] = data.color;				
	
		var messageBodyDiv = document.createElement('span');
		messageBodyDiv.className = 'messageBody';
		messageBodyDiv.innerHTML = data.message;
		
		var typingClass = data.typing ? 'typing' : '';
	
		var messageDiv = document.createElement('li');
		messageDiv.className = 'message ' +typingClass;
		messageDiv.setAttribute('username', data.username);			 
		messageDiv.appendChild(usernameDiv);
		messageDiv.appendChild(messageBodyDiv);
		
		addMessageElement(messageDiv, options);
	}
	
	
	function addChatTyping (data) {
		data.typing = true;
		data.message = 'is typing';
		addChatMessage(data);
	}
	
	
	function removeChatTyping () {
		var elem = getTypingMessages(messages);
		var classe = elem.className;
		if(classe === 'message typing') 
			elem.parentNode.removeChild(elem);	 
	}
	
	
	function addMessageElement (el, options) {
		if (!options) {
			options = {};
		}
		if (typeof options.prepend === 'undefined') {
			options.prepend = false;					
		}
		
		if (options.prepend) {
			messages.insertBefore(el, messages.lastChild);
		} else {
			messages.appendChild(el);		
		}
		messages.scrollTop = messages.scrollHeight; 
	}
	
	
	function updateTyping () {
		if (connected) {
			if (!typing) {
				typing = true;
				socket.emit('typing');
			}
			lastTypingTime = (new Date()).getTime();
	
			setTimeout(function () {
				var typingTimer = (new Date()).getTime();
				var timeDiff = typingTimer - lastTypingTime;
				if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
					socket.emit('stop typing');
					typing = false;
				}
			}, TYPING_TIMER_LENGTH);
		}
	}
	
	
	function getTypingMessages(nodo){
		var nodeLI;			
		for(nodo=nodo.firstElementChild; nodo !=null; nodo= nodo.nextElementSibling){
			var attr = nodo.getAttribute('username');
			if(nodo.nodeName === 'LI' && attr) 
				nodeLI = nodo;
			getTypingMessages(nodo);
		}
		return nodeLI;
	}
	
//	Restituisce una dichiarazione CSS casuale per l'impostazione di un colore ( es: "rgb(100,200,150)" )	
	function getUsernameColor(){
		var colore;
		var nmCasuale = function (){
			var j = Math.floor( Math.random() * 255);
			return j;
		}
		colore = "rgb("+nmCasuale()+"," +nmCasuale()+ "," +nmCasuale()+")";
		return colore;
	}

	
//	Eventi tastiera (Keyboard events)

	window.addEventListener("keydown", function (event)	{
		if (!(event.ctrlKey || event.metaKey || event.altKey)) {
			usernameInput.focus();		
		}
		
		if (event.keyCode === 13) {						// 13 corrisponde al tasto "Invio""
			if (username) {
				sendMessage();
				socket.emit('stop typing');
				typing = false;
			} else {
				setUsername();
			}
		}
	});
	
//	L'evento "input" scatta quando si inizia a digitare  nel campo input	
	inputMessage.addEventListener("input", function(){		 
		updateTyping();
	},false);
	
	
//	Focus input when clicking on the message input's border
	inputMessage.addEventListener('click', function (){
		inputMessage.focus();
	})
	
	
/////	Socket events
	
	socket.on('login', function (data) {
		connected = true;
		color = data.color;						
		var message = "Benvenuto nella chat ";					
		log(message, {
			prepend: true
		});

		addParticipantsMessage(data);
	});
	
	
	socket.on('new message', function (data) {
		addChatMessage(data);
	});
	
	
	socket.on('user joined', function (data) {
		log(data.username + ' si è unito');
		addParticipantsMessage(data);
	});
	
	
	socket.on('user left', function (data) {
		log(data.username + ' ha lasciato la chat');
		addParticipantsMessage(data);
	//	removeChatTyping();														// Non serve
	});
	
	
	socket.on('typing', function (data) {
		addChatTyping(data);
	});
	
	
	socket.on('stop typing', function () {		
		removeChatTyping();		
	});

}();

