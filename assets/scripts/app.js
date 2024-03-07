$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;

var VALOR_ENTREGA = 0;
var VALOR_ENTREGA_MINIMO = 5;

var CELULAR_EMPRESA = '5524988254644';

cardapio.eventos = {

    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoReserva();
    }

}

cardapio.metodos = {

    // obtem a lista de itens do cardápio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {

        var filtro = MENU[categoria];

        if (!vermais) {
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');
        }

        $.each(filtro, (i, e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)
            .replace(/\${descricao}/g, e.dsc)

            // botão ver mais foi clicado (12 itens)
            if (vermais && i >= 8 && i < 24) {
                $("#itensCardapio").append(temp)
            }

            // paginação inicial (8 itens)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }

        })

        // remove o ativo
        $(".container-menu a").removeClass('active');

        // seta o menu para ativo
        $("#menu-" + categoria).addClass('active')

    },

    // clique no botão de ver mais
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass('hidden');

    },

    // diminuir a quantidade do item no cardapio
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },

    // aumentar a quantidade do item no cardapio
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)

    },

    // adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {

            // obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];
                                    

            // obtem a lista de itens
            let filtro = MENU[categoria];

            // obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id });

            if (item.length > 0) {

                // validar se já existe esse item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id });

                // caso já exista o item no carrinho, só altera a quantidade
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }
                // caso ainda não exista o item no carrinho, adiciona ele 
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])                    
                }      
                
                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green')
                $("#qntd-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal();

            }
        }

    },

    // atualiza o badge de totais dos botões "Meu carrinho"
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

    },

    // abrir a modal de carrinho
    abrirCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();  
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }        

    },

    // altera os texto e exibe os botões das etapas
    carregarEtapa: (etapa) => {

        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');    
        }
        
        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

    },

    // botão de voltar etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);

    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {           

            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {             

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)
                .replace(/\${descricao}/g, e.dsc)

                $("#itensCarrinho").append(temp);

                // último item            
                if ((i + 1) == MEU_CARRINHO.length) {
                    cardapio.metodos.carregarValores();
                }

            })            

        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
            cardapio.metodos.carregarValores();
        }

    },

    // diminuir quantidade do item no carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else {
            cardapio.metodos.removerItemCarrinho(id)
        }

    },

    // aumentar quantidade do item no carrinho
    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    // botão remover item do carrinho
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();

        // atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();
        
    },

    // atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        // atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

        // atualiza os valores (R$) totais do carrinho
        cardapio.metodos.carregarValores();

    },

    // carrega os valores de SubTotal, Entrega e Total
    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd);
            if ((i + 1) == MEU_CARRINHO.length) {
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ R$ ${(VALOR_ENTREGA + VALOR_ENTREGA_MINIMO).toFixed(2).replace('.', ',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA + VALOR_ENTREGA_MINIMO).toFixed(2).replace('.', ',')}`);
            }

        })

    },

    // carregar a etapa enderecos
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        } 

        cardapio.metodos.carregarEtapa(2);

    },

    // API ViaCEP
    buscarCep: () => {

        // cria a variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o CEP possui valor informado
        if (cep != "") {

            // Expressão regular para validar o CEP
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        // Atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                        VALOR_ENTREGA = 0 // zerando valor entrega a cada clique

						if(dados.bairro === 'Centro' ) {VALOR_ENTREGA += 2;} 
						else if(dados.bairro === '9 de Abril' ) {VALOR_ENTREGA += 15;} 
						else if(dados.bairro === 'Abelhas' ) {VALOR_ENTREGA += 5;} 
						else if(dados.bairro === 'Água Cumprida' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Ano Bom' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Apóstolo Paulo' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Boa Sorte' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Boa Vista' ) {VALOR_ENTREGA += 15;} 
						else if(dados.bairro === 'Boa Vista I' ) {VALOR_ENTREGA += 15;} 
						else if(dados.bairro === 'Boa Vista II' ) {VALOR_ENTREGA += 15;} 
						else if(dados.bairro === 'Bocaininha' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Bom Pastor' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Centro' ) {VALOR_ENTREGA += '5';} 
						else if(dados.bairro === 'Colonia' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Cotiaria' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Estamparia' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Getúlio Vargas' ) {VALOR_ENTREGA += 3;} 
						else if(dados.bairro === 'Goiabal' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Jardim América' ) {VALOR_ENTREGA += 7;} 
						else if(dados.bairro === 'Jardim Boa Vista' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Jardim Central' ) {VALOR_ENTREGA += 7;} 
						else if(dados.bairro === 'Jardim Marilu' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Loteamento Aiuroca' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Loteamento Belo Horizonte' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Loteamento Chinês' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Loteamento São Vicente' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Loteamento Sofia' ) {VALOR_ENTREGA += 9;} 
						else if(dados.bairro === 'Monte cristo' ) {VALOR_ENTREGA += 7;} 
						else if(dados.bairro === 'Morada Da Colonia I' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Morada Verde' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Nossa Senhora De Fátima' ) {VALOR_ENTREGA += 9;} 
						else if(dados.bairro === 'Nova Esperança' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Parque Independência' ) {VALOR_ENTREGA += 7;} 
						else if(dados.bairro === 'Piteiras' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Roberto Silvera' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Roselândia' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Santa Clara' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Santa Izabel' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Santa Lucia' ) {VALOR_ENTREGA += 9;} 
						else if(dados.bairro === 'Santa Maria II' ) {VALOR_ENTREGA += 9;} 
						else if(dados.bairro === 'Santa Rosa' ) {VALOR_ENTREGA += 7;} 
						else if(dados.bairro === 'São Francisco De Assis' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'são judas tadeu' ) {VALOR_ENTREGA += 9;} 
						else if(dados.bairro === 'São Luís' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'São Luiz' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'São Pedro' ) {VALOR_ENTREGA += 9;} 
						else if(dados.bairro === 'São Sebastião' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'São Silvestre' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Saudade' ) {VALOR_ENTREGA += 6;} 
						else if(dados.bairro === 'Siderlândia' ) {VALOR_ENTREGA += 8;} 
						else if(dados.bairro === 'Vale Do Paraíba' ) {VALOR_ENTREGA += 10;} 
						else if(dados.bairro === 'Verbo Divino' ) {VALOR_ENTREGA += 6;} 
									
									
						$('#lblValorEntrega').html(VALOR_ENTREGA);
                        cardapio.metodos.carregarValores()
                    }
                    else {
                        cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }

                })

            }
            else {
                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();
            }

        }
        else {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
        }

    },

    // validação antes de prosseguir para a etapa 3
    resumoPedido: () => {

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();
        let pagamento = $("#ddlPagamento").val().trim();
        let troco = $("#txtTroco").val().trim();
        let observacao = $("#txtObservacao").val().trim();

        if (cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            return;
        }

        if (endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o Endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }

        if (bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o Bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }

        if (cidade.length <= 0) {
            cardapio.metodos.mensagem('Informe a Cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }

        if (uf == "-1") {
            cardapio.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUf").focus();
            return;
        }

        if (numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o Número, por favor.');
            $("#txtNumero").focus();
            return;
        }

        if (pagamento == "-1") {
            cardapio.metodos.mensagem('Informe a forma de pagamento, por favor.');
            $("#ddlPagamento").focus();
            return;
        }

        if (pagamento == 0 && troco <= 0) {
            cardapio.metodos.mensagem('Informe o troco, por favor.');
            $("#txtTroco").focus();
            return;
        }

        
        if (observacao <= 0) {
            cardapio.metodos.mensagem('Coloque o ponto da Carne, por favor.');
            $("#txtObservacao").focus();
            return;
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento,
            pagamento: pagamento,
            troco: troco,
            observacao: observacao
        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    // carrega a etapa de Resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);

        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        cardapio.metodos.finalizarPedido();

    },

    // Atualiza o link do botão do WhatsApp
    finalizarPedido: () => {

        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

            var texto = 'Olá! gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += `\n*Observações do pedido:*\n${MEU_ENDERECO.observacao}`;
            texto += '\n\n*Endereço de entrega:*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total Pedido: R$ ${(VALOR_CARRINHO).toFixed(2).replace('.', ',')}*`;
            texto += `\n*Taxa de entrega: R$ ${(VALOR_ENTREGA + VALOR_ENTREGA_MINIMO).toFixed(2).
            replace('.', ',')}*`;
            texto += `\n*Total: R$ ${(VALOR_CARRINHO + VALOR_ENTREGA + VALOR_ENTREGA_MINIMO).toFixed(2).
            replace('.', ',')}*`;
            texto += `\n\n*Pagamento: ${(MEU_ENDERECO.pagamento).replace('0', 'Dinheiro').replace('1', 'Cartão')}`;
            
            if (MEU_ENDERECO.pagamento != '1'){
                texto += `\n*Troco para: R$ ${MEU_ENDERECO.troco}`;
            }; 
            
            console.log(MEU_ENDERECO.pagamento);  
            
            texto += ``;
        
            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;

                // último item
                if ((i + 1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens);

                    // converte a URL
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);

                }

            })

        }

    },

    // carrega o link do botão reserva
    carregarBotaoReserva: () => {

        var texto = 'Olá! gostaria de fazer uma *reserva*';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnReserva").attr('href', URL);

    },

    // carrega o botão de ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // abre o depoimento
    abrirDepoimento: (depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');

    },

    // mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)

    }

}

cardapio.templates = {

    item: `
        <div class="col-12 col-lg-3 col-md-4 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
        <div class="col-12">
            <div class="item-carrinho">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <div class="dados-produto">
                    <p class="title-produto"><b>\${nome}</b></p>
                    <p class="price-produto"><b>R$ \${preco}</b></p>
                    <p><b>\${descricao}</b></p>
                </div>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
                </div>   
            </div>
        </div> 
    `,

    itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `

}

jQuery('.nav-link.scroll,.ver-cardapio').on('click', function(e){
    e.preventDefault();
    var href = $(this).attr('href');
    $('html, body').animate({ 
        scrollTop:$(href).offset().top
    },'slow');
});


$(document).ready(function() {
    $('#ddlPagamento').change(function() {
        if($(this).val() == '0') {
            $('.troco').show();           
        }
        else {
            $('.troco').hide();   
        }
    });
});  