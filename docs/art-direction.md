# Direção de Arte — QueryGame

## Identidade Visual

**Estilo**: Cyberpunk Noir — interfaces escuras com acentos neon, tipografia monospace para código, gradientes sutis, glow effects em elementos interativos.

**Referências visuais**: Blade Runner 2049 + terminal hacker + UI de jogos como Hacknet/Uplink.

**Tipografia**:
- Código/Editor: `JetBrains Mono` ou `Fira Code` (ligatures)
- UI/Títulos: `Inter` ou `Space Grotesk` (geométrica, moderna)
- Display/Logo: Custom com efeito glitch neon

**Palette de Cores**:
```
Primary BG:    #0a0e1a (azul profundo quase preto)
Secondary BG:  #111827 (slate escuro)
Surface:       #1e293b (cards, modais)
Surface Hover: #334155 (hover states)

Cyan Neon:     #00f0ff (ações primárias, links, acertos)
Magenta Neon:  #ff00aa (destaque especial, boss fights)
Gold:          #ffd700 (XP, recompensas, estrelas)
Green Neon:    #00ff88 (sucesso, código correto)
Red Soft:      #ff4757 (erros, sem ser agressivo)

Text Primary:  #e2e8f0
Text Secondary:#94a3b8
Text Muted:    #64748b
```

---

## Assets e Prompts de Imagem

### 1. Background Principal (Dashboard)
- **Arquivo**: `bg-dashboard.png`
- **Diretório**: `/assets/backgrounds/`
- **Resolução**: 1920×1080 (desktop), gerar também 1080×1920 (mobile)
- **Formato**: PNG (sem transparência)
- **Prompt**:
```
Dark cyberpunk cityscape at night, viewed from a high-tech office window. 
Neon blue and magenta lights reflect off rain-soaked streets below. 
Holographic data streams float in the air. Digital grid overlay. 
Dark navy blue dominant color (#0a0e1a). Subtle purple fog. 
Style: digital art, cinematic, atmospheric, noir. 
No text, no UI elements. Subtle enough to work as app background.
Aspect ratio 16:9, high resolution.
```

### 2. Background Tela de Login
- **Arquivo**: `bg-login.png`
- **Diretório**: `/assets/backgrounds/`
- **Resolução**: 1920×1080
- **Formato**: PNG
- **Prompt**:
```
Dark cyberpunk terminal interface, centered glowing access panel. 
Matrix-style falling data characters in cyan (#00f0ff) on dark background (#0a0e1a).
Central circular holographic scanner/portal emitting soft cyan glow.
Futuristic authentication console aesthetic. 
Minimal, dark, atmospheric. Film noir lighting.
Style: digital art, sci-fi interface design, high contrast.
Aspect ratio 16:9, no text.
```

### 3. Background de Desafio (Editor)
- **Arquivo**: `bg-challenge.png`
- **Diretório**: `/assets/backgrounds/`
- **Resolução**: 1920×1080
- **Formato**: PNG
- **Prompt**:
```
Dark investigation room with multiple holographic screens showing data tables.
Cyan (#00f0ff) holographic displays floating in dark space (#0a0e1a).
Detective desk with glowing evidence files. Digital noir atmosphere.
Subtle grid pattern on floor. Volumetric light from screens.
Style: cyberpunk interior, digital art, moody, atmospheric.
Aspect ratio 16:9, no text, no characters.
```

### 4. Cards de Desafio
- **Arquivo**: `card-challenge-normal.png`, `card-challenge-hover.png`, `card-challenge-locked.png`, `card-challenge-completed.png`
- **Diretório**: `/assets/ui/`
- **Resolução**: 400×240
- **Formato**: PNG com transparência
- **Prompt (normal)**:
```
Futuristic holographic card/panel with thin cyan (#00f0ff) border glow.
Dark interior (#1e293b). Subtle circuit board pattern texture.
Rounded corners, slight 3D depth effect. Clean, minimal.
Style: sci-fi UI element, flat design with subtle glow effects.
400x240 pixels, transparent background, PNG.
```
- **Prompt (hover)**:
```
Same as normal but with stronger cyan glow on borders, 
slight magenta (#ff00aa) accent on one corner.
Interior slightly brighter (#334155). Energy/pulse effect on edges.
```
- **Prompt (locked)**:
```
Same card but desaturated, gray tones. 
Small holographic lock icon in center. 
Dim, inactive appearance. Borders dark gray.
```
- **Prompt (completed)**:
```
Same card but with green neon (#00ff88) border glow instead of cyan.
Small holographic checkmark. Gold (#ffd700) star accent in corner.
Triumphant, accomplished feel.
```

### 5. Botões

#### Botão Normal
- **Arquivo**: `btn-primary.svg`
- **Diretório**: `/assets/ui/`
- **Formato**: SVG (escalável)
- **Design**: Retângulo com cantos arredondados (8px), background cyan (#00f0ff), texto dark (#0a0e1a). Borda sutil 1px mais clara. Sombra glow cyan suave.

#### Botão Hover
- **Arquivo**: `btn-primary-hover.svg`
- **Design**: Mesmo que normal, glow mais intenso, background levemente mais claro (#33f3ff). Box-shadow expandido.

#### Botão Disabled
- **Arquivo**: `btn-disabled.svg`
- **Design**: Background #334155, texto #64748b, sem glow, sem sombra. Aparência "apagada".

#### Botão Secundário
- **Arquivo**: `btn-secondary.svg`
- **Design**: Background transparente, borda 1px #00f0ff, texto #00f0ff. Hover: background #00f0ff10.

**Nota**: Botões serão implementados em CSS/Tailwind no MVP. SVGs servem como referência de design.

### 6. Ícones

Todos os ícones: **24×24 e 32×32**, formato **SVG**, estilo **outline com glow neon**.

| Ícone | Arquivo | Cor | Prompt |
|-------|---------|-----|--------|
| XP | `icon-xp.svg` | Gold #ffd700 | `Minimalist star/diamond icon, golden glow, outline style, cyberpunk, 32x32, SVG, transparent background` |
| Erro | `icon-error.svg` | Red #ff4757 | `Minimalist X/cross icon, soft red glow, outline style, cyberpunk, 32x32, SVG, transparent background` |
| Acerto | `icon-success.svg` | Green #00ff88 | `Minimalist checkmark icon, neon green glow, outline style, cyberpunk, 32x32, SVG, transparent background` |
| Ranking | `icon-ranking.svg` | Cyan #00f0ff | `Minimalist trophy/podium icon, cyan neon glow, outline style, cyberpunk, 32x32, SVG, transparent background` |
| Streak | `icon-streak.svg` | Orange #ff6b35 | `Minimalist flame icon, orange-to-red gradient glow, outline style, cyberpunk, 32x32, SVG, transparent background` |
| Moeda | `icon-coin.svg` | Gold #ffd700 | `Minimalist hexagonal coin icon, golden glow, cyberpunk data currency style, 32x32, SVG, transparent background` |
| Lock | `icon-lock.svg` | Gray #64748b | `Minimalist padlock icon, dim gray, no glow, outline style, 32x32, SVG, transparent background` |
| Database | `icon-database.svg` | Cyan #00f0ff | `Minimalist database/cylinder icon, cyan neon glow, outline style, cyberpunk, 32x32, SVG, transparent background` |
| Hint | `icon-hint.svg` | Magenta #ff00aa | `Minimalist lightbulb icon, magenta neon glow, outline style, cyberpunk, 32x32, SVG, transparent background` |

### 7. Avatares

- **Diretório**: `/assets/avatars/`
- **Resolução**: 128×128
- **Formato**: PNG com transparência
- **Quantidade**: 8 avatares base

| Avatar | Arquivo | Prompt |
|--------|---------|--------|
| Detetive Clássico | `avatar-detective.png` | `Cyberpunk detective portrait, trench coat, holographic monocle, cyan neon highlights, dark background, anime-inspired style, 128x128, circular crop friendly` |
| Hacker | `avatar-hacker.png` | `Cyberpunk hacker portrait, hood up, glowing green eyes, data streams reflected on face, dark background, anime-inspired, 128x128` |
| Analista | `avatar-analyst.png` | `Corporate cyberpunk data analyst, sleek glasses with HUD overlay, professional, magenta accent lighting, dark background, 128x128` |
| Agente | `avatar-agent.png` | `Cyberpunk secret agent, dark suit, holographic badge, blue neon accents, mysterious, dark background, 128x128` |
| Robô | `avatar-robot.png` | `Friendly cyberpunk robot/android, glowing cyan eyes, metallic surface, data patterns, dark background, 128x128` |
| Cientista | `avatar-scientist.png` | `Cyberpunk data scientist, lab coat with neon trim, holographic clipboard, purple accents, dark background, 128x128` |
| Ninja | `avatar-ninja.png` | `Cyberpunk data ninja, dark mask, glowing red visor, stealth aesthetic, dark background, 128x128` |
| Capitão | `avatar-captain.png` | `Cyberpunk investigation captain, badges, gold accents, commanding presence, dark background, 128x128` |

### 8. Barra de XP / Progresso

- **Arquivo**: `xp-bar-bg.svg`, `xp-bar-fill.svg`
- **Diretório**: `/assets/ui/`
- **Formato**: SVG (escalável horizontalmente)
- **Design**:
```
Background: rounded rectangle, #1e293b, height 12px, subtle inner shadow
Fill: gradient left-to-right #00f0ff → #ff00aa, rounded, glow effect
Animated: pulse/shimmer effect on the fill edge (CSS)
```

- **Prompt para referência visual**:
```
Futuristic progress bar UI element, horizontal, dark background (#1e293b).
Fill gradient from cyan (#00f0ff) to magenta (#ff00aa).
Subtle glow on the filled portion. Rounded ends.
Clean, minimal, sci-fi game UI style. Transparent background.
```

### 9. Sprites para Animações

#### Acerto (Success)
- **Arquivo**: `sprite-success.png`
- **Diretório**: `/assets/sprites/`
- **Resolução**: 512×64 (sprite sheet: 8 frames de 64×64)
- **Formato**: PNG com transparência
- **Prompt**:
```
Sprite sheet animation, 8 frames horizontal, 64x64 each.
Holographic checkmark appearing with neon green (#00ff88) particle burst.
Frame 1: empty. Frame 2-3: particles gathering. Frame 4-5: checkmark forming.
Frame 6-7: full checkmark with glow. Frame 8: glow fading.
Cyberpunk style, transparent background. Total size 512x64.
```

#### Erro (Failure)
- **Arquivo**: `sprite-error.png`
- **Diretório**: `/assets/sprites/`
- **Resolução**: 512×64 (8 frames de 64×64)
- **Formato**: PNG com transparência
- **Prompt**:
```
Sprite sheet animation, 8 frames horizontal, 64x64 each.
Holographic X/cross appearing with soft red (#ff4757) glitch effect.
Frame 1: empty. Frame 2-3: glitch distortion. Frame 4-5: X forming with static.
Frame 6-7: full X. Frame 8: dissolving into particles.
Cyberpunk style, transparent background. Total size 512x64.
```

#### Level Up
- **Arquivo**: `sprite-levelup.png`
- **Diretório**: `/assets/sprites/`
- **Resolução**: 640×128 (5 frames de 128×128)
- **Formato**: PNG com transparência
- **Prompt**:
```
Sprite sheet animation, 5 frames horizontal, 128x128 each.
Holographic rank badge upgrade effect. Gold (#ffd700) and cyan (#00f0ff) energy.
Frame 1: old badge dissolving. Frame 2: energy vortex. Frame 3: new badge forming.
Frame 4: full new badge with burst. Frame 5: settled with subtle glow.
Cyberpunk style, transparent background. Total size 640x128.
```

#### XP Gain
- **Arquivo**: `sprite-xp-gain.png`
- **Diretório**: `/assets/sprites/`
- **Resolução**: 384×48 (8 frames de 48×48)
- **Formato**: PNG com transparência
- **Prompt**:
```
Sprite sheet animation, 8 frames horizontal, 48x48 each.
Floating "+XP" text with golden (#ffd700) particles rising upward.
Frame 1: numbers appearing. Frame 2-4: rising with particle trail.
Frame 5-7: fading while still rising. Frame 8: fully faded.
Cyberpunk style, transparent background. Total size 384x48.
```

---

## Estrutura de Pastas Final

```
/assets
├── /backgrounds
│   ├── bg-dashboard.png        (1920×1080)
│   ├── bg-login.png            (1920×1080)
│   └── bg-challenge.png        (1920×1080)
├── /ui
│   ├── card-challenge-normal.png   (400×240)
│   ├── card-challenge-hover.png    (400×240)
│   ├── card-challenge-locked.png   (400×240)
│   ├── card-challenge-completed.png(400×240)
│   ├── btn-primary.svg
│   ├── btn-primary-hover.svg
│   ├── btn-secondary.svg
│   ├── btn-disabled.svg
│   ├── xp-bar-bg.svg
│   └── xp-bar-fill.svg
├── /icons
│   ├── icon-xp.svg             (24×24, 32×32)
│   ├── icon-error.svg
│   ├── icon-success.svg
│   ├── icon-ranking.svg
│   ├── icon-streak.svg
│   ├── icon-coin.svg
│   ├── icon-lock.svg
│   ├── icon-database.svg
│   └── icon-hint.svg
├── /sprites
│   ├── sprite-success.png      (512×64, 8 frames)
│   ├── sprite-error.png        (512×64, 8 frames)
│   ├── sprite-levelup.png      (640×128, 5 frames)
│   └── sprite-xp-gain.png      (384×48, 8 frames)
└── /avatars
    ├── avatar-detective.png    (128×128)
    ├── avatar-hacker.png
    ├── avatar-analyst.png
    ├── avatar-agent.png
    ├── avatar-robot.png
    ├── avatar-scientist.png
    ├── avatar-ninja.png
    └── avatar-captain.png
```

---

## Notas de Implementação para MVP

No MVP, assets de imagem serão substituídos por:
- **Backgrounds**: Gradientes CSS + padrões SVG procedurais
- **Cards**: Componentes Tailwind com border-glow via CSS
- **Ícones**: Lucide React (icon library) com cores da palette
- **Avatares**: Iniciais do usuário com fundo colorido (placeholder)
- **Sprites/Animações**: CSS animations + Framer Motion
- **Barra de XP**: CSS gradient com animação

Os prompts acima servem para gerar assets finais quando o projeto evoluir além do MVP.
