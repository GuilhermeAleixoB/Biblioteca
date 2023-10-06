import { Router } from 'express'
import LivroController from '../controllers/LivroController.js';
import passport from "passport";
import Middlewares from './middlewares-autenticacao.js';

const router = Router()

router.post('/livros', Middlewares.bearer, LivroController.criarLivro)
router.put('/livros', Middlewares.bearer, LivroController.atualizarLivro)
router.get('/livros', Middlewares.bearer, LivroController.buscarTodosOsLivros)
router.get('/movimentacoes', Middlewares.bearer, LivroController.buscarTodasAsMovimentacoesDosLivros)
router.get('/livros/id=:id', Middlewares.bearer, LivroController.buscarUmLivroID)
router.get('/livros/nome=:nome', Middlewares.bearer, LivroController.buscarUmLivroNome)
router.post('/livros/retirar', Middlewares.bearer, LivroController.retirarLivro)
router.post('/livros/entregar', Middlewares.bearer, LivroController.entregarLivro)
router.delete('/livros/id=:id', Middlewares.bearer, LivroController.apagarLivro)

export default router