export default function htmlTemplatesFormularioDuvidas (dadosUsuario) {
    return(
    `<!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <img style='width:280px' src='https://verbocampogranderj.com.br/assets/imgs/logo-verbo-cg.png'>
            <h1>Formulário de dúvidas!</h1>
            <h3>Igreja Verbo da Vida em Campo Grande RJ</h3>
            <div style='margin-top:24px'>
                <h3>Olá Núcleo Operacional,</h3>
                <p>Segue a dúvida enviada pelo site da Escola IVVCGRJ.</p>
                <p>Escola: ${dadosUsuario.escola}</p>
                <p>Nome: ${dadosUsuario.nome}</p>
                <p>Celular: ${dadosUsuario.celular}</p>
                <p>Email: ${dadosUsuario.email}</p>
                <p>Data: ${dadosUsuario.date}</p>
                <p>Duvida: ${dadosUsuario.duvida}</p>
            </div>
        </body>
    </html>`
    )
};  