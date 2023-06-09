export class BodyCreditCardData {
    static BODY_CARTAO_CREDITO_HOM(data, sessao) {

        var data =  {
            sessionId:sessao,
            amount:data.amount,
            cardNumber:5447318470143641,
            cardBrand:'visa',
            cardExpirationMonth:12,
            cardExpirationYear:2027,
            cardCvv:'097'
            }
        
        return data;
    }
    static BODY_CARTAO_CREDITO_PRD(data, sessao) {

        var data =  {
            sessionId:sessao,
            amount:data.amount,
            cardNumber: data.cardNumber,
            cardBrand: data.cardBrand,
            cardExpirationMonth: data.cardExpirationMonth,
            cardExpirationYear: data.cardExpirationYear,
            cardCvv: data.cardCvv
            }
        return data;
    }
}