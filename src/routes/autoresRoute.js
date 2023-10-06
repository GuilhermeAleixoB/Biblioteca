import { Router } from 'express'
import AutorController from '../controllers/AutorController.js'
import passport from "passport";
import Middlewares from './middlewares-autenticacao.js';

const router = Router()

router.post('/autores', Middlewares.bearer, AutorController.criaAutor)
router.put('/autores', Middlewares.bearer, AutorController.atualizarAutor)
router.get('/autores', Middlewares.bearer, AutorController.buscaTodosOsAutores)
router.get('/autores/id=:id', Middlewares.bearer, AutorController.buscaUmAutorID)
router.get('/autores/nome=:nome,nasc=:nasc', Middlewares.bearer, AutorController.buscaUmAutorNomeNasc)
router.delete('/autores/id=:id', Middlewares.bearer, AutorController.apagaAutor)

export default router