---
id: "REP-003"
title: "Esteira de Vídeo com IA: Aprendizados para Skills do conn2flow-home"
status: "READY_FOR_ARCHITECT"
date: "2026-10-30"
author: "executor"
target_repo: "conn2flow-ai-workspace, conn2flow-home, conn2flow-mkt"
summary_short: "Aprendizados da produção do promo-02 e proposta de skills de vídeo para instalar com o conn2flow-home."
---

# REP-003 — Esteira de Vídeo com IA: Aprendizados para Skills do conn2flow-home

- **Para**: Macro-Arquiteto do `conn2flow-ai-workspace`
- **Origem**: REQ-009A a REQ-009D do `conn2flow-mkt`, executadas em 2026-10-30
- **Pedido do Otávio**: transformar esta esteira em skills. Quem tiver o `conn2flow-home` instalado recebe as skills e as ferramentas de vídeo.
- **Decisão necessária**: definir nomes, escopo e localização final. Este relatório é entrada para isso, não uma especificação.

---

## 1. Resultado

Produzimos dois vídeos verticais de 60 s, em PT e EN, 1080×1920, com animação gerada por IA, logo e títulos 3D reais, legendas e locução neural. O Otávio aprovou o estilo e a voz em PT. A nova versão EN ainda aguarda audição dele.

Arquivos de referência em `conn2flow-mkt/content/video-assets/promo-02-wan-vertical/`:

| Peça | Papel |
|---|---|
| `production/wan_client.py` | Envia um clipe ao ComfyUI local ou remoto e mede o resultado |
| `production/run_clips.py` | Fila retomável, com tomadas encadeadas |
| `production/titles3d.py` | Títulos 3D com fundo transparente |
| `production/captions.py` | Legendas a partir do roteiro e dos tempos da fala |
| `production/regen_en_audio.py` | Locução frase a frase, com cortes por cena |
| `production/build_masters.py` | Normaliza, emenda, sobrepõe títulos |
| `production/assemble.py` | Montagem e render no VSE do Blender |
| `production/verify_renders.sh` | Validação técnica e folha de quadros |
| `scripts/runpod_gpu.py` | Cria e destrói GPU, com tempo máximo |
| `scripts/fal_video.py` | Cliente de API com simulação, teto e registro de gasto |

## 2. Pipeline validado

1. Roteiro e locução por cena.
2. Keyframes verticais sem texto, feitos pelo agente de imagens (GPT).
3. Clipes no Wan 2.2 14B com LoRA Lightx2v de 4 passos, via ComfyUI.
4. Tomadas encadeadas: último quadro vira a entrada da tomada seguinte.
5. Títulos 3D renderizados com transparência no Blender.
6. Masters em 1080×1920 e 24 fps, um por corte.
7. Montagem com legendas no VSE, por script.
8. Validação técnica, revisão de quadros e homologação humana.

**Padrão do Otávio:** Q4 em 480×848 para o dia a dia, e Q8 em 720×1280 para vídeos especiais. Modelos abertos em GPU alugada são a fase atual; APIs fechadas ficam para depois.

## 3. O que funcionou

- **Separar imagem e informação.** O modelo de vídeo gera ambiente; Blender cuida de texto, logo e impacto.
- **Testar uma cena antes da fila.** Três modelos e dois modos mudaram a decisão antes de gastar horas.
- **Primeiro e último quadro iguais.** Preserva interface e ícones, mas reduz o movimento.
- **Fila retomável e registro por clipe.** Queda de ComfyUI não perdeu trabalho.
- **Interface local + GPU remota por túnel SSH.** O mesmo script serve às duas, trocando só a URL.
- **Locução frase a frase.** Evita falhas do texto único e entrega os cortes exatos.

## 4. O que deu errado

| Problema | Causa | Regra para a skill |
|---|---|---|
| Modelo pedido não existia | Briefing citou `Wan2.1_I2V_480P_1.3B` e tamanhos errados | Conferir pesos na fonte antes de agir |
| Texto e logo derreteram | Modelo de vídeo deforma letras | Proibir texto em keyframes |
| Falta de memória com VRAM livre | Carregador dinâmico novo do ComfyUI | Em 8 GB no WSL, usar `--disable-dynamic-vram --disable-cuda-malloc --lowvram --reserve-vram 1.0` |
| ComfyUI morto por OOM em 16 GB | Cache de modelos | Adicionar `--cache-none` |
| Windows sem memória | WSL em 22 GB mais programas abertos | Medir commit do Windows e usar o menor perfil possível |
| Blender caiu | Rodou com o Windows no limite de memória | Não renderizar durante pressão de memória |
| GPU a 85 °C e ruído alto | Fluxo de ar ruim e alvo térmico da placa | Avisar antes de longas filas locais |
| Áudio EN com corte e troca de voz | Texto inteiro em uma chamada | Gerar por frase e sempre transcrever de volta |
| Whisper errou a marca | Termos próprios | Legendas vêm do roteiro, nunca da transcrição |
| Ícones viraram outras formas | Estilo livre em cena com muitos ícones | Oferecer modo travado para cenas densas |
| Painel partido em 720p | Variação da seed | Gerar mais de uma tentativa em cenas com logo |
| Cloudflare recusou API | User-Agent padrão do Python | Definir User-Agent próprio |
| Filtros do ffmpeg quebrados | Shell do `wsl.exe` | Usar `wsl.exe --exec` |
| `wait` travou o setup do Pod | Processo de substituição no bash | Esperar por PID |
| Serviços não voltaram | `wsl --shutdown` também derruba Lab, túnel e ComfyUI | Reiniciar pelo perfil do painel |

## 5. Medições

| Configuração | Tempo por clipe de 5 s | Custo |
|---|---|---|
| RTX 3050, Q4, 480×848 | 526–600 s | Só energia, com ruído alto |
| RTX A5000, Q4, 480×848 | 155 s | US$ 0,012 |
| RTX A5000, Q4, 720×1280 | 424 s | US$ 0,032 |
| RTX A5000, Q8, 720×1280 | 591 s | US$ 0,044 |

O Pod ficou 49 minutos ligado, por cerca de US$ 0,22. A preparação do zero levou cerca de 15 minutos; os pesos baixaram em menos de 2 minutos.

**Decisão do Otávio:** não manter volume persistente. Recriar a máquina custa cerca de US$ 0,07 por sessão, enquanto 50 GB de volume custariam cerca de US$ 3,50 por mês. O volume só compensaria com cerca de 50 sessões por mês. A skill deve automatizar o ciclo completo.

## 6. Proposta de skills

| Skill | Responsabilidade |
|---|---|
| `c2f-video-pipeline` | Orquestra o fluxo, escolhe modo e gate de homologação |
| `c2f-video-gpu-runpod` | Liga, prepara, usa e destrói GPU; custo e proteção |
| `c2f-comfyui-wan` | Workflows, parâmetros, prompts e diagnóstico |
| `c2f-video-keyframes` | Prompt e handoff para o agente de imagens, sem texto |
| `c2f-video-audio` | Locução por frase, transcrição de conferência e legendas |
| `c2f-blender-video` | Títulos 3D, montagem e bridge ao vivo |
| `c2f-video-qa` | Validação técnica, folha de quadros e checklist humano |

Regras que devem ser mandatórias:

1. Sempre destruir a GPU e confirmar pela API.
2. Exibir custo antes e depois de gerar.
3. Chaves apenas em `.env`, nunca na conversa.
4. Nada de publicação sem homologação humana.
5. Conferir a licença comercial antes de adotar modelo novo.
6. Usar `Conn2Flow-Lab` e demais serviços locais só com a ciência de que `wsl --shutdown` os reinicia.

## 7. Proposta para o conn2flow-home

- Empacotar as ferramentas e skills, ou instalá-las como módulo opcional.
- Instalar o perfil de RAM do WSL. Hoje o controle está em `conn2flow-stack/control/`, fora do git, com script em `C:\Users\otavi\scripts\wsl_memory_profile.ps1`.
- O `Conn2Flow Blender Bridge` agora é versionado em `conn2flow-home/tools/blender-bridge/`, com comandos 3D. O estúdio segue a REQ-010 daquele repositório. O servidor MCP citado no add-on não foi encontrado em nenhum repositório.
- Definir uma pasta de saída e um formato de projeto de vídeo por idioma.
- Documentar o pré-requisito de GPU local e a opção por GPU alugada.

## 8. Pontos abertos

- Testar LTX-2.3 e conferir sua licença.
- Automatizar o ciclo ligar, preparar, gerar, baixar e destruir em um comando.
- Cena 07 no EN ficou 1,55× mais lenta; avaliar segunda tomada.
- REQ-010 (Blender ao vivo) está pronta, aguardando o bridge ser ligado.
- BL-MKT-016 e BL-MKT-018 tratam de APIs e agendamento com n8n.
- A coluna de custo da RTX 3050 não inclui energia.
- Música e efeitos sonoros licenciados ainda não fazem parte da esteira.
