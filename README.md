
# Socket.IO Chat

Una semplice chat con l'uso di socket.io

## Come si usa la chat

Installare i pacchetti socket.io ed Express. 
Nel file package.json risulta soltanto il pacchetto socket.io fra le dipendenze, quindi basta dare "npm install" per installarlo.
Per Express se non l'avete già installato potete dare:

```
npm install express --save

```
Poi richiamate il server con nodejs, dopo che vi siete spostati nella directory "chat" :

```
cd chat/
node index.js

```

Aprite il vostro browser sulla porta 3000: "http://localhost:3000". Eventualmente potete cambiare l'indirizzo di porta dalla variabile "port" in "index.js".

Ogni finestra (o scheda) aperta del browser rappresenta una sessione in cui viene chiesto di inserire il proprio nome che vi rappresenterà all'interno della chat e poi ... buon divertimento.

