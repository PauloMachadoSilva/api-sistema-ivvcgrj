import qs from 'qs'
import { environment } from '../../environments/environment.mjs'
export class CompraDebitCardData {
  
  static DEBIT_CARD(data,inscricao,cartao) {
    let card = {
        paymentMode:'default',
        paymentMethod:'eft',
        bankName:'itau',
        receiverEmail: environment.pagSeguroProd.contaEmail,
        currency:'BRL',
        extraAmount:'0.00',
        itemId1:'0001',
        itemDescription1:'Sistema IVVCGRJ - Ingresso - R$ '+ cartao.amount,
        itemAmount1: cartao.amount.toFixed(2),
        itemQuantity1:1,
        notificationURL:'https://verbocampogranderj.com.br/',
        reference:inscricao.codigo_referencia,
        senderName:data.nome,
        senderCPF:data.cpf,
        senderAreaCode:String(data.telefone).slice(0,2),
        senderPhone:String(data.telefone).slice(2,11),
        senderEmail:data.email,
        // senderHash: cartao.senderHash,
        shippingAddressStreet: 'R. Alfredo de Morais',
        shippingAddressNumber: 685,
        shippingAddressComplement: '',
        shippingAddressDistrict: 'Campo Grande',
        shippingAddressPostalCode: 23080100,
        shippingAddressCity: 'Rio de Janeiro',
        shippingAddressState:'RJ',
        shippingAddressCountry:'BRA',
        shippingType:1,
        shippingCost:'0.00',
    }
    // console.log('card>>',card)
    return qs.stringify(card)
  }
}
