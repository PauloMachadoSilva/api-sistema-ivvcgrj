function renderListaConteudo(titulo, descricao, links) {
    return links.length > 0
        ? `<div style='margin-top:24px'>
                <h3>${titulo}</h3>
                <p>${descricao}</p>
                <ul>${links.join('')}</ul>
            </div>`
        : '';
}

const URL_EVENTOS_ONLINE = 'https://verbocampogranderj.com.br/eventos#/meus-ingressos?online=1';
const IMG_LOGIN_LIVE = 'https://verbocampogranderj.com.br/assets/imgs/email/live-login.png';
const IMG_MENU_LIVE = 'https://verbocampogranderj.com.br/assets/imgs/email/live-menu.png';

function getLiveUrl(inscricao) {
    const params = new URLSearchParams({ id_evento: String(inscricao.id_evento) });
    if (inscricao.id_ingresso) {
        params.set('id_ingresso', String(inscricao.id_ingresso));
    }
    return `https://verbocampogranderj.com.br/eventos#/live?${params.toString()}`;
}

function renderOrientacaoLive() {
    return `<div style='margin-top:28px;padding:18px;border:1px solid #d8e3f5;border-radius:8px;background:#f7fbff'>
                <h3 style='margin-top:0'>Como acessar os eventos online</h3>
                <p>Para assistir, acesse sua conta no site com o e-mail cadastrado na inscrição. Depois, abra o menu e clique em <strong>Eventos online</strong>.</p>
                <p style='margin:20px 0'>
                    <a href='${URL_EVENTOS_ONLINE}' style='display:inline-block;padding:12px 18px;background:#4657bd;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold'>Acessar página de eventos online</a>
                </p>
                <div style='margin-top:18px'>
                    <p style='font-weight:bold'>1. Faça login no site</p>
                    <img src='${IMG_LOGIN_LIVE}' alt='Tela de login para acessar eventos online' style='display:block;width:100%;max-width:620px;border:1px solid #d9dee8;border-radius:8px'>
                </div>
                <div style='margin-top:18px'>
                    <p style='font-weight:bold'>2. No menu, clique em Eventos online</p>
                    <img src='${IMG_MENU_LIVE}' alt='Menu com opção Eventos online' style='display:block;width:100%;max-width:620px;border:1px solid #d9dee8;border-radius:8px'>
                </div>
            </div>`;
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

        if (linkOnline && linkOnline.url) {
            const liveUrl = getLiveUrl(inscricao);
            if (!urlsLink.includes(liveUrl)) {
                urlsLink.push(liveUrl);
                linksOnline.push(`<li><a href='${liveUrl}'>${linkOnline.texto ? linkOnline.texto : 'Acessar transmissão'}</a></li>`);
            }
        }

        if (material && material.url && material.tipo === 'link') {
            const liveUrl = getLiveUrl(inscricao);
            if (!urlsLink.includes(liveUrl)) {
                urlsLink.push(liveUrl);
                linksOnline.push(`<li><a href='${liveUrl}'>${material.texto ? material.texto : 'Acessar transmissão'}</a></li>`);
            }
        }

        if (material && material.url && material.tipo !== 'link' && !urlsMaterial.includes(material.url)) {
            urlsMaterial.push(material.url);
            materiais.push(`<li><a href='${material.url}'>${material.texto ? material.texto : material.url}</a></li>`);
        }
    }

    return renderListaConteudo('Link online', 'Utilize o(s) link(s) abaixo para acessar o evento.', linksOnline)
        + renderListaConteudo('Material online', 'Utilize o(s) link(s) abaixo para acessar o material do evento.', materiais)
        + (linksOnline.length > 0 ? renderOrientacaoLive() : '');
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
