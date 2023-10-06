import db from "../../db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

class UsuarioController{

    static async cadastrarUsuario (req, res){
        const corpo = req.body
        const usuario = corpo.usuario
       try {
            const verificaEmail = await db.query('select * from biblioteca.biblioteca_usuario where usu_st_email = $1', [usuario.usu_st_email])
            if (verificaEmail.rowCount == 0){
                const custoHash = 12;
                const senha = await bcrypt.hash(usuario.usu_st_senha, custoHash);
                await db.query('INSERT INTO biblioteca.biblioteca_usuario (usu_st_nome, usu_st_email, usu_st_senha) VALUES ($1, $2, $3)', [usuario.usu_st_nome, usuario.usu_st_email, senha], (error, results) => {
                    if (error) {
                        throw error;
                    }
                })
            return res.status(201).json()
            } else {
                return res.status(500).json('Já existe um usuário com esse email')
            }
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async atualizarUsuario (req, res){
        const corpo = req.body
        const usuario = corpo.usuario
        const existe = await db.query('SELECT * FROM biblioteca.biblioteca_usuario where usu_in_id = $1', [usuario.usu_in_id])
        if (existe.rowCount > 0){
            const verificaEmail = await db.query('select * from biblioteca.biblioteca_usuario where usu_st_email = $1 and usu_in_id != $2', [usuario.usu_st_email, usuario.usu_in_id])
            if (verificaEmail.rowCount == 0){
                try {
                    const custoHash = 12;
                    const senha = await bcrypt.hash(usuario.usu_st_senha, custoHash);
                    await db.query('update biblioteca.biblioteca_usuario set usu_st_nome = $1, usu_st_email = $2, usu_st_senha = $3 where usu_in_id = $4', [usuario.usu_st_nome, usuario.usu_st_email, senha, usuario.usu_in_id], (error, results) => {
                        if (error) {
                            throw error
                        }
                    })
                    res.status(201).send()
                } catch (error) {
                    return res.status(500).json(error.message)
                }
            } else {
                res.status(500).send(`Já existe um usuário com esse E-Mail`)
            }
        } else {
            res.status(500).send(`Esse usuário não existe`)
        }   
    }

    static async apagarUsuario(req, res) {
        const { id } = req.params
        try {
            await db.query('DELETE FROM biblioteca.biblioteca_usuario WHERE "usu_in_id" = $1', [id])
            return res.status(200).send()
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async buscaUmUsuarioPorEmail(req, res) {
        const { email } = req.params
        try {
            const usuario = await db.query('SELECT usu_in_id, usu_st_nome, usu_st_senha FROM biblioteca.biblioteca_usuario where usu_st_email = $1', [email])
            if (usuario.rowCount == 0){
                return res.status(500).send('Não existe usuário com esse E-Mail')
            } else {
            return res.status(200).json(usuario.rows)
            }
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async buscaUmUsuarioPorID(req, res) {
        const { id } = req.params
        try {
            const usuario = await db.query('SELECT usu_st_email, usu_st_nome, usu_st_senha FROM biblioteca.biblioteca_usuario where usu_in_id = $1', [id])
            if (usuario.rowCount == 0){
                return res.status(500).send('Não existe usuário com esse ID')
            } else {
            return res.status(200).json(usuario.rows)
            }
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async loginUsuario(req, res) {
        const token = criaTokenJWT(req.user)
        res.set('Authorization', token);
        res.status(204).send();
    }

    
}

function criaTokenJWT(usuario){
    const payload = {
        id: usuario.usu_in_id
    };
    const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '30m' });
    return token;
}


export default UsuarioController