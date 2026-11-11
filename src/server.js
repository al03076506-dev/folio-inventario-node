const config = require('./config');
const connectDB = require('./db');
const createApp = require('./app');
config();
connectDB().then(() => createApp().listen(process.env.PORT || 3000, () => console.log('Servidor de inventario listo'))).catch(() => { console.error('No se pudo iniciar: revisa la configuración y MongoDB'); process.exit(1); });
