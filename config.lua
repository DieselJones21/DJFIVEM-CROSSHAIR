Config = {}

-- Chat / keybind commands
Config.Command = 'crosshair'
Config.ResetCommand = 'crosshair_reset'
Config.OpenKey = 'F7'

-- When true the custom reticle is hidden if the player is unarmed
-- and not actively aiming (still shows while the menu is open).
Config.HideWhenUnarmed = true

-- Default settings applied to new players and /crosshair_reset
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
