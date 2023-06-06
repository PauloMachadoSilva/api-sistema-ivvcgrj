export default function htmlTemplatesRecuperarSenha (dadosUsuario) {
    return(
    `<!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <img style='width:280px' src='https://verbocampogranderj.com.br/assets/imgs/logo-verbo-cg.png'>
            <h1>Recuperação de senha!</h1>
            <h3>Igreja Verbo da Vida em Campo Grande RJ</h3>
            <div style='margin-top:24px'>
                <h3>Olá ${dadosUsuario.nome}</h3>
                <p>Você solicitou a alteração de senha, acesse o link abaixo para criar uma nova senha</p>
                <p><a href='${'https://verbocampogranderj.com.br/eventos#/alterar-senha?id='+dadosUsuario._id}'>Alterar senha!</a></p>
                <span>Caso não consiga visualizar seus ingressos</span><a href='https://verbocampogranderj.com.br/eventos#/ingressos'> clique aqui</a>
            </div>
        </body>
    </html>`
    )
};  