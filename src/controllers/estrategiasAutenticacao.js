import passport from "passport";
import LocalStrategy from "passport-local";
import db from "../../db.js"
import Erros from "../../erros.js";
import bcrypt from "bcrypt";
import BearerStrategy from "passport-http-bearer";
import jwt from "jsonwebtoken";

async function buscaUmUsuarioPorEmail (email){
        try {
            const usuario = await db.query('SELECT usu_in_id, usu_st_nome, usu_st_senha FROM biblioteca.biblioteca_usuario where usu_st_email = $1', [email])
            return usuario.rows[0]
        } catch (error) {
            return null
        }
    }
async function buscaUmUsuarioPorId (id){
        try {
            const usuario = await db.query('SELECT usu_st_email, usu_st_nome, usu_st_senha FROM biblioteca.biblioteca_usuario where usu_in_id = $1', [id])
            return usuario.rows[0]
        } catch (error) {
            return null
        }
    }

function verificaUsuario (usuario){
    if (!usuario) {
        throw new Erros.InvalidArgumentError('Não existe usuário com esse e-mail')
    }
}

async function verificaSenha (senha, senhaHash) {
    const senhaValida = await bcrypt.compare(senha, senhaHash);
    if (!senhaValida) {
        throw new Erros.InvalidArgumentError('E-mail ou senha inválidos')
    }
}

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha',
        session: false
    }, async (email, senha, done) => {
        try {
        const usuario = await buscaUmUsuarioPorEmail(email)
        verificaUsuario(usuario);
        await verificaSenha(senha, usuario.usu_st_senha)

        done(null, usuario)
        } catch (erro) {
            done(erro);
        }

    })
)

passport.use(
    new BearerStrategy(
        async (token, done) => {
            try {
            const payload = jwt.verify(token, process.env.CHAVE_JWT);
            const usuario = await buscaUmUsuarioPorId(payload.id)
            done(null, usuario)
            } catch (erro) {
                done (erro)
            }
        }
    )

)

export default passport