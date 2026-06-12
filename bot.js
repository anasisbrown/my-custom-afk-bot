const mineflayer = require('mineflayer');
const fs = require('fs');

let config;
try {
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch (err) {
    console.error("❌ Cannot read config.json:", err.message);
    process.exit(1);
}

function startCustomBot() {
    const host = config.serverHost.trim();
    const port = parseInt(config.serverPort);

    console.log(`🤖 [STARTING] Connecting to ${host}:${port}...`);

    const bot = mineflayer.createBot({
        host: host,
        port: port,
        username: config.botUsername,
        version: false, 
        connectTimeout: 30000 
    });

    bot.once('spawn', () => {
        console.log(`✅ [CONNECTED] ${bot.username} is inside the server!`);
        console.log(`🎮 [VERSION] Server is running: ${bot.version}`);

        // Jump every 20 seconds
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 400);
            }
        }, 20000);

        // Walk back and forth every 45 seconds
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('forward', true);
                setTimeout(() => {
                    bot.setControlState('forward', false);
                    bot.setControlState('back', true);
                    setTimeout(() => bot.setControlState('back', false), 1200);
                }, 1200);
            }
        }, 45000);
    });

    bot.on('error', (err) => {
        if (err.code === 'ECONNRESET' || err.errno === -104) {
            console.warn('⚠️ [RESET] Connection dropped by Aternos firewall. Retrying...');
        } else {
            console.error('❌ [ERROR]:', err.message);
        }
    });

    bot.on('end', (reason) => {
        console.log(`🔌 [DISCONNECTED] Reason: ${reason}`);
        console.log('🔄 Reconnecting in 15 seconds...');
        setTimeout(startCustomBot, 15000);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[💬 CHAT] ${username}: ${message}`);
    });
}

startCustomBot();
