# ⭐ StarKid — Game Design Specification
**Version 1.0 | Web Browser Game**

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

**The Astronaut Kid** is a normal kid in a homemade spacesuit assembled from scrap metal and salvaged tech — mismatched panels, rivets, glowing gauges, a round helmet with a cracked visor. One tuft of hair pokes out through a gap in the helmet. On their back: a jetpack, also clearly improvised, with little bursts of flame or exhaust when they move. Scrappy, endearing, unmistakably a kid who built this thing themselves and flew into the stars anyway.

---

## Controls

- **Keyboard:** Arrow keys or WASD to fly in all directions
- **Mouse/Trackpad:** Click or tap to set destination / guide movement
- Both input methods work simultaneously

---

## World Structure

A **single scrolling screen world** — the player moves through space and the environment scrolls around them. The world is large enough to explore but not overwhelming. Stars are distributed throughout the scrollable space, not locked to any single area.

---

## Star System

There are **7 rainbow star colors**, each corresponding to a color of the visible spectrum:

| Color | Rarity |
|---|---|
| Red | Common |
| Orange | Common |
| Yellow | Common |
| Green | Uncommon |
| Blue | Uncommon |
| Indigo | Rare |
| Violet | Rare |

Common stars appear frequently and in clusters. Uncommon stars are scattered individually. Rare stars are sparse — maybe drifting in hard-to-reach pockets of the map or hidden behind hazards.

Each star color glows softly with its own light. Collecting a star produces a small satisfying visual/audio pulse.

---

## HUD / Progress Tracker

A **rainbow spectrum tracker** runs along the bottom (or side) of the screen — a horizontal band divided into 7 color segments, each with a fill level that rises as stars are collected. Think of it like a stained glass window slowly coming to life, one color at a time.

Each segment shows a small count (e.g., 7/10) and fills with glowing color as progress is made. When a color completes, it locks in with a soft pulse of light and a chime — the segment stays fully lit and vibrant for the rest of the run. When all 7 segments are full and glowing, the tracker itself blooms — a visual signal that the full spectrum is complete and StarKid is reachable.

No score, no timer. The tracker is the only UI element that matters.

---

## Hazards

No enemies. Hazards are **environmental** — things that exist naturally in space:

- **Asteroid fields** — drifting rocks that push the player back or briefly stun them
- **Black hole pull zones** — areas that drag the astronaut if they get too close
- **Nebula fog patches** — visibility reduced, harder to spot stars
- **Solar flares** — brief bursts of light/energy that temporarily disorient

Hazards don't kill the player. They slow, push, or impede — maintaining the calm, exploratory tone.

---

## Win Condition

When all 70 stars are collected (10 × 7 colors):

1. The spectrum tracker blooms fully — all 7 colors radiant and complete
2. **StarKid materializes** in the world — not appearing out of nowhere, but becoming *visible*, as if he was always there and you can finally see him. He glows with a warm, full-spectrum light.
3. The player flies to StarKid
4. On contact: a gentle win animation — the two exist together in space, colors swirling softly around them
5. Then: **the question moment**

### The Question

A simple, beautiful input appears:

> *"You've found StarKid. You may ask him one question."*

The player types anything they want. StarKid answers. This is powered by the Claude API — StarKid has a defined voice: wise, warm, a little cosmic, never condescending. He speaks to you like you're already capable of understanding the answer. He exists in his truest form, and for this moment, so do you.

The answer appears on screen. There is no next level. The game ends here, in this exchange.

---

## Visual Style

**Minimalist/clean space aesthetic** with two layered environments:

- **Background layer:** Deep black space with a dense star field (small, white, twinkling background stars for depth)
- **Mid layer:** Colorful nebula clouds — soft, translucent purples, blues, and pinks that drift slowly and give the world a painterly, alive quality
- **Foreground/gameplay layer:** Clean, simple character and star designs — bold outlines, flat colors, minimal detail except on the astronaut character

The overall palette is dark with vivid pops of color from the rainbow stars and nebulae. UI is minimal and never cluttered.

---

## Audio

**Calm orchestral space music** — rooted in strings and woodwinds, with sparse piano. The tone is wonder-filled and unhurried, like a film score for a child looking up at the night sky for the first time. No urgent beats, no synth leads. The orchestration breathes.

The music evolves subtly as the spectrum fills — as more colors are collected, the arrangement grows slightly richer, more layered, as if the universe is waking up.

Sound effects are soft and satisfying:
- Delicate chime/shimmer on star collect, tuned to the color's position in the spectrum
- Gentle jetpack whoosh on movement
- Full orchestral swell when StarKid becomes visible
- A quiet, held chord during the question moment — space for thought

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
| Win state | Rescue and reunite with StarKid |
| Pressure | None — relaxed exploration |
| Visual style | Minimalist clean + black space + nebula clouds |
| Character | Steampunk scrap-metal child astronaut |
| Audio | Calm ambient space music |
