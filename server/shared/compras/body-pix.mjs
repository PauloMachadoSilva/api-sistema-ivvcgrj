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
                name: "NFC/2023 - Ingressos",
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

  static PIX_PRD(dadosUsuario,token,referencia,dadosCartao) {

    let payment = {
        "reference_id": '123456',
        "customer": {
            "name": "Jose da Silva",
            "email": "email@test.com",
            "tax_id": "12345678909",
            "phones": [
                {
                    "country": "55",
                    "area": "11",
                    "number": "999999999",
                    "type": "MOBILE"
                }
            ]
        },
        "items": [
            {
                "name": "nome do item",
                "quantity": 1,
                "unit_amount": 500
            }
        ],
        "qr_codes": [
            {
                "amount": {
                    "value": 500
                },
                "expiration_date": "2023-06-13T20:40:35-03:00"
            }
        ],
        "shipping": {
            "address": {
                "street": "Avenida Brigadeiro Faria Lima",
                "number": "1384",
                "complement": "apto 12",
                "locality": "Pinheiros",
                "city": "São Paulo",
                "region_code": "SP",
                "country": "BRA",
                "postal_code": "01452002"
            }
        },
        "notification_urls": [
            "https://meusite.com/notificacoes"
        ]
    };
    let xml = json2xml({payment})
    return xml
  }
  dataVencimentoPix(params) {
    let data = new Date
    return data;
  }
}
