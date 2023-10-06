import db from "../../db.js"

class LivroController {

    static async buscarTodosOsLivros (req, res){
        try {
            const livros = await db.query(`SELECT l.liv_in_id, l.liv_st_nome, l.liv_st_isbn, l.liv_in_qtd_paginas, l.liv_st_genero, l.liv_in_qtd, a.aut_st_nome
                                           FROM biblioteca.biblioteca_livro l
                                           inner join biblioteca.biblioteca_autor a on (a.aut_in_id = l.aut_in_id)
                                           order by liv_in_id`)
            return res.status(200).json(livros.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async buscarUmLivroID (req, res){
        const { id } = req.params
        try {
            const livros = await db.query(`SELECT l.liv_in_id, l.liv_st_nome, l.liv_st_isbn, l.liv_in_qtd_paginas, l.liv_st_genero, l.liv_in_qtd, a.aut_st_nome
                                           FROM biblioteca.biblioteca_livro l
                                           inner join biblioteca.biblioteca_autor a on (a.aut_in_id = l.aut_in_id)
                                           where liv_in_id = $1
                                           order by liv_in_id`, [id])
            return res.status(200).json(livros.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async buscarUmLivroNome (req, res){
        const { nome } = req.params
        try {
            const livros = await db.query(`SELECT l.liv_in_id, l.liv_st_nome, l.liv_st_isbn, l.liv_in_qtd_paginas, l.liv_st_genero, l.liv_in_qtd, a.aut_st_nome
                                           FROM biblioteca.biblioteca_livro l
                                           inner join biblioteca.biblioteca_autor a on (a.aut_in_id = l.aut_in_id)
                                           where liv_st_nome like $1 
                                           order by liv_in_id`, ['%' + nome + '%'])
            return res.status(200).json(livros.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async criarLivro (req, res){
        const corpo = req.body
        const livro = corpo.livro
        const existeLivro = await db.query('SELECT liv_st_nome FROM biblioteca.biblioteca_livro where liv_st_nome = $1', [livro.liv_st_nome])
        if (existeLivro.rowCount == 0) {
            const existeAutor = await db.query('SELECT * FROM biblioteca.biblioteca_autor where aut_in_id = $1', [livro.aut_in_id])
            if (existeAutor.rowCount > 0) {
            try {
                await db.query('INSERT INTO biblioteca.biblioteca_livro (liv_st_nome, liv_st_isbn, liv_in_qtd_paginas, liv_st_genero, liv_in_qtd, aut_in_id) VALUES ($1, $2, $3, $4, $5, $6)', [livro.liv_st_nome, livro.liv_st_isbn, livro.liv_in_qtd_paginas, livro.liv_st_genero, livro.liv_in_qtd, livro.aut_in_id], (error, results) => {
                    if (error) {
                        throw error
                    }
                    throw res.status(201).send()
                })
                return res.status(201).send()
            } catch (error) {
                return res.status(500).json(error.message)
            }
        } else {
            res.status(500).send(`Não existe autor com esse ID!`)
        }
    } else {
            res.status(500).send(`Já existe livro com o nome: "${livro.liv_st_nome}"!`)
        }
    }

    static async apagarLivro (req, res){
        const { id } = req.params
        const existe = await db.query('SELECT * FROM biblioteca.biblioteca_log where liv_in_id = $1', [id])
        if (existe.rowCount == 0) {
        try {
            await db.query('DELETE FROM biblioteca.biblioteca_livro WHERE "liv_in_id" = $1', [id])
            return res.status(202).send()
        } catch (error) {
            return res.status(500).json(error.message)
        }
    } else{
        return res.status(500).send('Não foi possível apagar o livro, ele já possui uma transação (retirar/entregar)')
    }
    }

    static async atualizarLivro (req, res){
        const corpo = req.body
        const livro = corpo.livro

        try {
            await db.query('update biblioteca.biblioteca_livro set liv_st_nome = $1, liv_st_isbn = $2, liv_in_qtd_paginas = $3, liv_st_genero = $4, liv_in_qtd = $5, aut_in_id = $6 where liv_in_id = $7', [livro.liv_st_nome, livro.liv_st_isbn, livro.liv_in_qtd_paginas, livro.liv_st_genero, livro.liv_in_qtd, livro.aut_in_id, livro.liv_in_id], (error, results) => {
                if (error) {
                    throw error
                }
            })
            res.status(201).send()
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

    static async retirarLivro (req, res){
        const corpo = req.body
        const log = corpo.log

        const existeLivro = await db.query('SELECT liv_in_qtd > 0 as qtd FROM biblioteca.biblioteca_livro where liv_in_id = $1', [log.liv_in_id])
        if (existeLivro.rows[0].qtd) {
            const existeUsu = await db.query('SELECT * FROM biblioteca.biblioteca_usuario where usu_in_id = $1', [log.usu_in_id])
            if (existeUsu.rowCount > 0){
                try {
                    await db.query('INSERT INTO biblioteca.biblioteca_log (liv_in_id, usu_in_id) VALUES ($1, $2)', [log.liv_in_id, log.usu_in_id], (error, results) => {
                        if (error) {
                            throw error
                        }
                        throw res.status(201).send()
                    })
                    return res.status(201).send()
                } catch (error) {
                    return res.status(500).json(error.message)
                }
            } else {
                res.status(500).send(`Esse usuário não existe`)
            }
        } else {
            res.status(500).send(`Esse livro não está disponivel`)
        }
    }

    static async entregarLivro (req, res){
        const corpo = req.body
        const log = corpo.log

        const existe = await db.query(`SELECT log_in_id FROM biblioteca.biblioteca_log where liv_in_id = $1 and usu_in_id = $2 and log_ch_status = 'R' order by log_in_id`, [log.liv_in_id, log.usu_in_id])
        if (existe.rowCount > 0) {
            try {
                await db.query(`update biblioteca.biblioteca_log set log_ch_status = 'E' where log_in_id = $1`, [existe.rows[0].log_in_id], (error, results) => {
                    if (error) {
                        throw error
                    }
                    throw res.status(201).send()
                })
                return res.status(201).send()
            } catch (error) {
                return res.status(500).json(error.message)
            }
        } else {
            res.status(500).send(`Esse livro ja foi devolvido ou ainda não foi retirado`)
        }
    }

    static async buscarTodasAsMovimentacoesDosLivros (req, res){
        try {
            const livros = await db.query(`select b.log_in_id,
                                           case when b.log_ch_status = 'R' then 'Retirado'
                                           else 'Entregue'
                                           end,
                                           b.log_dt_fim,
                                           l.liv_st_nome,
                                           u.usu_st_nome
                                           from biblioteca.biblioteca_log b
                                           inner join biblioteca.biblioteca_livro l on (b.liv_in_id = l.liv_in_id)
                                           inner join biblioteca.biblioteca_usuario u on (b.usu_in_id = u.usu_in_id)
                                           order by b.log_in_id`)
            return res.status(200).json(livros.rows)
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }
    
}

export default LivroController