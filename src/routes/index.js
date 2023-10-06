import bodyParser from 'body-parser'

import autores from './autoresRoute.js'
import livros from './livrosRoute.js'
import usuarios from './usuariosRoute.js'

export default app => {
 app.use(
   bodyParser.json(),
   autores,
   livros,
   usuarios
   )
 }