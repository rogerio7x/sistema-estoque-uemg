const apiUrl = ''; // mesma origem: o Express já serve o front-end e a API juntos
let ESTOQUE_MINIMO = 10;
let pecaParaExcluir = null;

const el = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
    await carregarConfig();
    await listarPecas();

    el('btnNovaPeca').addEventListener('click', abrirModalNovaPeca);
    el('btnFecharModal').addEventListener('click', fecharModal);
    el('btnCancelar').addEventListener('click', fecharModal);
    el('btnSalvar').addEventListener('click', salvarPeca);
    el('modalOverlay').addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') fecharModal(); });

    el('btnCancelarExclusao').addEventListener('click', fecharModalConfirmacao);
    el('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    el('modalConfirmOverlay').addEventListener('click', (e) => { if (e.target.id === 'modalConfirmOverlay') fecharModalConfirmacao(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { fecharModal(); fecharModalConfirmacao(); }
    });

    let debounce;
    el('inputBusca').addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(listarPecas, 300);
    });
});

async function carregarConfig() {
    try {
        const resp = await fetch(`${apiUrl}/config`);
        if (resp.ok) {
            const cfg = await resp.json();
            ESTOQUE_MINIMO = cfg.estoqueMinimo ?? ESTOQUE_MINIMO;
        }
    } catch (e) {
        // se falhar, mantém o valor padrão local
    }
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function listarPecas() {
    const busca = el('inputBusca').value.trim();
    const url = busca ? `${apiUrl}/listar?busca=${encodeURIComponent(busca)}` : `${apiUrl}/listar`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar');
        const pecas = await response.json();
        renderizarTabela(pecas);
        atualizarEstatisticas(pecas);
    } catch (err) {
        mostrarToast('Não foi possível carregar as peças. Verifique se o servidor está rodando.', 'erro');
    }
}

function renderizarTabela(pecas) {
    const tbody = el('tabelaPecas');
    const vazio = el('estadoVazio');
    tbody.innerHTML = '';

    if (pecas.length === 0) {
        vazio.hidden = false;
        return;
    }
    vazio.hidden = true;

    pecas.forEach((p) => {
        const baixo = p.quantidade < ESTOQUE_MINIMO;
        const tr = document.createElement('tr');
        if (baixo) tr.classList.add('linha-baixa');

        tr.innerHTML = `
            <td data-label="Código"><span class="tag-sku">${escapeHtml(p.codigo_sku)}</span></td>
            <td data-label="Peça">${escapeHtml(p.nome)}</td>
            <td data-label="Qtd."><span class="qtd-num">${p.quantidade}${baixo ? '<span class="badge-baixo">Baixo</span>' : ''}</span></td>
            <td data-label="Preço"><span class="preco-num">${formatarMoeda(p.preco)}</span></td>
            <td class="td-acoes" data-label="Ações">
                <button class="btn-sm editar" data-id="${p.id}">Editar</button>
                <button class="btn-sm excluir" data-id="${p.id}">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.editar').forEach((btn) => btn.addEventListener('click', () => editarPeca(btn.dataset.id)));
    tbody.querySelectorAll('.excluir').forEach((btn) => btn.addEventListener('click', () => abrirModalConfirmacao(btn.dataset.id)));
}

function atualizarEstatisticas(pecas) {
    const total = pecas.length;
    const baixo = pecas.filter((p) => p.quantidade < ESTOQUE_MINIMO).length;
    const valorTotal = pecas.reduce((soma, p) => soma + p.quantidade * p.preco, 0);

    el('statTotalPecas').textContent = total;
    el('statBaixoEstoque').textContent = baixo;
    el('statValorTotal').textContent = formatarMoeda(valorTotal);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

// ---------- Modal: cadastrar/editar ----------

function abrirModalNovaPeca() {
    el('pecaId').value = '';
    el('nome').value = '';
    el('sku').value = '';
    el('quantidade').value = '';
    el('preco').value = '';
    el('modalTitle').textContent = 'Cadastrar peça';
    esconderErroForm();
    abrirModal();
}

async function editarPeca(id) {
    try {
        const response = await fetch(`${apiUrl}/buscar/${id}`);
        if (!response.ok) throw new Error();
        const peca = await response.json();

        el('pecaId').value = peca.id;
        el('nome').value = peca.nome;
        el('sku').value = peca.codigo_sku;
        el('quantidade').value = peca.quantidade;
        el('preco').value = peca.preco;

        el('modalTitle').textContent = 'Editar peça';
        esconderErroForm();
        abrirModal();
    } catch (err) {
        mostrarToast('Não foi possível carregar essa peça.', 'erro');
    }
}

async function salvarPeca() {
    const id = el('pecaId').value;
    const peca = {
        nome: el('nome').value.trim(),
        codigo_sku: el('sku').value.trim(),
        quantidade: parseInt(el('quantidade').value, 10),
        preco: parseFloat(el('preco').value)
    };

    if (!peca.nome || !peca.codigo_sku || isNaN(peca.quantidade) || isNaN(peca.preco)) {
        mostrarErroForm('Preencha todos os campos corretamente.');
        return;
    }

    const url = id ? `${apiUrl}/editar/${id}` : `${apiUrl}/salvar`;
    const method = id ? 'PUT' : 'POST';

    try {
        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peca)
        });
        const dados = await resp.json();

        if (!resp.ok) {
            mostrarErroForm(dados.erro || 'Não foi possível salvar a peça.');
            return;
        }

        fecharModal();
        mostrarToast(id ? 'Peça atualizada com sucesso.' : 'Peça cadastrada com sucesso.', 'sucesso');
        listarPecas();
    } catch (err) {
        mostrarErroForm('Falha de conexão com o servidor.');
    }
}

function abrirModal() { el('modalOverlay').hidden = false; el('nome').focus(); }
function fecharModal() { el('modalOverlay').hidden = true; }

function mostrarErroForm(msg) {
    const erro = el('formErro');
    erro.textContent = msg;
    erro.hidden = false;
}
function esconderErroForm() { el('formErro').hidden = true; }

// ---------- Modal: confirmar exclusão ----------

function abrirModalConfirmacao(id) {
    pecaParaExcluir = id;
    el('modalConfirmOverlay').hidden = false;
}
function fecharModalConfirmacao() {
    pecaParaExcluir = null;
    el('modalConfirmOverlay').hidden = true;
}

async function confirmarExclusao() {
    if (!pecaParaExcluir) return;
    try {
        const resp = await fetch(`${apiUrl}/deletar/${pecaParaExcluir}`, { method: 'DELETE' });
        const dados = await resp.json();
        if (!resp.ok) throw new Error(dados.erro);

        fecharModalConfirmacao();
        mostrarToast('Peça excluída com sucesso.', 'sucesso');
        listarPecas();
    } catch (err) {
        fecharModalConfirmacao();
        mostrarToast('Não foi possível excluir a peça.', 'erro');
    }
}

// ---------- Toasts ----------

function mostrarToast(mensagem, tipo = 'info') {
    const container = el('toasts');
    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensagem;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}
