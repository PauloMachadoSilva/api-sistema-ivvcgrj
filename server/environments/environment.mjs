export const environment = {
    apiLocal: 'http://localhost:5050',
    apiProd: 'https://api.verbocampogranderj.com.br',
    apiWhatsApp: 'https://api-whats.verbocampogranderj.com.br', 
    pagSeguroSandBox: {
        // PAULO contaEmail: 'pauloems@yahoo.com.br',
        contaEmail: 'juniorjosiasf@gmail.com',
        // PAULO token: 'D79B66FD29C546CAB1AF08215369573B',
        token: '68887C2C9A6A412DB8F32B0EE886D8C6',
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
        cartaoTesteCVV:'123',
        ApiPix: 'https://sandbox.api.pagseguro.com/orders',
        ApixValidarPagamentoPix: 'https://sandbox.api.pagseguro.com/pix/pay/'
    },
    pagSeguroProd: {
        // contaEmail: 'pauloems@yahoo.com.br',
        contaEmail: 'juniorjosiasf@gmail.com',
        // token: '0347E203BE8F4E019D3310CE5368DAC0',
        token: 'bfe7c189-bb72-4e53-a078-6e830beab2af99e720be4e8d9397fa0c205be253812eb2c1-6054-4b24-a69b-8dd88978360e',
        criarSecao: 'https://ws.pagseguro.uol.com.br/v2/sessions', //POST
        obterTokenCartao: 'https://df.uol.com.br/v2/cards', //POST
        obterBandeiraCartao: 'https://df.uol.com.br/df-fe/mvc/creditcard/v1/getBin', //GET
        obterCondicoesParcelamento: 'https://pagseguro.uol.com.br/checkout/v2/installments.json', //GET
        realizarCompraCartaoCredito: 'https://ws.pagseguro.uol.com.br/v2/transactions/', //POST
        obterCompraCodigoReferencia: 'https://ws.pagseguro.uol.com.br/v2/transactions', //GET
        consultarPagamentoPix: 'https://api.pagseguro.com/orders', //GET
        gerarPagamentoPix: 'https://api.pagseguro.com/orders', //POST
        consultarNotificacoes: 'https://ws.pagseguro.uol.com.br/v2/transactions/notifications', //POST
    }
}
