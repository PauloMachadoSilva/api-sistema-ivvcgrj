function renderListaConteudo(titulo, descricao, links) {
    return links.length > 0
        ? `<div style='margin-top:24px'>
                <h3>${titulo}</h3>
                <p>${descricao}</p>
                <ul>${links.join('')}</ul>
            </div>`
        : '';
}

function conteudosOnline(dadosIngresso) {
    const urlsLink = [];
    const urlsMaterial = [];
    const linksOnline = [];
    const materiais = [];

    for (const inscricao of dadosIngresso) {
        const ingresso = inscricao.INGRESSO && inscricao.INGRESSO.length > 0 ? inscricao.INGRESSO[0] : null;
        const linkOnline = ingresso && ingresso.link_online ? ingresso.link_online : null;
        const material = ingresso && ingresso.material_online ? ingresso.material_online : null;

        if (linkOnline && linkOnline.url && !urlsLink.includes(linkOnline.url)) {
            urlsLink.push(linkOnline.url);
            linksOnline.push(`<li><a href='${linkOnline.url}'>${linkOnline.texto ? linkOnline.texto : linkOnline.url}</a></li>`);
        }

        if (material && material.url && material.tipo === 'link' && !urlsLink.includes(material.url)) {
            urlsLink.push(material.url);
            linksOnline.push(`<li><a href='${material.url}'>${material.texto ? material.texto : material.url}</a></li>`);
        }

        if (material && material.url && material.tipo !== 'link' && !urlsMaterial.includes(material.url)) {
            urlsMaterial.push(material.url);
            materiais.push(`<li><a href='${material.url}'>${material.texto ? material.texto : material.url}</a></li>`);
        }
    }

    return renderListaConteudo('Link online', 'Utilize o(s) link(s) abaixo para acessar o evento.', linksOnline)
        + renderListaConteudo('Material online', 'Utilize o(s) link(s) abaixo para acessar o material do evento.', materiais);
}

export default function htmlTemplates (dadosIngresso, qrcodes) {
    return(
    `<!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <img style='width:280px' src='https://verbocampogranderj.com.br/assets/imgs/logo-verbo-cg.png'>
            <h1>Compra aprovada! Seus ingressos já estão disponíveis.</h1>
            <h2>${dadosIngresso[0].INGRESSO[0].titulo}</h2>
            <h3>Igreja Verbo da Vida em Campo Grande RJ</h3>
            ${qrcodes ? `<div>${qrcodes}</div>` : ''}
            ${conteudosOnline(dadosIngresso)}
            <div style='margin-top:24px'>
                <span>Caso não consiga visualizar seus ingressos</span><a href='https://verbocampogranderj.com.br/eventos#/ingressos'> clique aqui</a>
            </div>
        </body>
    </html>`
    )
};  
