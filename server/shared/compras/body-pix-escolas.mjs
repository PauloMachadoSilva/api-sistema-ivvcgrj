import json2xml from 'json2xml';
import qs from 'qs'
export class BodyCompraPixData {
  static BODY_PIX_HOM(dadosUsuario,dadosPix,referencia, data) {
    let payment = {
        reference_id: referencia,
        customer: {
            name:  dadosUsuario.nome,
            email: dadosUsuario.email,
            tax_id: "12345678909",
            phones: [
                {
                    country: "55",
                    area: String(dadosUsuario.telefone).slice(0,2),
                    number: String(dadosUsuario.telefone).slice(2,11),
                    type: "MOBILE"
                }
            ]
        },
        items: [
            {
                name: "Sistema IVVCGRJ - Escolas",
                quantity: 1,
                unit_amount: 500
            }
        ],
        qr_codes: [
            {
                amount: {
                    value: '100'
                },
                expiration_date: data
                // expiration_date: '2023-06-14T09:58:00.000'
            }
        ],
        shipping: {
            address: {
                street: "R. Alfredo de Morais",
                number: "685",
                complement: "Campo Grande",
                locality: "Campo Grande",
                city: "Rio de Janeiro",
                region_code: "RJ",
                country: "BRA",
                postal_code: "23080100"
            }
        },
        notification_urls: [
            "https://meusite.com/notificacoes"
        ]
    };
    let xml = payment
    // console.log(xml);
    return xml
  }

  static BODY_PIX_PRD(dadosUsuario,dadosValorPix,referencia,data) {

    let payment = {
        reference_id: referencia,
        customer: {
            name:  dadosUsuario.nome,
            email: dadosUsuario.email,
            tax_id: "12345678909",
            phones: [
                {
                    country: "55",
                    area: String(dadosUsuario.telefone).slice(0,2),
                    number: String(dadosUsuario.telefone).slice(2,11),
                    type: "MOBILE"
                }
            ]
        },
        items: [
            {
                name: "Sistema IVVCGRJ - Escolas",
                quantity: 1,
                unit_amount: dadosValorPix
            }
        ],
        qr_codes: [
            {
                amount: {
                    value: dadosValorPix
                },
                expiration_date: data
                // expiration_date: '2023-06-14T09:58:00.000'
            }
        ],
        shipping: {
            address: {
                street: "R. Alfredo de Morais",
                number: "685",
                complement: "Campo Grande",
                locality: "Campo Grande",
                city: "Rio de Janeiro",
                region_code: "RJ",
                country: "BRA",
                postal_code: "23080100"
            }
        },
        notification_urls: [
            "https://api.verbocampogranderj.com.br/sys-escolas-notificacoes"
        ]
    };
    let xml = payment
    // console.log(xml);
    return xml
  }
  dataVencimentoPix(params) {
    let data = new Date
    return data;
  }
}
