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

io.on('connection', (socket) => {
    const sendFiles = () => socket.emit('vault-contents', fs.readdirSync(UPLOAD_DIR));
    socket.on('get-files', sendFiles);
    socket.on('vault-update', sendFiles);
    sendFiles();
});

server.listen(PORT, () => console.log("WAYNE_CORE // SYSTEM_READY"));