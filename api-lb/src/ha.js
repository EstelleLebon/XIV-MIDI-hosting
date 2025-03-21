import net from 'net';

class TCPSession {
    constructor(url) {
        this.url = url;
        this.state = false;
        this.client = null;
        this.delay = false;
    }

    async connect(delai = 0) {
        await new Promise(resolve => setTimeout(resolve, delai));
        
        const [host, port] = this.url.replace('http://', '').split(':');
        this.client = new net.Socket();

        this.client.connect(port, host, () => {
            this.state = true;
            console.log(`Connected to TCP server at ${this.url}`);

            // Configurer le socket pour utiliser les fonctionnalités de keep-alive et no-delay
            this.client.setKeepAlive(true, 10000); // Activer le keep-alive avec un délai initial de 10 secondes
            this.client.setNoDelay(true); // Désactiver l'algorithme de Nagle pour réduire la latence
        });

        this.client.on('error', () => {
            console.log(`Connection error at ${this.url}`);
            this.state = false;
            if (this.client) {
                this.client.destroy();
            }
            if (!this.delay) {
                this.delay = true;
                this.reconnect(5000);
            }
        });

        this.client.on('close', () => {
            console.log(`Connection closed at ${this.url}`);
            this.state = false;
            if (this.client) {
                this.client.destroy();
            }
            if (!this.delay) {
                this.delay = true;
                this.reconnect(2000);
            }
        });

        this.client.on('timeout', () => {
            console.log(`Connection timeout at ${this.url}`);
            this.state = false;
            if (this.client) {
                this.client.destroy();
            }
            if (!this.delay) {
                this.delay = true;
                this.reconnect(0);
            }
        });

        // add timeout to client
        this.client.setTimeout(60000);
    }

    reconnect(time) {
        setTimeout(() => {
            this.connect();
            this.delay = false;
        }, time);
    }

    getState() {
        return this.state;
    }
}

export default TCPSession;

/* 
// Exemple d'utilisation
const session = new TCPSession('http://dev-midilibrary-api-1:5555');
session.connect();
setInterval(() => {
    if (session.getState()) {
        session.keepAlive();
    }
}, 10000); 
// Envoie un message KEEP_ALIVE toutes les 10 secondes
*/