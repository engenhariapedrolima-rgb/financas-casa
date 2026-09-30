# Finanças da Casa — guia de implantação

Arquivos: `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` (vão para o GitHub) e `Code.gs` (vai para o Apps Script da planilha).

O app já funciona **sem planilha** (modo local, dados só no aparelho). A planilha serve para sincronizar entre aparelhos e para mais de uma pessoa lançar.

## 1. Planilha + Apps Script (backend)

1. Crie uma planilha nova no Google Sheets (ex.: "Finanças da Casa").
2. **Extensões > Apps Script**. Apague o conteúdo padrão e cole o `Code.gs`. Salve.
3. No seletor de funções escolha **configurar** e clique em **Executar**. Autorize o acesso da sua conta.
4. Abra **Registro de execução** e copie o **TOKEN** exibido. As abas `Lancamentos` e `Categorias` são criadas automaticamente.
5. **Implantar > Nova implantação** > tipo **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
6. Copie a **URL** que termina em `/exec`.

> Se editar o `Code.gs` depois: **Implantar > Gerenciar implantações > ✏️ > Versão: Nova versão**. Assim a URL continua a mesma.
>
> O acesso "Qualquer pessoa" é necessário para o app chamar a API; quem protege os dados é o token. Para trocar o token, rode `gerarNovoToken()`.

## 2. GitHub Pages (frontend)

1. Crie um repositório (ex.: `financas-casa`) e envie os 5 arquivos do app para a raiz.
2. **Settings > Pages > Source: Deploy from a branch > main / (root)**.
3. O link fica `https://SEU-USUARIO.github.io/financas-casa/`.

## 3. Primeiro acesso

1. Abra o link, vá em **Relatórios → Conexão com a planilha**, cole a URL e o token e informe seu nome.
2. **Salvar e testar**. Tudo o que você já tinha lançado no aparelho sobe para a planilha. Se a planilha estiver vazia, as categorias padrão também sobem.
3. Instale o app: no Android/Chrome use **⋮ > Instalar app**; no iPhone/Safari use **Compartilhar > Adicionar à Tela de Início**.

Para outra pessoa da casa usar: mesmo link, mesma URL e mesmo token, com o nome dela. Cada lançamento registra quem lançou.

## Como funciona

- **Lançamento**: pode ser saída ou entrada, paga ou pendente, com forma de pagamento. Também pode repetir:
  - *Todo mês*: cria N lançamentos iguais (aluguel, escola, internet).
  - *Parcelado*: divide o valor total em N parcelas, uma por mês, com descrição "(1/N)". Os centavos da divisão são ajustados na última parcela.
  - Na edição de um item da série existe a opção "Excluir este e os próximos".
- **Bancos**: cadastre cada conta com o saldo que o banco mostra numa data. A partir dela o app soma os depósitos (entradas), desconta os pagamentos (saídas) e move os valores de transferências entre contas. O saldo mostrado é o realizado, e também aparece o saldo previsto até o fim do mês, contando o que está pendente.
  - Em cada lançamento, escolha de qual conta saiu ou em qual entrou. Compra no cartão de crédito pode ficar como "Sem conta"; quando pagar a fatura, lance a saída na conta.
  - "Conferir saldo": digite o saldo real do banco e o app lança um *ajuste* com a diferença. O ajuste não entra nos relatórios de entradas e saídas.
  - Transferências também ficam fora dos totais de entradas e saídas, porque o dinheiro só mudou de conta.
  - Excluir uma conta que tem movimentação apenas a arquiva, preservando o histórico.
- **A pagar**: mostra o que está vencido, o que vence nos próximos 45 dias e o que há a receber. Um toque em "Paguei" dá baixa.
- **Categorias**: nome, cor e orçamento mensal. O Resumo mostra previsto × realizado e muda de cor quando passa de 85% e de 100%.
- **Sincronização automática**: não há botão para apertar. O lançamento é gravado no aparelho e sobe para a planilha na hora (sem internet, fica na fila e sobe quando a conexão volta). Com o app aberto, a cada 8 s ele busca só o que mudou desde a última consulta (o servidor carimba cada linha com o horário de gravação, coluna `sincEm`); a cada 5 min faz uma leitura completa por segurança. O envio tem trava contra envio simultâneo. Cada lançamento tem um id gerado no aparelho, e a planilha grava por id (atualiza ou acrescenta), então um reenvio nunca duplica. Exclusão é lógica (coluna `excluido = sim`).
- **Datas**: o "hoje" é sempre calculado no fuso de Brasília (`America/Sao_Paulo`), independente do aparelho.
- **Atualização do app**: ao publicar mudanças, troque `VERSAO` no `sw.js` (ex.: `financas-casa-v2`). O app detecta a mudança e recarrega sozinho.
- **Relatórios em PDF** (aba Relatórios, período = mês escolhido nas setas do topo):
  - Resumo do mês: entradas, saídas, gastos por categoria com orçamento e saldos das contas.
  - Lançamentos do mês: lista completa, em paisagem.
  - Extrato de conta bancária: saldo anterior, movimentos com saldo corrido, saldo final e previstos.
  - Contas a pagar e a receber: vencidas e próximos 60 dias.
  - Resumo anual: mês a mês com acumulado, e gastos por categoria no ano com média mensal.
  O gerador de PDF (jsPDF) é baixado na primeira vez que um relatório é gerado e fica guardado no aparelho.
- **Exportar CSV**: Relatórios > Dados > Exportar mês em CSV. O arquivo usa `;` e vírgula decimal e abre direto no Excel em português.

## Palavra do Dia

- **Card no Resumo**: mostra um versículo por dia, com tema, referência e botão de compartilhar.
- **Lista curada** em `palavra.json`: 366 referências (uma por dia, incluindo 29/02), sem repetição no ano, em 14 temas (fé, confiança, sabedoria, família, provisão, trabalho, disciplina, gratidão, paz, esperança, amor, perseverança, educação dos filhos e responsabilidade financeira). Cada item tem `data` (MM-DD), `referencia`, `livro` (código usado pela API), `capitulo`, `versiculos` e `tema`. O texto não fica guardado no arquivo.
- **Texto via API**: [bible-api.com](https://bible-api.com), tradução `almeida` (João Ferreira de Almeida, **domínio público**, uso comercial permitido). Para trocar a tradução, altere `api.traducao` em `palavra.json`; as opções estão em https://bible-api.com/data.
  - As versões ARC, ARA, NVI e NAA são protegidas por direitos autorais das editoras e não estão nessa API.
- **Conferência**: o app só mostra o texto quando o livro, o capítulo e cada versículo devolvidos pela API batem exatamente com a referência pedida, e a referência exibida é montada a partir do que a API devolveu. O texto não é alterado; só as quebras de linha são removidas. Todas as 366 referências foram conferidas contra o texto-fonte da tradução.
- **Cache e offline**: a API é consultada uma vez por dia. A mensagem fica guardada no aparelho; sem internet, aparece a última guardada com a data dela, e ao voltar a conexão o app busca a do dia.
- **Erros**: se a API estiver fora do ar, o card avisa sem inventar texto e tenta de novo depois (no máximo a cada 10 minutos, ou assim que a conexão voltar).
- **Trocar um versículo**: edite a linha do dia em `palavra.json` e suba o arquivo no GitHub; o código do app não muda.
