import db from "../../db.js"

class AutorController {
    //Retorna todos os autores cadastrados
    static async buscaTodosOsAutores(req, res) {
        try {
            const autores = await db.query('SELECT aut_in_id, aut_st_nome, aut_dt_nascimento, aut_st_nacionalidade FROM biblioteca.biblioteca_autor order by aut_in_id;')
            return res.status(200).json(autores.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    //Retorna a pesquisa de autor pelo ID
    static async buscaUmAutorID(req, res) {
        const { id } = req.params
        try {
            const autores = await db.query('SELECT aut_in_id, aut_st_nome, aut_dt_nascimento, aut_st_nacionalidade FROM biblioteca.biblioteca_autor where aut_in_id = $1', [id])
            return res.status(200).json(autores.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    //Retorna a pesquisa de autor pelo nome e data de nascimento
    static async buscaUmAutorNomeNasc(req, res) {
        const { nome, nasc } = req.params
        try {
            const autores = await db.query('SELECT aut_in_id, aut_st_nome, aut_dt_nascimento, aut_st_nacionalidade FROM biblioteca.biblioteca_autor where aut_st_nome = $1 and aut_dt_nascimento = $2', [nome, nasc])
            return res.status(200).json(autores.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    //Cria o autor
    static async criaAutor(req, res) {
        const corpo = req.body
        const autor = corpo.autor

        const existe = await db.query('SELECT aut_st_nome FROM biblioteca.biblioteca_autor where aut_st_nome = $1 and aut_dt_nascimento = $2', [autor.aut_st_nome, autor.aut_dt_nascimento])
        if (existe.rowCount == 0) {
            try {
                const novoAutor = await db.query('INSERT INTO biblioteca.biblioteca_autor (aut_st_nome, aut_dt_nascimento, aut_st_nacionalidade) VALUES ($1, $2, $3)', [autor.aut_st_nome, autor.aut_dt_nascimento, autor.aut_st_nacionalidade], (error, results) => {
                    if (error) {
                        throw error
                    }
                    throw res.status(201).send(`Autor cadastrado com o nome: ${autor.aut_st_nome}`)
                })
                return res.status(201).json(`Autor cadastrado com o nome: ${autor.aut_st_nome}`)
            } catch (error) {
                return res.status(500).json(error.message)
            }
        } else {
            res.status(500).send(`Já existe autor com o nome: "${autor.aut_st_nome}" e data de nascimento: "${autor.aut_dt_nascimento}"`)
        }
    }

    //Paga o autor após receber o ID
    static async apagaAutor(req, res) {
        const { id } = req.params
        const existe = await db.query('SELECT * FROM biblioteca.biblioteca_autor where aut_in_id = $1', [id])
        if (existe.rowCount > 0) {
        try {
            await db.query('DELETE FROM biblioteca.biblioteca_autor WHERE "aut_in_id" = $1', [id])
            return res.status(200).send()
        } catch (error) {
            return res.status(500).json(error.message)
        }
    } else {
        return res.status(500).send('Não existe autor com esse ID!')
    }
    }

    //Atualiza o autor pelo ID
    static async atualizarAutor(req, res) {
        const corpo = req.body
        const autor = corpo.autor
        try {
            await db.query('update biblioteca.biblioteca_autor set aut_st_nome = $1, aut_dt_nascimento = $2, aut_st_nacionalidade = $3 where aut_in_id = $4', [autor.aut_st_nome, autor.aut_dt_nascimento, autor.aut_st_nacionalidade, autor.aut_in_id], (error, results) => {
                if (error) {
                    throw error
                }
            })
            res.status(201).send()
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

}

export default AutorController