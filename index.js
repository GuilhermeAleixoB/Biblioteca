import express from 'express';
import routes from './src/routes/index.js'
import estrategiasAutenticacao from './src/controllers/estrategiasAutenticacao.js'
import 'dotenv/config.js'
import Middlewares from './src/routes/middlewares-autenticacao.js';

const app = express()
const port = 3000

routes(app)

app.listen(port, () => console.log(`servidor está rodando na porta ${port}`))


export default app