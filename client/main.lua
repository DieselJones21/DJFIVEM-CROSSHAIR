local KVP_KEY = 'dj_crosshair_settings'
local HUD_CROSSHAIR = 14
local INPUT_AIM = 25
local WEAPON_UNARMED = `WEAPON_UNARMED`

local settings = {}
local menuOpen = false
local lastVisible = nil

local function copyDefaults()
    local defaults = {}
    for key, value in pairs(Config.Defaults) do
        defaults[key] = value
    end
    return defaults
end

local function sanitizeSettings(data)
    local nextSettings = copyDefaults()
    if type(data) ~= 'table' then
        return nextSettings
    end

    if type(data.styleId) == 'number' then
        nextSettings.styleId = math.floor(math.max(1, math.min(175, data.styleId)))
    end
    if type(data.size) == 'number' then
        nextSettings.size = math.floor(math.max(40, math.min(220, data.size)))
    end
    if type(data.opacity) == 'number' then
        nextSettings.opacity = math.floor(math.max(15, math.min(100, data.opacity)))
    end
    if type(data.color) == 'string' and data.color:match('^#%x%x%x%x%x%x$') then
        nextSettings.color = data.color:upper()
    end

    nextSettings.customEnabled = data.customEnabled ~= false
    nextSettings.defaultEnabled = data.defaultEnabled == true
    nextSettings.aimOnly = data.aimOnly ~= false
    nextSettings.hideInFirstPerson = data.hideInFirstPerson == true
    nextSettings.hitmarker = data.hitmarker ~= false
    return nextSettings
end

local function persist()
    SetResourceKvp(KVP_KEY, json.encode(settings))
end

local function loadSettings()
    local raw = GetResourceKvpString(KVP_KEY)
    if not raw or raw == '' then
        settings = copyDefaults()
        return
    end

    local ok, decoded = pcall(json.decode, raw)
    if not ok then
        settings = copyDefaults()
        return
    end

    settings = sanitizeSettings(decoded)
end

local function pushSettings()
    SendNUIMessage({
        action = 'setSettings',
        settings = settings
    })
end

local function setVisible(visible)
    if lastVisible == visible then
        return
    end
    lastVisible = visible
    SendNUIMessage({
        action = 'setVisible',
        visible = visible
    })
end

local function isAiming(ped)
    if IsPlayerFreeAiming(PlayerId()) then
        return true
    end
    if IsControlPressed(0, INPUT_AIM) or IsDisabledControlPressed(0, INPUT_AIM) then
        return true
    end
    if IsPedShooting(ped) then
        return true
    end
    return false
end

local function isFirstPerson(ped)
    if IsPedInAnyVehicle(ped, false) then
        return GetFollowVehicleCamViewMode() == 4
    end
    return GetFollowPedCamViewMode() == 4
end

local function isUnarmed(ped)
    local weapon = GetSelectedPedWeapon(ped)
    return weapon == WEAPON_UNARMED
end

local function shouldShowCustom()
    if not settings.customEnabled then
        return false
    end
    if IsPauseMenuActive() then
        return false
    end
    if menuOpen then
        return true
    end

    local ped = PlayerPedId()
    if not DoesEntityExist(ped) or IsEntityDead(ped) then
        return false
    end
    if IsPedFatallyInjured(ped) then
        return false
    end
    if settings.hideInFirstPerson and isFirstPerson(ped) then
        return false
    end
    if Config.HideWhenUnarmed and isUnarmed(ped) and not isAiming(ped) then
        return false
    end
    if settings.aimOnly then
        return isAiming(ped)
    end
    return true
end

local function setMenuOpen(open)
    menuOpen = open
    SetNuiFocus(open, open)
    SetNuiFocusKeepInput(false)
    if open then
        SendNUIMessage({
            action = 'openMenu',
            settings = settings
        })
        lastVisible = nil
        setVisible(true)
    else
        SendNUIMessage({ action = 'closeMenu' })
    end
end

local function applySettings(data, shouldPersist)
    settings = sanitizeSettings(data)
    if shouldPersist then
        persist()
    end
    pushSettings()
end

RegisterCommand(Config.Command, function()
    setMenuOpen(not menuOpen)
end, false)

RegisterCommand(Config.ResetCommand, function()
    applySettings(copyDefaults(), true)
    SendNUIMessage({ action = 'notify', text = 'Crosshair reset to default' })
end, false)

RegisterKeyMapping(Config.Command, 'Open crosshair menu', 'keyboard', Config.OpenKey)

RegisterNUICallback('close', function(_, cb)
    setMenuOpen(false)
    cb({ ok = true })
end)

RegisterNUICallback('save', function(data, cb)
    applySettings(data or {}, true)
    cb({ ok = true, settings = settings })
end)

RegisterNUICallback('preview', function(data, cb)
    applySettings(data or {}, false)
    cb({ ok = true })
end)

RegisterNUICallback('reset', function(_, cb)
    applySettings(copyDefaults(), true)
    cb({ ok = true, settings = settings })
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end
    if menuOpen then
        SetNuiFocus(false, false)
    end
end)

AddEventHandler('gameEventTriggered', function(name, args)
    if name ~= 'CEventNetworkEntityDamage' then
        return
    end
    if not settings.hitmarker or not settings.customEnabled then
        return
    end
    if lastVisible ~= true then
        return
    end

    local victim = args[1]
    local attacker = args[2]
    local ped = PlayerPedId()
    if attacker ~= ped or victim == ped then
        return
    end
    if not DoesEntityExist(victim) then
        return
    end

    SendNUIMessage({ action = 'hitmarker' })
end)

CreateThread(function()
    loadSettings()
    Wait(400)
    pushSettings()

    while true do
        local hideDefault = not settings.defaultEnabled
        if hideDefault then
            HideHudComponentThisFrame(HUD_CROSSHAIR)
        end

        local visible = shouldShowCustom()
        setVisible(visible)

        if hideDefault or menuOpen or visible then
            Wait(0)
        else
            Wait(150)
        end
    end
end)
