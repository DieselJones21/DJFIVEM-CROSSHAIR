# DJ FiveM Crosshair

A standalone customizable crosshair resource for FiveM, inspired by the popular custom-reticle menus: pick a style, tune size and opacity, and decide when it shows.

Drop the folder in `resources`, start it, then use `/crosshair`.

## Features

- **175** original SVG styles across Classic, Cross, Circle, Tactical, Geo, Hybrid, and Styled
- Live size, opacity, and color controls
- Enable or disable the custom overlay
- Enable or disable the default GTA V crosshair
- Show only while aiming, or keep it on
- Optional hide in first person
- Optional hitmarker flash
- Settings persist per player with KVP
- Framework-free: works with ESX, QBCore, Qbox, or standalone

## Commands

| Command | Default key | Action |
| --- | --- | --- |
| `/crosshair` | `F7` | Open or close the menu |
| `/crosshair_reset` | — | Restore the configured defaults |

Players can rebind the open key in GTA settings.

## Install

1. Copy this resource into your server `resources` folder as `dj-crosshair` (or keep the repo folder name).
2. Add `ensure dj-crosshair` to `server.cfg`.
3. Restart the server or `ensure dj-crosshair`.

No SQL, framework, or extra dependencies.

## Config

Edit `config.lua`:

```lua
Config.Command = 'crosshair'
Config.ResetCommand = 'crosshair_reset'
Config.OpenKey = 'F7'
Config.HideWhenUnarmed = true

Config.Defaults = {
    styleId = 28,
    size = 100,
    opacity = 92,
    color = '#3EE0FF',
    customEnabled = true,
    defaultEnabled = false,
    aimOnly = true,
    hideInFirstPerson = false,
    hitmarker = true
}
```

`styleId` is `1` through `175`.

## Resource layout

```
fxmanifest.lua
config.lua
client/main.lua
html/index.html
html/style.css
html/catalog.js
html/app.js
```

## Notes

- This is an original overlay, not a copy of any paid escrow script.
- The default GTA reticle is hidden with `HideHudComponentThisFrame(14)` when **Default GTA crosshair** is off.
- Open `html/index.html` in a browser to preview the menu without a game client.
