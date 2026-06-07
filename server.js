const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'vault_storage');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.use(express.static('public'));

// --- NETWORK INFO ---
function getNetworkInfo() {
    const ifaces = os.networkInterfaces();
    const addrs = [];
    Object.keys(ifaces).forEach(name => {
        ifaces[name].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                addrs.push({ name, address: iface.address, mac: iface.mac });
            }
        });
    });
    return { hostname: os.hostname(), port: PORT, interfaces: addrs };
}

app.get('/api/info', (req, res) => {
    res.json(getNetworkInfo());
});

// --- SUPREME FEATURE: SYSTEM TELEMETRY ---
setInterval(() => {
    io.emit('sys-telemetry', {
        cpu: (os.loadavg()[0]).toFixed(2),
        mem: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2),
        uptime: (os.uptime() / 3600).toFixed(2),
        platform: os.platform().toUpperCase()
    });
}, 2000);

// --- SUPREME FEATURE: FILE SHREDDING ---
app.post('/shred/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        fs.writeFileSync(filePath, Buffer.alloc(size, 0)); // Overwrite with null bytes
        fs.unlinkSync(filePath);
        io.emit('vault-update');
        res.status(200).send("File Shredded.");
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).send("Secured.");
    io.emit('vault-update');
});

// --- SHRED ALL FILES ---
app.post('/shred-all', (req, res) => {
    const files = fs.readdirSync(UPLOAD_DIR);
    files.forEach(f => {
        const fp = path.join(UPLOAD_DIR, f);
        const size = fs.statSync(fp).size;
        fs.writeFileSync(fp, Buffer.alloc(size, 0));
        fs.unlinkSync(fp);
    });
    io.emit('vault-update');
    res.status(200).send("All files shredded.");
});

app.get('/download/:filename', (req, res) => {
    res.download(path.join(UPLOAD_DIR, req.params.filename));
});

// --- INLINE FILE VIEWING (images/videos) ---
app.get('/view/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).end();
    }
});

const ADJS = ['Swift','Neon','Cyber','Ghost','Shadow','Cobalt','Frost','Ember','Void','Pixel','Quantum','Phantom','Crimson','Storm','Blaze','Night','Silk','Echo','Iris','Lunar','Nova','Hex','Dot','Flux'];
const NOUNS = ['Falcon','Panda','Wolf','Raven','Fox','Tiger','Phoenix','Viper','Lynx','Hawk','Dragon','Panther','Saber','Knight','Shade','Oracle','Warden','Sentinel','Haven','Vertex','Zenith','Eagle','Coyote'];

const devices = new Map();

function randomNickname() {
    const a = ADJS[Math.floor(Math.random() * ADJS.length)];
    const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return a + ' ' + n;
}

function broadcastDevices() {
    const list = [];
    devices.forEach(d => list.push({ id: d.id, nickname: d.nickname, type: d.type, ip: d.ip }));
    io.emit('device-list', list);
}

io.on('connection', (socket) => {
    const sendFiles = () => socket.emit('vault-contents', fs.readdirSync(UPLOAD_DIR));
    socket.on('get-files', sendFiles);
    socket.on('vault-update', sendFiles);
    sendFiles();

    socket.on('device-info', (info) => {
        const ip = socket.handshake.address.replace(/^::ffff:/, '');
        const nickname = randomNickname();
        devices.set(socket.id, { id: socket.id, nickname, type: info.type || 'desktop', ip });
        socket.emit('your-nickname', nickname);
        broadcastDevices();
    });

    socket.on('disconnect', () => {
        devices.delete(socket.id);
        broadcastDevices();
    });
});

server.listen(PORT, () => console.log("WAYNE_CORE // SYSTEM_READY"));