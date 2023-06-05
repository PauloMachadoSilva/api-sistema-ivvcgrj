import json2xml from 'json2xml';
export class CompraCreditCardData {
  static CREDIT_CARD_HOM(dadosUsuario,token,referencia,dadosCartao) {
    
    let payment = {
        mode : 'default',
        method:'creditCard',
        sender: {
            name: dadosUsuario.nome,
            email: 'comprador@teste.com.br',
            phone:{
                areaCode: String(dadosUsuario.telefone).slice(0,2),
                number: String(dadosUsuario.telefone).slice(2,11),
            },
            documents: {
                document: {
                    type: 'CPF',
                    value: dadosUsuario.cpf,
                }
            }
        },
        currency: 'BRL',
        notificationURL:'https://sualoja.com.br/notificacao</notificationURL',
        items: {
            item: {
                id:1,
                description: 'NFC/2023 - Ingressos - R$ ' + dadosCartao.amount,
                quantity: dadosCartao.parcels,
                amount: dadosCartao.amountParcels.toFixed(2),
            }
        },
        extraAmount: '0.00',
        reference: referencia,
        shipping: {
            addressRequired: false,
        },
        creditCard: {
            token: token,
            installment: {
                noInterestInstallmentQuantity: 12,
                quantity: dadosCartao.parcels,
                value: dadosCartao.amountParcels.toFixed(2),
            },
            holder: {
                name: 'Nome impresso no cartao',
                documents: {
                    document: {
                        type: 'CPF',
                        value: 22111944785,
                    }
                },
                birthDate: '',
                phone: {
                    areaCode: String(dadosUsuario.telefone).slice(0,2),
                    number: String(dadosUsuario.telefone).slice(2,11),
                }
            },
            billingAddress: {
                street:'R. Alfredo de Morais',
                number: 685,
                complement:'',
                district:'Campo Grande',
                city: 'RJ',
                state: 'RJ',
                country:'BRA',
                postalCode:'23080100'
            }
        }
    };
    let xml = json2xml({payment})
    return xml
  }

  static CREDIT_CARD_PRD(data,token) {
    let card = {
        paymentMode:'default',
        paymentMethod:'creditCard',
        receiverEmail:'eventos@verbocampogranderj.com.br',
        currency:'BRL',
        extraAmount:1.00,
        itemId1:'0001',
        itemDescription1:'Festa das Nações - Ingresso - R$ ' + dadosCartao.amount,
        itemAmount1:0,
        itemQuantity1:1,
        notificationURL:'https://verbocampogranderj.com.br/',
        reference:data.codigo_referencia,
        senderName:data.nome,
        senderCPF:data.cpf,
        senderAreaCode:21,
        senderPhone:data.telefone,
        senderEmail:data.email,
        senderHash:'ADICIONE O HASH',
        shippingAddressStreet: data.endereco,
        shippingAddressNumber: data.numero,
        shippingAddressComplement: data.complemento,
        shippingAddressDistrict: data.cidade,
        shippingAddressPostalCode: data.cep,
        shippingAddressCity: data.cidade,
        shippingAddressState: 'RJ',
        shippingAddressCountry: 'BRA',
        shippingType :0,
        shippingCost: 0.00,
        creditCardToken: token,
        installmentQuantity: 1,
        installmentValue: 0,
        noInterestInstallmentQuantity: 12,
        creditCardHolderName: data.nome,
        creditCardHolderCPF: data.telefone,
        creditCardHolderBirthDate:'',
        creditCardHolderAreaCode:'',
        creditCardHolderPhone:'',
        billingAddressStreet: data.endereco,
        billingAddressNumber: data.numero,
        billingAddressComplement:'',
        billingAddressDistrict: data.cidade,
        billingAddressPostalCode: data.cep,
        billingAddressCity:data.cidade,
        billingAddressState:'',
        billingAddressCountry:'BRA'
    }

    return qs.stringify(card)
  }
}
