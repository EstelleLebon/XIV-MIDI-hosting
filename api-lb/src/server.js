import http from 'http';
import httpProxy from 'http-proxy';
import TCPSession from './ha.js';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis /env/.env
dotenv.config({ path: '/usr/src/app/env/.env' });

const apiList = Object.keys(process.env).filter(key => key.startsWith('POD')).map(key => process.env[key]);
console.log(apiList);
const apiSessions = apiList.map(url => new TCPSession(url));

apiSessions.forEach(async session => {
    await session.connect((apiSessions.indexOf(session) * 2000) + 500);
});

const proxy = httpProxy.createProxyServer();

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/status')) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("API LB is running");
        return;
    }
    
    const session = apiSessions.find(session => session.state);
    if (!session) {
        console.log("Service Unavailable");
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end("Service Unavailable");
        return;
    } else {
        try {
            console.log("Proxying request to", session.url);
            proxy.web(req, res, { target: session.url });
        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Internal Server Error");
        }
    }
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});