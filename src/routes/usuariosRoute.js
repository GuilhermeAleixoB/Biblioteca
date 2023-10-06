import { Router } from 'express'
import UsuarioController from '../controllers/UsuarioController.js'
import passport from "passport";
import Middlewares from './middlewares-autenticacao.js';

const router = Router()

router.post('/usuarios', UsuarioController.cadastrarUsuario)
router.post('/usuarios/login',Middlewares.local ,UsuarioController.loginUsuario)
router.put('/usuarios', Middlewares.bearer, UsuarioController.atualizarUsuario)
router.get('/usuarios/email=:email', UsuarioController.buscaUmUsuarioPorEmail)
router.get('/usuarios/id=:id', UsuarioController.buscaUmUsuarioPorID)
router.delete('/usuarios/id=:id', Middlewares.bearer, UsuarioController.apagarUsuario)

export default router