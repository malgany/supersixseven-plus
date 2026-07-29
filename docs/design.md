# Guia de design — Fight Turn

> Fonte de verdade visual para designers, desenvolvedores e agentes de IA.
> Antes de criar ou alterar telas, HUD, menus, modais, cenários ou efeitos,
> consulte este documento e preserve as decisões marcadas como obrigatórias.

**Status:** direção atual aprovada  
**Plataforma:** desktop  
**Formato principal:** arena 2D em 16:9, com resolução lógica de `1280 × 720`  
**Última atualização:** 29 de julho de 2026

## 1. Visão do produto

Fight Turn é um protótipo de luta local para dois jogadores no mesmo teclado.
A apresentação deve comunicar imediatamente três ideias:

1. jogo de luta arcade;
2. desenho animado com humor e energia;
3. instalação industrial perigosa, mas divertida.

O jogo não deve parecer uma simulação realista, uma arena 3D ou uma interface
militar séria. A prioridade é leitura rápida, personalidade e contraste.

## 2. Princípios obrigatórios

- **Cartunesco antes de realista:** formas simplificadas, proporções exageradas,
  contornos pretos grossos e cores chapadas.
- **Legibilidade antes de detalhe:** jogadores, barras e mensagens precisam ser
  entendidos em menos de um segundo.
- **Arcade antes de aplicativo:** a interface deve parecer parte de um jogo,
  não um dashboard ou painel administrativo.
- **Centro livre:** cenários não podem competir com os lutadores.
- **Hierarquia forte:** vida e tempo têm prioridade; super, arma e comandos são
  secundários.
- **Assimetria controlada:** o cenário pode ter objetos diferentes nas laterais,
  mas a área de combate deve permanecer equilibrada.
- **Desktop primeiro:** não criar decisões de mobile para este protótipo.

## 3. Direção de arte

### 3.1 Linguagem visual

Usar uma estética de desenho animado 2D inspirada na energia de animações
clássicas de comédia física, sem copiar personagens, cenários ou composições
existentes.

Características desejadas:

- linhas pretas espessas e ligeiramente irregulares;
- volumes indicados por duas ou três massas de cor;
- pintura chapada com textura sutil de guache ou papel;
- portas, barris, placas e caixas com proporções caricatas;
- rachaduras e desgaste desenhados, sem textura fotográfica;
- sombras curtas e simples;
- elementos industriais grandes e fáceis de reconhecer;
- sensação divertida e perigosa ao mesmo tempo.

### 3.2 Evitar

- fotorealismo;
- concept art industrial cinematográfica;
- render 3D, isométrico ou com perspectiva profunda;
- materiais metálicos excessivamente detalhados;
- iluminação volumétrica realista;
- excesso de objetos no centro;
- estética anime;
- símbolos, personagens, marcas ou cenários copiados de outras propriedades.

## 4. Paleta de cores

As cores abaixo são os tokens atuais e devem ser reutilizadas antes de criar
novas variações.

| Token | Cor | Uso |
|---|---:|---|
| Fundo | `#080706` | Exterior da arena e fundos profundos |
| Texto principal | `#FFF7E6` | Texto claro, números e títulos |
| Tinta | `#080808` | Contornos, placas e sombras duras |
| P1 Âmbar | `#FF9F1C` | Identidade, golpes e detalhes do Jogador 1 |
| P1 claro | `#FFE06A` | Destaques e vida do Jogador 1 |
| P2 Ciano | `#1EBCE8` | Identidade, golpes e detalhes do Jogador 2 |
| P2 claro | `#AAF3FF` | Destaques e vida do Jogador 2 |
| Perigo | `#F8C126` | Faixas, chamadas e informação importante |
| Alerta | `#FF4038` | Urgência, sombra do tempo e final de round |
| Texto secundário | `#B8B0A4` | Legendas e informações de menor prioridade |

Regras:

- usar âmbar e ciano para diferenciar jogadores;
- usar amarelo de perigo para informação compartilhada;
- reservar vermelho para urgência, dano, tempo crítico ou encerramento;
- não introduzir roxo, rosa ou verde como cores dominantes;
- verde pode aparecer pontualmente em elementos de cenário, como saída de
  emergência.

## 5. Tipografia

### 5.1 Display arcade

Usar `Impact`, `Arial Black` ou equivalente pesado para:

- cronômetro;
- `LUTEM!`;
- `K.O.`;
- `TEMPO`;
- títulos curtos de alta prioridade.

Características:

- caixa alta;
- peso muito alto;
- contorno preto;
- sombra sólida vermelha ou escura;
- pouca ou nenhuma inclinação quando ela comprometer o alinhamento;
- números com largura tabular no cronômetro.

### 5.2 Interface técnica

Usar Geist Mono ou uma fonte monoespaçada equivalente para:

- nomes dos jogadores;
- armas;
- rótulos de vida e super;
- comandos;
- mensagens auxiliares;
- identificação do stage.

Características:

- caixa alta;
- espaçamento entre letras moderado;
- textos curtos;
- sem parágrafos longos dentro da arena.

## 6. Composição da arena

- Proporção obrigatória: `16:9`.
- Resolução lógica atual: `1280 × 720`.
- Linha de chão atual: `y = 570`.
- HUD no topo.
- Mapa de comandos no rodapé.
- Lutadores no terço central inferior.
- Manter pelo menos 55% do centro do cenário sem objetos altos.
- Concentrar caixas, portas, barris e placas nas laterais.
- A faixa superior do fundo deve ser mais calma e escura para receber o HUD.
- A plataforma deve ser plana, com uma borda frontal forte e faixas de risco.

O stage atual é `public/assets/stages/foundry-hazard-v2.png`.

### 6.1 Brief para novos stages

Ao gerar um novo cenário com IA, usar esta estrutura:

```text
Arena 2D cartunesca para jogo de luta, vista lateral reta em 16:9.
Contornos pretos grossos, cores chapadas, formas industriais caricatas,
textura sutil de pintura e centro amplamente livre para dois lutadores.
Objetos maiores apenas nas laterais. Faixa superior calma para o HUD.
Plataforma plana com borda de perigo.
Sem personagens, armas, interface, textos, números, logos ou marcas.
Evitar fotorealismo, concept art cinematográfica, render 3D e excesso de detalhe.
```

## 7. Personagens

- P1 usa tratamento âmbar; P2 usa tratamento ciano.
- O contorno e a silhueta do sprite original devem permanecer reconhecíveis.
- Glow é um reforço de identidade, não a principal forma de separar o
  personagem do fundo.
- Manter a sombra de contato simples e curta.
- Identificadores `P1` e `P2` devem ficar discretos acima dos personagens.
- Efeitos de dano podem aumentar brilho brevemente, sem apagar o sprite.
- Não redesenhar os sprites para combinar com um stage específico.

## 8. HUD de combate

### 8.1 Estrutura

O HUD tem três colunas:

1. Jogador 1;
2. cronômetro;
3. Jogador 2.

As placas laterais são escuras, angulares e espelhadas. O P1 cresce visualmente
da esquerda para o centro; o P2, da direita para o centro.

### 8.2 Vida

- É a barra mais alta e mais importante.
- Possui borda clara, contorno preto e fundo vermelho escuro.
- Exibe `VIDA` e o valor numérico.
- P1 usa gradiente laranja para amarelo.
- P2 usa gradiente azul para ciano.
- A redução deve ser contínua e facilmente percebida.

### 8.3 Super

- Barra mais fina, abaixo da vida.
- Exibe o rótulo `SUPER`.
- Mantém a cor de identidade do jogador.
- Quando chega a 100%, recebe pulso de brilho.
- O brilho não deve piscar rapidamente nem prejudicar a leitura.

### 8.4 Cronômetro

- Fica em uma placa própria no centro.
- `TEMPO` aparece como pequena etiqueta vermelha sobre a placa.
- `ROUND 01` é secundário.
- O número é o foco e deve permanecer centralizado para qualquer valor de dois
  dígitos.
- Usar algarismos tabulares, sem espaçamento negativo.
- O número não deve encostar nos limites da placa.
- Em tempo crítico, pode ganhar pulsação ou mudança para vermelho, sem mover a
  placa.

## 9. Estados e modais da luta

### 9.1 Carregamento

- Fundo muito escuro com faixas diagonais discretas.
- Spinner amarelo de perigo.
- Texto curto: `PREPARANDO A ARENA`.
- Mostrar progresso dos sprites.
- Não usar skeleton de aplicativo.

### 9.2 Início

- Exibir `LUTEM!` brevemente no centro.
- Tipografia display, amarela, contorno preto e sombra vermelha.
- A mensagem desaparece sem deixar uma placa permanente.

### 9.3 Nocaute

Ordem de informação:

1. `K.O.`;
2. vencedor;
3. instrução `PRESSIONE R PARA NOVA LUTA`.

Visual:

- faixa horizontal escura semitransparente;
- linhas amarelas grossas no topo e na base;
- título branco com contorno preto;
- resultado em amarelo;
- stage ainda reconhecível ao fundo.

### 9.4 Fim por tempo

Usar a mesma estrutura do nocaute, trocando o título por `TEMPO`.

Resultados possíveis:

- `TEMPO · ÂMBAR VENCE`;
- `TEMPO · CIANO VENCE`;
- `TEMPO · EMPATE`.

### 9.5 Reinício

- A tecla `R` reinicia imediatamente.
- Vida volta para 100.
- Super volta para 0.
- Tempo volta para 60.
- Armas voltam para punhos.
- Não exigir confirmação no protótipo atual.

## 10. Menus futuros

Os menus abaixo ainda não fazem parte do protótipo, mas devem seguir estas
regras quando forem criados.

### 10.1 Menu principal

Ordem recomendada:

1. `JOGAR`;
2. `CONTROLES`;
3. `OPÇÕES`;
4. `CRÉDITOS`.

Direção:

- título grande no terço superior;
- uma única coluna de botões;
- placa industrial escura com contorno grosso;
- botão selecionado em amarelo;
- pequenas faixas de risco como detalhe, não como fundo de todos os botões;
- stage ou ilustração cartunesca desfocada ao fundo.

### 10.2 Pausa

Ordem recomendada:

1. `CONTINUAR`;
2. `CONTROLES`;
3. `REINICIAR LUTA`;
4. `SAIR`.

Usar overlay escuro, mantendo a luta visível. A ação destrutiva `SAIR` ou
`REINICIAR LUTA` pode usar vermelho.

### 10.3 Confirmação

Modal compacto com:

- pergunta de uma linha;
- ação principal amarela;
- ação destrutiva vermelha;
- cancelar em cinza;
- foco inicial na opção segura.

Não usar caixas brancas genéricas ou diálogos nativos do navegador.

### 10.4 Tela de controles

- Separar P1 e P2 em duas placas espelhadas.
- Manter âmbar e ciano como identificadores.
- Teclas devem parecer keycaps físicos.
- Ação deve ficar abaixo ou ao lado da tecla, nunca dentro da mesma palavra.
- Informar alternativas numéricas do P2 quando não houver numpad.

## 11. Componentes de interface

### Botões

- caixa alta;
- contorno preto de 2 a 3 px;
- fundo escuro;
- recorte angular discreto;
- estado selecionado amarelo;
- deslocamento curto ou compressão ao pressionar;
- foco visível para teclado.

### Placas

- fundo preto, marrom muito escuro ou carvão;
- borda clara fina mais contorno preto;
- uma única cor de destaque;
- evitar transparência excessiva.

### Keycaps

- formato retangular compacto;
- borda inferior mais espessa;
- texto monoespaçado e pesado;
- contraste alto;
- sem aparência de botão clicável quando for apenas instrução.

## 12. Movimento e feedback

- Transições de HUD: entre 100 e 180 ms.
- Mensagens de round: entrada rápida, permanência curta e saída limpa.
- Super cheio: pulso suave entre 600 e 800 ms.
- Dano: flash curto, impacto e pequeno recuo.
- Evitar animações elásticas em barras de vida.
- Respeitar `prefers-reduced-motion`.
- Nenhum efeito deve atrasar a resposta aos controles.

## 13. Texto e tom

- Idioma principal: português do Brasil.
- Preferir palavras curtas e diretas.
- Usar caixa alta dentro da arena.
- Exemplos aprovados: `LUTEM!`, `VIDA`, `SUPER`, `TEMPO`, `ROUND 01`,
  `PRESSIONE R PARA NOVA LUTA`.
- Não usar texto explicativo longo durante a luta.
- Não misturar português e inglês sem motivo funcional.

## 14. Acessibilidade

- Contraste mínimo equivalente a WCAG AA para textos funcionais.
- Cor nunca deve ser o único indicador de jogador; usar também `P1`, `P2` e
  posição.
- Barras precisam manter `role="progressbar"` e valores acessíveis.
- Cronômetro deve possuir descrição em segundos.
- Resultados precisam ser anunciados por região viva.
- Todo menu futuro deve funcionar apenas com teclado.
- O foco deve ser sempre visível.
- Não usar flashes rápidos.

## 15. Checklist para alterações futuras

Antes de considerar uma mudança visual pronta, confirmar:

- [ ] continua parecendo desenho animado 2D;
- [ ] o centro da arena permanece livre;
- [ ] P1 e P2 continuam distinguíveis sem depender apenas da cor;
- [ ] vida e tempo são os elementos mais fáceis de localizar;
- [ ] números do cronômetro estão centralizados;
- [ ] textos estão em português e em caixa alta quando dentro da arena;
- [ ] modais não escondem completamente o stage;
- [ ] não foram introduzidos estilos realistas, 3D ou de dashboard;
- [ ] a interface funciona em `1280 × 720` e no mínimo desktop suportado;
- [ ] foco, contraste e movimento reduzido foram verificados;
- [ ] build local e build do GitHub Pages continuam funcionando.

## 16. Arquivos de referência

| Arquivo | Responsabilidade |
|---|---|
| `app/FightGame.tsx` | Estados, HUD, canvas, efeitos e mensagens de luta |
| `app/globals.css` | Tokens, tipografia, layout e componentes visuais |
| `public/assets/stages/foundry-hazard-v2.png` | Stage cartunesco atual |
| `public/assets/animated-prototype-character/manifest.json` | Inventário das animações |
| `static-site/` | Entrada estática usada pelo GitHub Pages |
| `.github/workflows/deploy-pages.yml` | Publicação do protótipo |

## 17. Registro de decisões

### 29 de julho de 2026

- Adotada direção de arte cartunesca em vez de concept art realista.
- Definida arena industrial em marrom, amarelo de perigo, âmbar e ciano.
- HUD atualizado para placas arcade angulares.
- Vida passou a ter número e rótulo visíveis.
- Super foi mantido como barra secundária fina.
- Cronômetro recebeu placa central própria e algarismos tabulares.
- Estados `LUTEM!`, `K.O.` e `TEMPO` receberam linguagem visual comum.
- Stage atual definido como `foundry-hazard-v2.png`.

