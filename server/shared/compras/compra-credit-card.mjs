import json2xml from 'json2xml';
import qs from 'qs'
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
                description: 'Sistema IVVCGRJ - Ingressos - R$ ' + dadosCartao.amount,
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
    let xml = payment
    return xml
  }

  static CREDIT_CARD_PRD(dadosUsuario,token,referencia,dadosCartao) {

    let card = {
        paymentMode:'default',
        paymentMethod:'credit_card',
        receiverEmail:'juniorjosiasf@gmail.com',
        currency:'BRL',
        extraAmount:'0.00',
        itemId1:'0001',
        itemDescription1:'Sistema IVVCGRJ - Ingresso - R$ ' + dadosCartao.amountParcels.toFixed(2),
        itemAmount1: dadosCartao.amountParcels.toFixed(2),
        itemQuantity1: dadosCartao.parcels,
        notificationURL:'https://verbocampogranderj.com.br/',
        reference:referencia,
        senderName:dadosUsuario.nome,
        senderCPF:dadosUsuario.cpf,
        senderAreaCode: String(dadosUsuario.telefone).slice(0,2),
        senderPhone: String(dadosUsuario.telefone).slice(2,11),
        senderEmail: dadosUsuario.email,
        senderHash: dadosCartao.senderHash,
        shippingAddressStreet: 'R. Alfredo de Morais',
        shippingAddressNumber: 685,
        shippingAddressComplement: '',
        shippingAddressDistrict: 'Campo Grande',
        shippingAddressPostalCode: 23080100,
        shippingAddressCity: 'Rio de Janeiro',
        shippingAddressState: 'RJ',
        shippingAddressCountry: 'BRA',
        shippingType :1,
        shippingCost: '0.00',
        creditCardToken: token,
        installmentQuantity: dadosCartao.parcels,
        installmentValue: dadosCartao.amountParcels.toFixed(2),
        noInterestInstallmentQuantity: 12,
        creditCardHolderName: dadosCartao.nameHolder ? dadosCartao.nameHolder : dadosUsuario.nome,
        creditCardHolderCPF: dadosUsuario.cpf,
        creditCardHolderBirthDate:'01/01/2001',
        creditCardHolderAreaCode:'21',
        creditCardHolderPhone:'24157796',
        billingAddressStreet: 'R. Alfredo de Morais',
        billingAddressNumber: 685,
        billingAddressComplement:'',
        billingAddressDistrict: 'Campo Grande',
        billingAddressPostalCode: 23080100,
        billingAddressCity: 'Rio de Janeiro',
        billingAddressState:'RJ',
        billingAddressCountry:'BRA'
    }
    // console.log('CARD->', card)
    return qs.stringify(card)
  }
}
