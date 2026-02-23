# ⭐ StarKid — Game Design Specification
**Version 1.2 | Web Browser Game**

---

## Concept

You are a normal kid — curious, a little scrappy — wearing a homemade spacesuit cobbled together from scrap metal and salvaged parts. You've launched yourself into space not to rescue anyone, but to *find* something: a way to exist in your truest form.

**StarKid** is already there. He's not lost — he's home. He exists in deep space in his purest, most magical state, and he always has. The journey is yours. When you collect the full rainbow spectrum of stars and reach StarKid, you don't rescue him — you *reach* him. And in his company, magic happens. You get to ask him one question.

---

## Core Gameplay Loop

The player flies their astronaut kid freely through a scrolling space world, collecting floating stars in 7 rainbow colors. Stars drift, pulse, or float through the environment. The player guides the astronaut toward them to collect on contact. There are no enemies — just the vastness of space and the occasional hazard standing between you and the stars.

When the player has collected **10 of every color** (70 stars total), StarKid appears. The player flies to StarKid, the reunion happens, and the game ends in a warm win state.

---

## Player Character

**The Astronaut Kid** is a normal kid in a homemade spacesuit assembled from scrap metal and salvaged tech — mismatched panels, rivets, glowing gauges, a round helmet with goggles perched on top. On their back: a jetpack with exposed gears and tubing, also clearly improvised, with little bursts of flame or exhaust when they move. Scrappy, endearing, unmistakably a kid who built this thing themselves and flew into the stars anyway.

The astronaut uses a custom hand-drawn sprite (`public/assets/astronaut.png`, 64x96px) rendered in a warm sepia-toned illustration style with visible pen strokes and cross-hatching. The sprite has a transparent background and is loaded at boot, overriding the programmatic fallback texture.

---

## Controls

- **Keyboard:** Arrow keys or WASD to fly in all directions
- **Mouse/Trackpad:** Click or tap to set destination / guide movement
- Both input methods work simultaneously

---

## World Structure

A **single scrolling screen world** — the player moves through space and the environment scrolls around them. The world is large enough to explore but not overwhelming. Stars are distributed throughout the scrollable space, not locked to any single area.

A large planet sits at the bottom of the world with an atmospheric glow (translucent blue/cyan arc halos) that makes it visually prominent against the dark space. The player can fly down and visually touch the planet's surface — the constraint boundary accounts for the astronaut's sprite height so the boots meet the planet edge.

---

## Star System

There are **7 rainbow star colors**, each corresponding to a color of the visible spectrum, plus a large number of **generic golden bonus stars**:

| Color | Rarity |
|---|---|
| Red | Common |
| Orange | Common |
| Yellow | Common |
| Green | Uncommon |
| Blue | Uncommon |
| Indigo | Rare |
| Violet | Rare |
| **Gold** | **Abundant (bonus)** |

Common stars appear frequently and in clusters. Uncommon stars are scattered individually. Rare stars are sparse — maybe drifting in hard-to-reach pockets of the map or hidden behind hazards.

**Gold stars** (~200) are scattered abundantly throughout the world. They are collectible and produce a subtle pickup effect and soft ping sound, but they **do not count toward spectrum progress**. They make the world feel alive with things to gather while searching for the colored stars that matter.

Each star color glows softly with its own light. Collecting a colored star produces a bright, short bell-like ping chime with reverb. Collecting a gold star produces a softer, quieter ping.

---

## HUD / Progress Tracker

A **rainbow spectrum tracker** runs along the bottom of the screen — a horizontal band divided into 7 color segments, each with a fill level that rises as the correct colored stars are collected. Think of it like a stained glass window slowly coming to life, one color at a time.

Each segment fills with glowing color as progress is made — **no numbers are shown**, just visual progress bars. When a color completes, it locks in with a soft pulse of light and a chime — the segment stays fully lit and vibrant for the rest of the run. When all 7 segments are full and glowing, the tracker itself blooms — a visual signal that the full spectrum is complete and StarKid is reachable. A subtle "spectrum" label sits above the bar.

No score, no timer. The tracker is the only UI element that matters.

---

## Hazards

No enemies. Hazards are **environmental** — things that exist naturally in space:

- **Asteroid fields** — drifting rocks that push the player back or briefly stun them
- **Black hole pull zones** — areas that drag the astronaut if they get too close
- **Nebula fog patches** — visibility reduced, harder to spot stars
- **Solar flares** — brief bursts of light/energy that temporarily disorient (yellow flash overlay and slowed movement, no camera shake)

Hazards don't kill the player. They slow, push, or impede — maintaining the calm, exploratory tone.

---

## Win Condition

When all 70 stars are collected (10 × 7 colors):

1. The spectrum tracker blooms fully — all 7 colors radiant and complete
2. **StarKid materializes** in the world — not appearing out of nowhere, but becoming *visible*, as if he was always there and you can finally see him. He glows with a warm, golden light — all gold, not rainbow.
3. The player flies to StarKid
4. On contact: a gentle win animation — the two exist together in space, colors swirling softly around them
5. Then: **the question moment**

### The Question

A simple, beautiful input appears:

> *"You've found StarKid. You may ask him one question."*

The player types anything they want. StarKid answers. This is powered by the Claude API — StarKid has a defined voice: wise, warm, a little cosmic, never condescending. He speaks to you like you're already capable of understanding the answer. He exists in his truest form, and for this moment, so do you.

Certain special questions trigger **easter egg responses** — predefined answers that bypass the API and deliver hand-crafted StarKid moments. These are matched by keyword patterns before the API is called.

### The Rainbow Slide (Friend Easter Egg)

If the player asks about friendship (e.g., "can we be friends?"), the question UI dismisses and a **playable rainbow slide** begins. A wide, thick rainbow arc (7 color bands) scrolls slowly across the screen while StarKid and the astronaut ride along it. The player controls the astronaut with arrow keys/WASD — speeding up and slowing down along the rainbow path with momentum-based surfing physics. StarKid slides ahead at a steady pace.

As the rainbow plays, it **lights up the universe**: the dark background gradually brightens, faint twinkle stars fade in, and the rainbow casts a soft additive glow into the surrounding space. The astronaut bobs and tilts based on velocity, and sparkle particles intensify when moving fast.

The answer appears on screen. There is no next level. The game ends here, in this exchange.

---

## Visual Style

**Minimalist/clean space aesthetic** with layered environments featuring irregular, geometric shapes rather than soft circular bokeh:

- **Background layer:** Deep black space with a mixed star field — small dots, tiny crosses, diamonds, and triangles at varying sizes and brightnesses. Less uniform and circular than traditional bokeh.
- **Mid layer:** Nebula clouds formed from irregular polygon shapes — organic-geometric forms rather than perfectly circular blobs. Translucent purples, blues, and pinks that drift slowly.
- **Geometric layer:** Scattered faint geometric shapes (hexagons, triangles, thin diamonds) floating at low alpha with their own parallax depth, adding visual complexity.
- **Foreground/gameplay layer:** Clean, simple character and star designs — bold outlines, flat colors, minimal detail except on the astronaut character

StarKid's glow is **all gold** — warm golden light, not rainbow. The aura, particles, and glow effects around StarKid use gold shades exclusively.

The overall palette is dark with vivid pops of color from the rainbow stars and nebulae. UI is minimal and never cluttered.

### Sprite Assets

Sprites support both programmatic generation (fallback) and external image assets. Image files placed in `public/assets/` are loaded at boot and take priority over programmatic textures. This allows incremental replacement of generated sprites with hand-crafted artwork.

| Sprite | Status | Source |
|---|---|---|
| Astronaut (player) | Custom asset | `public/assets/astronaut.png` (64x96px, hand-drawn illustration) |
| StarKid | Programmatic | Generated at boot (`src/utils/sprites.ts`) |
| Stars (7 colors + gold) | Programmatic | Generated at boot |
| Asteroids (sm/md/lg) | Programmatic | Generated at boot |
| Black hole | Programmatic | Generated at boot |
| Nebula | Programmatic | Generated at boot |
| Particles / Exhaust | Programmatic | Generated at boot |

---

## Audio

**Galaxy-style ambient space music** — a multi-layered synthesized soundscape with an ethereal, cosmic quality. Multiple detuned oscillators create deep pad textures, with higher shimmer voices (220 Hz, 330 Hz, 880 Hz) adding sparkle. A slow LFO modulates the sound for organic movement, and gentle arpeggiated patterns with heavy reverb evolve over time. A high-frequency shimmer oscillator with tremolo creates a subtle twinkling backdrop. The tone is vast, galaxy-like, and unhurried.

The music evolves as the spectrum fills — as more colors are collected, new harmonic layers and oscillator voices are added, so the arrangement genuinely grows richer. The universe wakes up with you. The reverb is wide (3.5s decay) to evoke the spaciousness of the cosmos.

Sound effects are soft and satisfying:
- **Colored star collect**: Short, bright, bell-like ping chime — a sharp sine attack with overtone harmonics (3rd and 5th) for metallic ring, fast decay (~0.5s), heavy reverb send to let the ping ring out in space. Each color has its own pitch.
- **Gold star collect**: A softer, quieter single ping (~0.3s) at a fixed pitch, subtle enough to not overwhelm when collecting many.
- Gentle jetpack whoosh on movement
- Full orchestral swell when StarKid becomes visible
- A quiet, held chord during the question moment — space for thought

Audio files (`.mp3`/`.ogg`) can be placed in `public/assets/audio/` and loaded at boot for higher-fidelity music when available.

---

## Debug / Cheat Codes

A debug cheat code allows instant collection of all stars for testing purposes. Typing the sequence **S-T-A-R-S** during gameplay fills all 7 spectrum colors to 10/10 and triggers the StarKid appearance, allowing quick access to the win state and question moment.

---

## Out of Scope (v1)

- No save system (single session play)
- No leaderboard or scoring
- No multiple levels
- No enemies
- No dialogue or story text beyond the win screen

## In Scope (previously listed as out of scope)

- **StarKid question (win condition):** When the win condition is met, the player types a free-form question and StarKid answers via the Claude API. StarKid's voice/persona needs to be defined as a system prompt — wise, warm, cosmic, speaks to the player as an equal. This is a core feature, not an add-on.

---

## Summary Table

| Element | Decision |
|---|---|
| Platform | Web browser |
| Controls | Keyboard + Mouse/Touch |
| World | Single scrolling space map |
| Goal | Collect 10 of each of 7 rainbow star colors |
| Obstacles | Environmental hazards only |
| Win state | Reach StarKid |
| Pressure | None — relaxed exploration |
| Visual style | Minimalist clean + irregular geometric shapes + nebula clouds |
| Character | Steampunk scrap-metal child astronaut |
| Audio | Rich multi-layer ambient space soundscape |
| Debug | Cheat code (S-T-A-R-S) for instant star collection |
