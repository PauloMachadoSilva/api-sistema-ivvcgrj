export const environment = {
    apiLocal: 'http://localhost:5050',
    apiProd: 'https://api.verbocampogranderj.com.br',
    apiWhatsApp: 'https://api-whats.verbocampogranderj.com.br', 
    pagSeguroSandBox: {
        contaEmail: 'pauloems@yahoo.com.br',
        token: 'D79B66FD29C546CAB1AF08215369573B',
        criarSecao: 'https://ws.sandbox.pagseguro.uol.com.br/v2/sessions', //POST
        obterTokenCartao: 'https://df.uol.com.br/v2/cards', //POST
        obterBandeiraCartao: 'https://df.uol.com.br/df-fe/mvc/creditcard/v1/getBin', //GET
        obterCondicoesParcelamento: 'https://sandbox.pagseguro.uol.com.br/checkout/v2/installments.json', //GET
        realizarCompraCartaoCredito: 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions/', //POST
        obterCompraCodigoReferencia: 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions', //GET
        cartaoTesteNumero:'4111111111111111',
        cartaoTesteBandeira:'visa',
        cartaoTesteMes:'12',
        cartaoTesteAno:'2030',
        cartaoTesteCVV:'123'
    },
    pagSeguroProd: {
        contaEmail: 'pauloems@yahoo.com.br',
        token: '0347E203BE8F4E019D3310CE5368DAC0',
        criarSecao: 'https://ws.pagseguro.uol.com.br/v2/sessions', //POST
        obterTokenCartao: 'https://df.uol.com.br/v2/cards', //POST
        obterBandeiraCartao: 'https://df.uol.com.br/df-fe/mvc/creditcard/v1/getBin', //GET
        obterCondicoesParcelamento: 'https://pagseguro.uol.com.br/checkout/v2/installments.json', //GET
        realizarCompraCartaoCredito: 'https://ws.pagseguro.uol.com.br/v2/transactions/', //POST
        obterCompraCodigoReferencia: 'https://ws.pagseguro.uol.com.br/v2/transactions' //GET
    }
}