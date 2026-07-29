# Fight Turn — protótipo 2D

Protótipo local, somente para desktop, com dois jogadores no mesmo teclado.
O pacote `Animated Prototype Character.zip` foi extraído e suas 223 imagens
foram integradas ao jogo.

## Como abrir

No Windows, dê dois cliques em `INICIAR-JOGO.bat`. O servidor local será aberto
em uma janela e o jogo aparecerá no navegador padrão. Para encerrar, feche a
janela do servidor ou pressione `Ctrl + C` nela.

Também é possível iniciar pelo terminal:

```powershell
npm install
npm run dev
```

Depois, abra `http://localhost:3000/`.

## Controles

| Ação | Jogador 1 | Jogador 2 |
|---|---|---|
| Andar | `A` / `D` | `←` / `→` |
| Correr | `Shift esquerdo` + direção | `Shift direito` + direção |
| Pular | `W` | `↑` |
| Deslizar | `S` | `↓` |
| Rolar | `Q` | `Numpad 0` |
| Soco / desarmado | `J` | `Numpad 1` |
| Espada | `K` | `Numpad 2` |
| Pistola | `L` | `Numpad 3` |
| Rifle | `I` | `Numpad 5` |
| Super (barra cheia) | `U` | `Numpad Enter` |
| Reiniciar luta | `R` | `R` |

O Jogador 2 também pode usar `0`, `1`, `2`, `3`, `5` e `Enter` na fileira
numérica quando o teclado não tiver numpad.

## Regras do protótipo

- A luta começa com 100 pontos de vida, barra de super vazia e 60 segundos.
- Os ataques enchem as barras de super de quem acerta e de quem recebe o golpe.
- O super reutiliza o ataque da arma equipada, causa dano dobrado e consome a
  barra cheia.
- A luta termina por nocaute ou pelo cronômetro. `R` recomeça imediatamente.
- O Jogador 2 fica parado até alguém usar os controles dele.

## Assets

Os quadros originais, a licença e os links do autor estão em
`public/assets/animated-prototype-character/`. O arquivo `manifest.json` nessa
pasta documenta todos os conjuntos, animações, contagens e mapeamentos.

O pacote é CC0. `damage` foi mapeado para `hit`; o ataque desarmado foi mapeado
como soco. O ZIP não contém animações chamadas `drop`, `special` ou `ultimate`,
então nenhum quadro inexistente foi inventado.
