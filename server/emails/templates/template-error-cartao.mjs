export default function htmlTemplatesErroCartao (dadosUsuario) {
    return(
    `<!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <img style='width:280px' src='https://verbocampogranderj.com.br/assets/imgs/logo-verbo-cg.png'>
            <h1>Compra não aprovada!</h1>
            <h3>Igreja Verbo da Vida em Campo Grande RJ</h3>
            <div style='margin-top:24px'>
                <h3>Olá ${dadosUsuario.nome}</h3>
                <p>Ocorreu um erro ao realizar sua compra, favor verificar com a Administradora do seu Cartão de crédito!</p>
            </div>
        </body>
    </html>`
    )
};  