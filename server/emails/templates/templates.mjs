export default function htmlTemplates (dadosIngresso, qrcodes) {
    return(
    `<!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <img style='width:280px' src='https://verbocampogranderj.com.br/assets/imgs/logo-verbo-cg.png'>
            <h1>Compra aprovada! Seus ingressos já estão disponíveis.</h1>
            <h2>${dadosIngresso.INGRESSO[0].titulo}</h2>
            <h3>Igreja Verbo da Vida em Campo Grande RJ</h3>
            <div>${qrcodes}</div>
            <div style='margin-top:24px'>
                <span>Caso não consiga visualizar seus ingressos</span><a href='https://verbocampogranderj.com.br/eventos#/ingressos'> clique aqui</a>
            </div>
        </body>
    </html>`
    )
};  