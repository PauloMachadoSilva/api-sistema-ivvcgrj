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
        token: '19d7d467-6d0a-48bd-992a-2e36da857d1ce72df45040c199104818c34ed31d9ff0d0fe-7c7b-4b43-b9bc-1e0ef5e29e8d',
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