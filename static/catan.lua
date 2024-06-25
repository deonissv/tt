function getModVersion()
    return 1.44
end -- version of this mod (for compatibility checks with external tools)

math.randomseed( os.time() )

m_iEventCardResult = 0 --\"dice\" result for event cards

m_Die1 = nil
function getDieOne() return m_Die1 end
m_Die2 = nil
function getDieTwo() return m_Die2 end
m_EventDie = nil
function getEventDie() return m_EventDie end
--bag containing items and code for explorers & pirates expansion
m_EaPBag = nil
function setEaPBag(p)
    if m_EaPBag ~= nil then --remove old EaP Bag so they don't start to accumulate if multiple game boxes are spawned
        m_EaPBag.call('silentDestroy')
    end
    m_EaPBag = p.BagObj
end
function getEaPBag() return m_EaPBag end
--bag containing items for the Traders & Barbarians campaigns
m_TaBBag = nil
function setTaBBag(p)
    if m_TaBBag ~= nil then --remove old TaB Bag so they don't start to accumulate if multiple game boxes are spawned
        m_TaBBag.destruct()
    end
    m_TaBBag = p.BagObj
end
function getTaBBag() return m_TaBBag end

m_MapScript = nil

m_Robber = nil

-- Item spawn bags
m_ResourceDecks = {Bag = 'dbd7df', Deck = {['Lumber'] = 'b40904', ['Bricks'] = 'f24c89', ['Wool'] = '89b19c', ['Grain'] = 'a69e8e', ['Ore'] = '1ec6da'}}
m_ResourceDecks_ext = {Bag = 'b2dbfd', Deck = {['Lumber'] = 'a875da', ['Bricks'] = '761ae4', ['Wool'] = '0212ac', ['Grain'] = '2fd393', ['Ore'] = 'e29e0d'}}
m_DevCardDecks = {Bag = '789036', Deck = {['2P'] = '807c38', ['34P'] = '138ade', ['56P'] = '8581dd', ['34P_S7'] = '5f0252', ['56P_S7'] = '4f7c58'}}
m_HelpersItems = {Bag = 'ba7910', Item = {['Deck'] = 'b08360'}}
m_FishermenItems = {Bag = '240e82', Item = {['Deck'] = '8a62f6', ['Deck_ext'] = 'e9e546'}}
m_DeckEventCards = 'de471f'
--C&K
m_CKitems = {Bag = '818554', Item = {['DeckPolitics'] = '688db9', ['DeckScience'] = '7feefa', ['DeckTrade'] = '1c5356', ['DeckDefender'] = '361e4e', ['DeckDefender_ext'] = '5e14df',
                                     ['ChartPolitics'] = '85dcd8', ['ChartScience'] = 'cd7181', ['ChartTrade'] = 'e51b9c', }
            }
m_CommodityDecks = {Bag = 'fe36b2', Deck = {['Paper'] = 'e47fa7', ['Cloth'] = '428625', ['Coins'] = '37560d'}}
m_CommodityDecks_ext = {Bag = 'f2c12f', Deck = {['Paper'] = '8817c0', ['Cloth'] = '7b2437', ['Coins'] = '851e28'}}

--hex tiles spawn info
m_HexDefaultBack = 'http://cloud-3.steamusercontent.com/ugc/155773601379910328/F0F3F849353CEADE84EFD7EBC9633E2D515D065B/'
m_HexObjects = {
    ['ocean'] = { iNext = 1, sName = 'Ocean', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380043375/20524D1E34ED5822D8A60A0E98A06DC759C1BB59/'} },
    ['desert'] = { iNext = 1, sName = 'Desert', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380018013/5297D6301FABFD057864B01E56205688092337AF/'} },
    ['gold'] = { iNext = 1, sName = 'Gold field', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380038688/AA77F12BF1EFAA7A87ADD4B58357E4A28D118551/'} },
    ['s6_desert'] = { iNext = 1, sName = 'Desert', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380018013/5297D6301FABFD057864B01E56205688092337AF/'} },
    ['s6_gold'] = { iNext = 1, sName = 'Gold field', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380038688/AA77F12BF1EFAA7A87ADD4B58357E4A28D118551/'} },
    ['ocean_skull'] = { iNext = 1, sName = 'Ocean', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380041443/80DEC5FA61F36DB6614A4AC7A950953B70A2FE22/'} },
    ['forest'] = { iNext = 1, sName = 'Forest', Texture = {
        'http://cloud-3.steamusercontent.com/ugc/155773601380064860/FCE8797FDA3754A3FB0738CBD01544229DF37BA7/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380047742/6A012B3941B4402DD74894B81401BCA766DAE6FA/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380062722/CD09915C7D47BECF22F05C130746EEAF64078A3B/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380045617/66F9C1495E675B815564CF31BA5FC5067C3F8BA2/',
    } },
    ['hills'] = { iNext = 1, sName = 'Hills', Texture = {
        'http://cloud-3.steamusercontent.com/ugc/155773601380071208/068DB4D67770184167F105CBBB0EBA01756547AF/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380069570/5B36A9212E340C90052FA5F66399BEF8179FAE49/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380067936/DA712E97D737D3907342A069231936724CA38FB1/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380066342/0A9DCA1DA800D93FD0A39F859DD18EE7A76FD155/',
    } },
    ['pasture'] = { iNext = 1, sName = 'Pasture', Texture = {
        'http://cloud-3.steamusercontent.com/ugc/155773601380096196/FF15A38D9B5B8DB7D31EEBD2B22C767FC18ACD25/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380083173/51B507F8A6A1DF53B1818D37D463AE243D59599F/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380077956/E9F0AEC67B90B109025F1FF9DC47F277C575038C/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380079762/CE6173C55BAFF47B27D6C0C9A64225636EA95AA3/',
    } },
    ['fields'] = { iNext = 1, sName = 'Grainfields', Texture = {
        'http://cloud-3.steamusercontent.com/ugc/155773601380103510/E40C38B5CF2E3D0D7FC3C4310E09E81A71A3BE4F/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380099575/F7BB16C7534436600A52987FFE62254EC8BB1DC3/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380101489/25294093C2ABF857CDB43FFF533DBE3F0DE32698/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380097964/F92E10AA59958999FDFD81515668212CD15C4B1D/',
    } },
    ['mountain'] = { iNext = 1, sName = 'Mountain', Texture = {
        'http://cloud-3.steamusercontent.com/ugc/155773601380109303/731E6EB55E1110B4AD31592BCA8B7E6F2BFE737C/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380107929/F436E3A5A0E561AD031829BC0ABD8F547D7D74F0/',
        'http://cloud-3.steamusercontent.com/ugc/155773601380106225/0CDC8230502680FF8E3AA4FBBCC7D3DC91409654/',
    } },
    ['oilsource'] = {iNext = 1, sName = 'Oilsource', Texture = {'http://cloud-3.steamusercontent.com/ugc/155773601380138144/01B40247FEA4582D0CD515B35D464FBF58390533/'} },
}
function getHexObjectList() return m_HexObjects end
function setHexObjectList(List) m_HexObjects = List end
m_iSpawnedHexes = 0
m_iLoadingHexes = 999 --TODO: multiple hex tiles have the same GUID in the frame they are spawned in and even when their onLoad event is triggered ... so just count them to figure out when they are all loaded

m_UnlockOnLoad = {}
function addToUnlockList(p) table.insert(m_UnlockOnLoad, p.Obj) end

m_PlayerColors = {  --(it is actually the colors of the players items...)
    ['Orange'] = { r = 1.0, g = 0.544700563, b = 0.188231677  },
    ['Red'] = { r = 0.7921569, g = 0.0, b = 0.0  },
    ['White'] = { r = 0.99649936, g = 1.0, b = 0.996506333  },
    ['Purple'] = { r = 0.5528258, g = 0.164702222, b = 1.0  },
    ['Blue'] = { r = 0.149015814, g = 0.419941843, b = 0.8235495  },
    ['Green'] = { r = 0.201173037, g = 0.8549019, b = 0.188231409  },
}
function getPlayerColor(p) return m_PlayerColors[p.sPlayer] end

-- Control panel related globals
m_bRandomizeMap = false
function getStateRandomize() return m_bRandomizeMap end
function setStateRandomize(p) m_bRandomizeMap = p.bRandom end
m_bHiddenNumbers = false
function getStateHiddenNumbers() return m_bHiddenNumbers end
function setStateHiddenNumbers(p) m_bHiddenNumbers = p.bHide end
m_bHiddenTiles = false
function getStateHiddenTiles() return m_bHiddenTiles end
function setStateHiddenTiles(p) m_bHiddenTiles = p.bHide end
m_bExpCK = false
function getBtnStateCK() return m_bExpCK end
function setBtnStateCK(p) m_bExpCK = p.bEnable end
m_bMapLoaded = false
function isMapLoaded() return m_bMapLoaded end
m_bAutoSort = true
function getAutoSort() return m_bAutoSort end
function setAutoSort(p) m_bAutoSort = p.bEnable end
m_bDeckTooltip = false
function getDeckTooltip() return m_bDeckTooltip end
function setDeckTooltip(p)
    m_bDeckTooltip = p.bEnable
    --find all decks with a resource card and enable / disable the tooltip
    local AllObj = getAllObjects()
    for i, Obj in pairs(AllObj) do
        if Obj.tag == 'Deck' then
            local sCardName = Obj.getObjects()[1].nickname
            if sCardName == 'Lumber' or sCardName == 'Bricks' or sCardName == 'Wool' or sCardName == 'Grain' or sCardName == 'Ore' or
               sCardName == 'Paper' or sCardName == 'Cloth' or sCardName == 'Coins' then
                Obj.tooltip = m_bDeckTooltip
            end
        end
    end
end
m_bDisplayCardCount = true
function getDisplayCardCount() return m_bDisplayCardCount end
function setDisplayCardCount(p) m_bDisplayCardCount = p.bEnable end
m_bDiceDealButton = false --show deal button next to dice after rolling
m_iDealCards = 0 --selected option on CP page 6

function getDealCardsSetting() return m_iDealCards end
function setDealCardsSetting(p)
    m_iDealCards = p.iSetting
    if m_iDealCards == 0 then --Both fixed deal button + deal button next to rolled dice
        m_MapScript.call('showDealButton') --make sure the fixed deal button is enabled
        m_bDiceDealButton = true
    elseif m_iDealCards == 1 then --Fixed deal button only
        m_MapScript.call('showDealButton')
        m_MapScript.call('hideDealButtonDie') --remove any active buttons
        m_bDiceDealButton = false
    elseif m_iDealCards == 2 then --dice button only
        m_MapScript.call('hideDealButton')
        m_bDiceDealButton = true
    elseif m_iDealCards == 3 then --none
        m_MapScript.call('hideDealButton')
        m_MapScript.call('hideDealButtonDie') --remove any active buttons
        m_bDiceDealButton = false
    end
end

--Settings for scenario 9 (randomized map)
m_iS9NumGold = -1 --default
function getStateNumGold() return m_iS9NumGold end
function setStateNumGold(p) m_iS9NumGold = p.iNew end
m_iS9PercentHidden = 0
function getStatePercentHidden() return m_iS9PercentHidden end
function setStatePercentHidden(p) m_iS9PercentHidden = p.iNew end

--Mini Expansions
m_iFrenemiesPlayers = 0
function getStateFrenemies() return m_iFrenemiesPlayers end
function setStateFrenemies(p) m_iFrenemiesPlayers = p.iNew end
m_bEnableHelpers = false
function getStateHelpers() return m_bEnableHelpers end
function setStateHelpers(p) m_bEnableHelpers = p.bEnable end
m_bEnableFishermen = false
function getStateFishermen() return m_bEnableFishermen end
function setStateFishermen(p) m_bEnableFishermen = p.bEnable end
m_FishermenCardBoard = nil
function getFishermenCardBoard() return m_FishermenCardBoard end
m_bEnableHarborMaster = false
function getStateHarborMaster() return m_bEnableHarborMaster end
function setStateHarborMaster(p) m_bEnableHarborMaster = p.bEnable end
m_bEnableWelfare = false
function getStateWelfare() return m_bEnableWelfare end
function setStateWelfare(p) m_bEnableWelfare = p.bEnable end
m_bEnableEventCards = false
function getStateEventCards() return m_bEnableEventCards end
function setStateEventCards(p) m_bEnableEventCards = p.bEnable end
m_bEpidemic = false
function isEpidemic() return m_bEpidemic end
m_bEnableRivers = false
function getStateRivers() return m_bEnableRivers end
function setStateRivers(p) m_bEnableRivers = p.bEnable end
m_bEnableCaravans = false
function getStateCaravans() return m_bEnableCaravans end
function setStateCaravans(p) m_bEnableCaravans = p.bEnable end
m_bEnableBarbarianAttack = false
m_bColorDieSpawned = false --switch to make the color die spawn only on one of the castle fields when two are in the game (5-6 players)
function getStateBarbarianAttack() return m_bEnableBarbarianAttack end
function setStateBarbarianAttack(p) m_bEnableBarbarianAttack = p.bEnable end
m_bEnableTraders = false
function getStateTraders() return m_bEnableTraders end
function setStateTraders(p) m_bEnableTraders = p.bEnable end
m_bEnableOilsprings = false
function getStateOilsprings() return m_bEnableOilsprings end
function setStateOilsprings(p) m_bEnableOilsprings = p.bEnable end

--Restriction for the deal function to work only once per roll
m_bAllowDeal = false
function isDealAllowed() return m_bAllowDeal end
function setAllowDeal(p) m_bAllowDeal = p.bEnable end

--Dice monitoring to control token highlighting
m_CheckDice = {}
function queueDieCheck(p)
    if m_bMapLoaded then
        local bAdd = true
        for i, Die in pairs(m_CheckDice) do --make sure each die is in the list only once
            if Die == p.DieObj then
                bAdd = false
                break
            elseif Die == nil then --if we detect a nil object remove it to make sure we do not disable the update function if #m_CheckDie returns 0
                table.remove(m_CheckDice, i)
            end
        end
        if bAdd then
            table.insert(m_CheckDice, p.DieObj)
        end
        return true
    else --map is still loading, die not in monitoring queue
        return false
    end
end

--Tool C/K counter: Objects to be informed when something is done to knight tokens (City/Knights counter)
m_KnightEventReceiver = {}
function registerKnightEventReceiver(p) table.insert(m_KnightEventReceiver, p.Obj) end
function reportKnightCollision()
    for i, Receiver in pairs(m_KnightEventReceiver) do
        if Receiver ~= nil then
            Receiver.call('onKnightCollision')
        end
    end
end
function resetCKcounter()
    for i, Receiver in pairs(m_KnightEventReceiver) do
        if Receiver ~= nil then
            Receiver.call('resetCounter')
        end
    end
end

--Tool Dice Logger: Object to be informed when dice have been rolled / cards dealt (dice logger)
m_DiceLogger = nil
function registerDiceLogger(p)
    if m_DiceLogger ~= nil then
        m_DiceLogger.call('setStatus', {bActive = false}) --tell the old logger that it will no longer be updated
    end
    m_DiceLogger = p.Obj
end
function onCardsDealt(p) --called from map script when the deal cards function is used
    if m_DiceLogger ~= nil then
        m_DiceLogger.call('onCardsDealt', {iResult = p.iResult})
    end

    --interface for dice event receivers (automatic barbarian ship / E&P)
    for i, Receiver in ipairs(m_DiceEventReceiver) do
        if Receiver ~= nil then
            Receiver.call('onCardsDealt', {iResult = p.iResult, Yields = p.Yields})
        end
    end
end

--Tool Dice event receiver: Objects to be informed when dice have been rolled (auto moving barbarian ship)
m_DiceEventReceiver = {}
function registerDiceEventReceiver(p) table.insert(m_DiceEventReceiver, p.Obj) end
function removeDiceEventReceiver(p)
    for i, Receiver in pairs(m_DiceEventReceiver) do
        if Receiver == p.Obj then
            table.remove(m_DiceEventReceiver, i)
            break
        end
    end
end

m_CurScenario = {}

--[[ The OnLoad function. This is called after everything in the game save finishes loading.
Most of your script code goes here. --]]
function onLoad(save_state)
-- get the scripting zone object that handles map related stuff
    m_MapScript = getObjectFromGUID('42fd8e')

-- load saved data
    local saved_data = JSON.decode(save_state)
    if saved_data ~= nil then
        if saved_data.m_CurScenario ~= nil then m_CurScenario = saved_data.m_CurScenario end
        if saved_data.m_bRandomizeMap ~= nil then m_bRandomizeMap = saved_data.m_bRandomizeMap end
        if saved_data.m_bHiddenNumbers ~= nil then m_bHiddenNumbers = saved_data.m_bHiddenNumbers end
        if saved_data.m_bHiddenTiles ~= nil then m_bHiddenTiles = saved_data.m_bHiddenTiles end
        if saved_data.m_bExpCK ~= nil then m_bExpCK = saved_data.m_bExpCK end
        if saved_data.m_bMapLoaded ~= nil then m_bMapLoaded = saved_data.m_bMapLoaded end
        if saved_data.m_bAutoSort ~= nil then m_bAutoSort = saved_data.m_bAutoSort end
        if saved_data.m_iDealCards ~= nil then
            m_iDealCards = saved_data.m_iDealCards
            setDealCardsSetting({iSetting = m_iDealCards})
        end
        if saved_data.m_bDeckTooltip ~= nil then m_bDeckTooltip = saved_data.m_bDeckTooltip end
        if saved_data.m_bDisplayCardCount ~= nil then m_bDisplayCardCount = saved_data.m_bDisplayCardCount end
        if saved_data.m_iS9NumGold ~= nil then m_iS9NumGold = saved_data.m_iS9NumGold end
        if saved_data.m_iS9PercentHidden ~= nil then m_iS9PercentHidden = saved_data.m_iS9PercentHidden end
        if saved_data.m_iFrenemiesPlayers ~= nil then m_iFrenemiesPlayers = saved_data.m_iFrenemiesPlayers end
        if saved_data.m_bEnableHelpers ~= nil then m_bEnableHelpers = saved_data.m_bEnableHelpers end
        if saved_data.m_bEnableFishermen ~= nil then m_bEnableFishermen = saved_data.m_bEnableFishermen end
        if saved_data.m_bEnableHarborMaster ~= nil then m_bEnableHarborMaster = saved_data.m_bEnableHarborMaster end
        if saved_data.m_bEnableWelfare ~= nil then m_bEnableWelfare = saved_data.m_bEnableWelfare end
        if saved_data.m_bEnableEventCards ~= nil then m_bEnableEventCards = saved_data.m_bEnableEventCards end
        if saved_data.m_bEnableRivers ~= nil then m_bEnableRivers = saved_data.m_bEnableRivers end
        if saved_data.m_bEnableCaravans ~= nil then m_bEnableCaravans = saved_data.m_bEnableCaravans end
        if saved_data.m_bEnableBarbarianAttack ~= nil then m_bEnableBarbarianAttack = saved_data.m_bEnableBarbarianAttack end
        if saved_data.m_bEnableTraders ~= nil then m_bEnableTraders = saved_data.m_bEnableTraders end
        if saved_data.m_iEventCardResult ~= nil then m_iEventCardResult = saved_data.m_iEventCardResult end

        if saved_data.m_sGUIDFishermenBoard ~= nil then
            m_FishermenCardBoard = getObjectFromGUID(saved_data.m_sGUIDFishermenBoard)
        end
        if saved_data.m_sGUID_Die1 ~= nil then
            m_Die1 = getObjectFromGUID(saved_data.m_sGUID_Die1)
        else
            m_Die1 = getObjectFromGUID('af8b2c')
        end
        if saved_data.m_sGUID_Die2 ~= nil then
            m_Die2 = getObjectFromGUID(saved_data.m_sGUID_Die2)
        else
            m_Die2 = getObjectFromGUID('750997')
        end
        if saved_data.m_sGUID_EventDie ~= nil then
            m_EventDie = getObjectFromGUID(saved_data.m_sGUID_EventDie)
        end
    end

end

function onSave()
    local ToSave = {
        m_CurScenario = m_CurScenario,
        m_bRandomizeMap = m_bRandomizeMap,
        m_bHiddenNumbers = m_bHiddenNumbers,
        m_bHiddenTiles = m_bHiddenTiles,
        m_bExpCK = m_bExpCK,
        m_bMapLoaded = m_bMapLoaded,
        m_bAutoSort = m_bAutoSort,
        m_bDeckTooltip = m_bDeckTooltip,
        m_bDisplayCardCount = m_bDisplayCardCount,
        m_iDealCards = m_iDealCards,
        m_iS9NumGold = m_iS9NumGold,
        m_iS9PercentHidden = m_iS9PercentHidden,
        m_iFrenemiesPlayers = m_iFrenemiesPlayers,
        m_bEnableHelpers = m_bEnableHelpers,
        m_bEnableFishermen = m_bEnableFishermen,
        m_bEnableHarborMaster = m_bEnableHarborMaster,
        m_bEnableWelfare = m_bEnableWelfare,
        m_bEnableEventCards = m_bEnableEventCards,
        m_bEnableRivers = m_bEnableRivers,
        m_bEnableCaravans = m_bEnableCaravans,
        m_bEnableBarbarianAttack = m_bEnableBarbarianAttack,
        m_bEnableTraders = m_bEnableTraders,
        m_iEventCardResult = m_iEventCardResult,
    }
    if m_FishermenCardBoard ~= nil then
        ToSave.m_sGUIDFishermenBoard = m_FishermenCardBoard.getGUID()
    end
    if m_Die1 ~= nil then
        ToSave.m_sGUID_Die1 = m_Die1.getGUID()
    end
    if m_Die2 ~= nil then
        ToSave.m_sGUID_Die2 = m_Die2.getGUID()
    end
    if m_EventDie ~= nil then
        ToSave.m_sGUID_EventDie = m_EventDie.getGUID()
    end

    return JSON.encode(ToSave)
end


function getScenarioID()
    return m_CurScenario.sID
end
function isUsingExtension()
    return m_CurScenario.bExtension
end

function checkButtonPrivileges(p)
    local PPlayer = Player[p.sColor]
    if PPlayer ~= nil then
        if PPlayer.admin then
            return true
        else
            broadcastToColor('Only promoted players can use the control panel', p.sColor, {1.0,1.0,1.0})
        end
    end
    return false
end

--[[ removeOverlay
    Removes the quick start overlay if it still exists.
    Called from onMapLoad and from onDestroy of control panel page 1 to make it disappear when the page gets changed
]]
function removeOverlay()
    local Obj = getObjectFromGUID('6905af')
    if Obj ~= nil then
        Obj.destruct()
    end
end

--when a number die is interacted with it registers as die 1 or die 2 to make the script more robust and allow for deletion and spawning of dice (e.g. when put in a bag)
function registerNumberDie(p)
    if p.iDie == 1 then
        if m_Die1 == nil then --old reference is invalid (die got deleted)
            m_Die1 = p.DieObj
        end
    elseif p.iDie == 2 then
        if m_Die2 == nil then --old reference is invalid (die got deleted)
            m_Die2 = p.DieObj
        end
    elseif p.iDie == 3 and isCKenabled() then --Event die will register as die 3
        if m_EventDie == nil then
            m_EventDie = p.DieObj
        end
    end
end

function isCKenabled()
    if m_CurScenario.bUseCK ~= nil then
        return m_CurScenario.bUseCK
    end
    return false
end
function isWelfareEnabled()
    if m_CurScenario.bUseWelfare ~= nil then
        return m_CurScenario.bUseWelfare
    end
    return false
end
function isFishermenEnabled()
    if m_CurScenario.bUseFishermen ~= nil then
        return m_CurScenario.bUseFishermen
    end
    return false
end
function isEventCardsEnabled()
    if m_CurScenario.bUseEventCards ~= nil then
        return m_CurScenario.bUseEventCards
    end
    return false
end
function isRiversEnabled()
    if m_CurScenario.bUseRivers ~= nil then
        return m_CurScenario.bUseRivers
    end
    return false
end
function getDiceValue()
    if isEventCardsEnabled() then
        return m_iEventCardResult
    elseif m_Die1 ~= nil and m_Die2 ~= nil then
        return (m_Die1.getValue() + m_Die2.getValue())
    end
    return 0
end
function getDie2Value()
    if m_Die2 ~= nil then
        return m_Die2.getValue()
    end
    return 0
end
function getEventDieValue()
    if m_EventDie ~= nil then
        local iVal = m_EventDie.getValue()
        if iVal == 1 or iVal == 2 or iVal == 6 then
            return 'barbarians'
        elseif iVal == 3 then
            return 'science'
        elseif iVal == 4 then
            return 'trade'
        elseif iVal == 5 then
            return 'politics'
        end
    end
    return nil
end

function callbackDeck(Obj, p)
    Obj.setRotation(p.vRot)
    Obj.setPosition(p.vPos)
    if p.bShuffle == true then
        Obj.shuffle()
    end
end

function setupDecks()
    --find appropriate card decks to spawn
    local SpawnDef_Resources = m_ResourceDecks
    local SpawnDef_DevCards = m_DevCardDecks
    local SpawnDef_Commodities = m_CommodityDecks
    local SpawnDef_Items = m_CKitems

    if m_CurScenario.bExtension == true then
        SpawnDef_Resources = m_ResourceDecks_ext
        SpawnDef_Commodities = m_CommodityDecks_ext
    end

    -- spawn decks & put them in the proper position
    local params = {    callback = 'callbackDeck',
                        callback_owner = Global,
                        params = nil,
                    }
    if isCKenabled() == true then
        local BagResources = getObjectFromGUID(SpawnDef_Resources.Bag)
        if BagResources ~= nil then
            local vBagPos = BagResources.getPosition()
            local iDecksSpawned = 0 --counter to spawn every deck at another height to avoid decks merging
            --Lumber
            params.guid = SpawnDef_Resources.Deck['Lumber']
            params.params = {vPos = {-24.5,1.0,8.77}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Bricks
            params.guid = SpawnDef_Resources.Deck['Bricks']
            params.params = {vPos = {-24.5,1.0,1.77}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Wool
            params.guid = SpawnDef_Resources.Deck['Wool']
            params.params = {vPos = {-24.5,1.0,5.27}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Grain
            params.guid = SpawnDef_Resources.Deck['Grain']
            params.params = {vPos = {-27.0,1.0,1.77}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Ore
            params.guid = SpawnDef_Resources.Deck['Ore']
            params.params = {vPos = {-24.5,1.0,-1.73}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
        end
        params.position = nil

        local BagCommodities = getObjectFromGUID(SpawnDef_Commodities.Bag)
        if BagCommodities ~= nil then
            local vBagPos = BagCommodities.getPosition()
            local iDecksSpawned = 0 --counter to spawn every deck at another height to avoid decks merging
            --Paper
            params.guid = SpawnDef_Commodities.Deck['Paper']
            params.params = {vPos = {-27.0,1.0,8.77}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagCommodities, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Cloth
            params.guid = SpawnDef_Commodities.Deck['Cloth']
            params.params = {vPos = {-27.0,1.0,5.27}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagCommodities, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Coins
            params.guid = SpawnDef_Commodities.Deck['Coins']
            params.params = {vPos = {-27.0,1.0,-1.73}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagCommodities, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
        end
        params.position = nil

        local BagCKitems = getObjectFromGUID(SpawnDef_Items.Bag)
        if BagCKitems ~= nil then
            local vBagPos = BagCKitems.getPosition()
            local iDecksSpawned = 0
            --Politics
            params.guid = SpawnDef_Items.Item['DeckPolitics']
            params.params = {vPos = {-24.5,1.0,-5.23}, vRot = {0.0,180.0,180.0}, bShuffle = true}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            takeObjectWorkaround(BagCKitems, params)
            iDecksSpawned = iDecksSpawned + 1
            --Science
            params.guid = SpawnDef_Items.Item['DeckScience']
            params.params = {vPos = {-24.5,1.0,-8.73}, vRot = {0.0,180.0,180.0}, bShuffle = true}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            takeObjectWorkaround(BagCKitems, params)
            iDecksSpawned = iDecksSpawned + 1
            --Trade
            params.guid = SpawnDef_Items.Item['DeckTrade']
            params.params = {vPos = {-27.0,1.0,-5.23}, vRot = {0.0,180.0,180.0}, bShuffle = true}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            takeObjectWorkaround(BagCKitems, params)
            iDecksSpawned = iDecksSpawned + 1

            if m_CurScenario.bExtension == true then
                params.guid = SpawnDef_Items.Item['DeckDefender_ext']
            else
                params.guid = SpawnDef_Items.Item['DeckDefender']
            end
            params.params = {vPos = {-27.0,1.0,-8.73}, vRot = {0.0,180.0,180.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            takeObjectWorkaround(BagCKitems, params)
        end
    else --isCKenabled()
        local BagResources = getObjectFromGUID(SpawnDef_Resources.Bag)
        if BagResources ~= nil then
            local vBagPos = BagResources.getPosition()
            local iDecksSpawned = 0
            --Lumber
            params.guid = SpawnDef_Resources.Deck['Lumber']
            params.params = {vPos = {-24.5,1.0,8.77}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Bricks
            params.guid = SpawnDef_Resources.Deck['Bricks']
            params.params = {vPos = {-24.5,1.0,5.27}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Wool
            params.guid = SpawnDef_Resources.Deck['Wool']
            params.params = {vPos = {-24.5,1.0,1.77}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Grain
            params.guid = SpawnDef_Resources.Deck['Grain']
            params.params = {vPos = {-24.5,1.0,-1.73}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
            --Ore
            params.guid = SpawnDef_Resources.Deck['Ore']
            params.params = {vPos = {-24.5,1.0,-5.23}, vRot = {0.0,180.0,0.0}}
            params.position = {vBagPos.x + 5.0,vBagPos.y + iDecksSpawned * 2.0,vBagPos.z}
            local Deck = takeObjectWorkaround(BagResources, params)
            Deck.tooltip = m_bDeckTooltip
            iDecksSpawned = iDecksSpawned + 1
        end
        params.position = nil

        local BagDev = getObjectFromGUID(SpawnDef_DevCards.Bag)
        if BagDev ~= nil then
            params.guid = nil
            if m_CurScenario.sID == 'S7' or m_CurScenario.sID == 'T4' then --pirate scenario needs a deck with Knights instead of VPs (use it for Treasures Scenario 4, too)
                if m_CurScenario.bExtension == true then
                    params.guid = SpawnDef_DevCards.Deck['56P_S7']
                else
                    params.guid = SpawnDef_DevCards.Deck['34P_S7']
                end
            elseif m_CurScenario.bUseBAttack then
                local TaBBag = getTaBBag()
                if TaBBag ~= nil then
                    params.guid = TaBBag.getVar('m_Spawn_DevCards_BarbAttck')
                    BagDev = TaBBag
                end
            elseif m_CurScenario.bUseTraders then
                local TaBBag = getTaBBag()
                if TaBBag ~= nil then
                    if m_CurScenario.bExtension == true then
                        params.guid = TaBBag.getVar('m_Spawn_DevCards_TaB_ext')
                    else
                        params.guid = TaBBag.getVar('m_Spawn_DevCards_TaB')
                    end
                    BagDev = TaBBag
                end
            elseif getScenarioID() == 'B2' then --2 player version: smaller development card deck
                params.guid = SpawnDef_DevCards.Deck['2P']
            else
                if m_CurScenario.bExtension == true then
                    params.guid = SpawnDef_DevCards.Deck['56P']
                else
                    params.guid = SpawnDef_DevCards.Deck['34P']
                end
            end
            if params.guid ~= nil then
                params.params = {vPos = {-27.0,1.0,-5.23}, vRot = {0.0,180.0,180.0}, bShuffle = true}
                takeObjectWorkaround(BagDev, params)
            end
        end
    end

    return true
end

--[[ The Update function. This is called once per frame.
        This monitors the dice and triggers the token highlighting once they are all resting.
        The dice wanting to be monitored register themselves in m_CheckDice when there is physical interaction with them so this update function will only do something
        after the first die is manipulated until all dice are resting.
--]]
function onUpdate()
    --Check if all dice registered to be monitored are resting and trigger hightlighting once they are
    if #m_CheckDice > 0 then
        local bResting = true
        for i, Die in pairs(m_CheckDice) do
            if Die ~= nil then
                if Die.resting == false then
                    bResting = false
                    break
                end
            else --die got deleted -> remove from monitoring queue
                table.remove(m_CheckDice, i)
            end
        end

        if bResting then --all monitored dice are resting -> highlight number tokens and display the deal button
            if m_MapScript ~= nil then
                local iResult = getDiceValue()
                if iResult > 0 then
                    m_MapScript.call('highlightChits', { iNum = iResult })

                    --Check card limits and display card count on a 7
                    if m_bDisplayCardCount then
                        if iResult == 7 then
                            startLuaCoroutine(self, 'checkCardLimits')
                        else
                            --in 90% of cases the texts will be deleted already through the turn end event / players discarding their cards
                            --however to avoid annoying players with the text in special cases -> make sure it is gone
                            startLuaCoroutine(self, 'clearCardCounts')
                        end
                    end

                    --Handle Deal button next to dice
                    if m_bDiceDealButton then
                        m_MapScript.call('hideDealButtonDie') --There is no onRoll event in which we can remove the button + there is no event when a dice is set to a number -> just make sure any old button is gone before showing a new one
                        if m_Die1 ~= nil then --event cards...
                            if iResult ~= 7 then
                                m_MapScript.call('showDealButtonDie', {DieObj = m_Die1})
                            elseif isCKenabled() and getEventDieValue() ~= 'barbarians' then
                                --for Cities & Knights we have to show the button also at a seven in case progress cards have to be dealt
                                m_MapScript.call('showDealButtonDie', {DieObj = m_Die1})
                            end
                        end
                    end

                    --interface for external tool dice logger
                    if m_DiceLogger ~= nil then
                        m_DiceLogger.call('onDiceRolled', {iResult = iResult}) --TODO: when an onRoll event gets implemented transmit the color as well
                    end

                    --interface for dice event receivers (automatic barbarian ship)
                    for i, Receiver in ipairs(m_DiceEventReceiver) do
                        if Receiver ~= nil then
                            Receiver.call('onDiceRolled', {iResult = iResult})
                        end
                    end
                end
            end

            --tell dice that monitoring stopped so they will announce when they are interacted with again
            for i = 1, #m_CheckDice do
                if m_CheckDice[i] ~= nil then --it seems dice can be invalidated between the first loop in this routine and this one??!?!
                    m_CheckDice[i].call('setQueueStatus', {bActive = false})
                end
            end

            --reset die monitoring list
            m_CheckDice = {}
            --enable deal cards function
            m_bAllowDeal = true
        end
    end
end

--Reset/spawn items in the player area depending on the selected expansions/scenario
function setupPlayerItems(params)
    local bAddShips = params.bAddShips
    local iNumChits = params.iNumChits
    local bAddWarShips = false
    if params.bAddWarShips == true then
        bAddWarShips = true
    end

    local AllObj = getAllObjects()

    local PlayerPos = {
        ['Orange'] = { vStart = {x=-20.4,y=1.245,z=-17.0}, bLTR = false },
        ['Red'] = { vStart = {x=8.8,y=1.245,z=-17.0}, bLTR = false },
        ['White'] = { vStart = {x=38.9,y=1.245,z=-17.0}, bLTR = false },
        ['Purple'] = { vStart = {x=19.9,y=1.245,z=17.0}, bLTR = true },
        ['Blue'] = { vStart = {x=-9.3,y=1.245,z=17.0}, bLTR = true },
        ['Green'] = { vStart = {x=-38.9,y=1.245,z=17.0}, bLTR = true }
    }

    local BuildOrder = {
        --[[    iNum = Number of items that should be there
                iStack = how many of them are in one \"stack\" (column)
                fZSpace = vert space between objects
                fXSpace = space between stacks of the same type
                fYSpace = vertical space between items
                fXGap = additional space to fXSpace to the next object type
                fZGap = modifier for the Z starting point for this object
                fYOffset = Offset for height
                vRot = Rotation of this object
        ]]--
        ['City'] =       {iNum = 4, iStack = 999, fZSpace = 0.5, fXSpace = 0.0, fXGap = 0.0, fZGap = 0.0, fYOffset = 0.0, vRot = {0.0,-90.0,0.0}},
        ['Settlement'] = {iNum = 5, iStack = 3, fZSpace = 0.5, fXSpace = 0.7, fXGap = 1.1, fZGap = 0.0, fYOffset = -0.07, vRot = {0.0,90.0,0.0}},
        ['Road'] =       {iNum = 15, iStack = 8, fZSpace = 0.25, fXSpace = 1.2, fXGap = 1.0, fZGap = -0.1, fYOffset = -0.19, vRot = {0.0,0.0,0.0}},
        ['Bridge'] =     {iNum = 0, iStack = 3, fZSpace = 0.4, fXSpace = 0.0, fYSpace = 0.2, fXGap = 0.0, fZGap = -0.1, fYOffset = 0.3, vRot = {0.0,0.0,0.0}},
        ['Ship'] =       {iNum = 15, iStack = 5, fZSpace = 0.4, fXSpace = 1.1, fXGap = 1.3, fZGap = -0.05, fYOffset = 0.0, vRot = {0.0,0.0,0.0}},
        ['Warship'] =    {iNum = 7, iStack = 7, fZSpace = 0.4, fXSpace = 0.0, fXGap = 0.0, fZGap = -0.09, fYOffset = 0.0, vRot = {0.0,0.0,0.0}},
        ['Chit'] =       {iNum = iNumChits, iStack = 1, fZSpace = 0.0, fXSpace = 0.0, fYSpace = 0.12, fXGap = 0.0, fZGap = 0.5, fYOffset = -0.28, vRot = {0.0,-90.0,0.0}},
        ['Knight'] =     {iNum = 0, iStack = 6, fZSpace = 0.4, fXSpace = 0.0, fYSpace = 0.22, fXGap = 0.0, fZGap = -0.1, fYOffset = -0.17, vRot = {0.0,0.0,0.0}}, --knight for the Barbarian Attack scenario
        ['Wall'] =       {iNum = 3, iStack = 1, fZSpace = 0.0, fXSpace = 0.0, fYSpace = 0.15, fXGap = 1.3, fZGap = 0.25, fYOffset = -0.21, vRot = {0.0,0.0,0.0}},
        ['Merchant'] =   {iNum = 1, iStack = 1, fZSpace = 0.0, fXSpace = 0.0, fXGap = 0.0, fZGap = 1.2, fYOffset = 0.44, vRot = {0.0,0.0,0.0}},
        ['Mighty Knight'] = {iNum = 2, iStack = 1, fZSpace = 0.0, fXSpace = 0.0, fYSpace = 0.19, fXGap = 1.3, fZGap = 0.15, fYOffset = -0.18, vRot = {0.0,0.0,180.0}},
        ['Strong Knight'] = {iNum = 2, iStack = 1, fZSpace = 0.0, fXSpace = 0.0, fYSpace = 0.19, fXGap = 0.0, fZGap = 1.0, fYOffset = -0.18, vRot = {0.0,0.0,180.0}},
        ['Basic Knight'] =  {iNum = 2, iStack = 1, fZSpace = 0.0, fXSpace = 0.0, fYSpace = 0.19, fXGap = 0.0, fZGap = 1.85, fYOffset = -0.18, vRot = {0.0,0.0,180.0}},
    }

    if m_CurScenario.bUseBAttack and isCKenabled() == false then
        BuildOrder['Knight'].iNum = 6
        BuildOrder['Knight'].fXGap = 1.3
    end

    if bAddWarShips == true then
        --spawn one row of ships less when warships are used
        BuildOrder['Ship'].iNum = 10
    end

    if getScenarioID() == 'A7' then
        BuildOrder['Ship'].iNum = 4
    end
    if getScenarioID() == 'A10' then
        BuildOrder['Ship'].iNum = 5
    end
    if getScenarioID() == 'T3' then
        BuildOrder['City'].iNum = 8
    end
    if m_CurScenario.bUseRivers then
        BuildOrder['Bridge'].iNum = 3
    end
    if getScenarioID() == 'A8' then
        BuildOrder['Bridge'].iNum = 3
    end
    if getScenarioID() == 'B2' then --2 player version: fewer buildings are available to each player
        BuildOrder['Settlement'].iNum = 4
        BuildOrder['City'].iNum = 3
    end

    for sCol, Opt in pairs(PlayerPos) do
        local Objects = {
            ['City'] = {},
            ['Settlement'] = {},
            ['Road'] = {},
            ['Bridge'] = {},
            ['Ship'] = {},
            ['Warship'] = {},
            ['Chit'] = {},
            ['Knight'] = {},
            ['Wall'] = {},
            ['Merchant'] = {},
            ['Mighty Knight'] = {},
            ['Strong Knight'] = {},
            ['Basic Knight'] = {},
        }

        --Find all building models for this color
        for i, Obj in pairs(AllObj) do
            local sName = Obj.getName()
            if Obj.getDescription() == sCol or Obj.getVar('sPlayer') == sCol then
                if sName == 'Settlement' or sName == 'Road' or sName == 'Ship' or sName == 'Warship'
                or sName == 'Wall' or sName == 'Merchant' or sName == 'Basic Knight' or sName == 'Strong Knight' or sName == 'Mighty Knight' or sName == 'Bridge' then
                    table.insert(Objects[sName], Obj)
                end
            end

            if sName == 'Indicator Special Build Phase' then
                destroyObject(Obj) --destroy existing indicators (simpler than to implement some association to a color for repositioning...)
            elseif sName == 'City' then
                destroyObject(Obj) --respawn cities all the time to ensure proper city type (snap or not) for the setting
            elseif string.sub(sName, 1, 10) == 'Catan Chit' then --Delete all existing Catan Chits
                destroyObject(Obj)
            end
        end

        --Make sure the number of items is good
        for sItem, Order in pairs(BuildOrder) do
            --destroy unneeded objects
            if (isCKenabled() == false and (sItem == 'Wall' or sItem == 'Merchant' or sItem == 'Basic Knight' or sItem == 'Strong Knight' or sItem == 'Mighty Knight')) then
                for i, Obj in pairs(Objects[sItem]) do
                    destroyObject(Obj)
                end
            elseif (bAddShips == false and sItem == 'Ship') or (bAddWarShips == false and sItem == 'Warship') then
                for i, Obj in pairs(Objects[sItem]) do
                    destroyObject(Obj)
                end
            else
                --check if new items need to be spawned
                local iCur = #Objects[sItem]
                while iCur < Order.iNum do
                    table.insert(Objects[sItem], 'X') --spawn a new item
                    iCur = iCur + 1
                end
                --delete excess items
                while iCur > Order.iNum do
                    local DelObj = table.remove(Objects[sItem], #Objects[sItem])
                    destroyObject(DelObj)
                    iCur = iCur - 1
                end
            end
        end

        --Place the items on the table
        local vPos = {x=Opt.vStart.x, y=Opt.vStart.y, z=Opt.vStart.z}
        local fModX = 1.0
        local fModZ = 1.0
        if Opt.bLTR == false then
            fModX = -1.0
        end
        if Opt.vStart.z < 0.0 then
            fModZ = -1.0
        end

        for sItem, V in pairs(BuildOrder) do
            if V.iNum == 0 or (sItem == 'Ship' and bAddShips == false) or (sItem == 'Warship' and bAddWarShips == false) then
                --Nothing to be spawned - skip these columns
            else
                vPos.z = Opt.vStart.z + (V.fZGap * fModZ)
                vPos.y = Opt.vStart.y + V.fYOffset
                vPos.x = vPos.x + (V.fXGap * fModX)
                if Objects[sItem] ~= nil then
                    for i, Obj in pairs(Objects[sItem]) do
                        if Obj == 'X' then
                            if sItem == 'Ship' and bAddShips == true then --ship missing -> spawn it
                                Obj = spawnShip({vPosition = vPos, vRotation = V.vRot, sPlayer = sCol})
                            elseif sItem == 'Warship' and bAddWarShips == true then
                                Obj = spawnShip({vPosition = vPos, vRotation = V.vRot, sPlayer = sCol, bIsWarShip = true})
                            elseif sItem == 'Chit' then
                                Obj = spawnCatanChit({vPosition = vPos, vRotation = {V.vRot[1],V.vRot[2]+(90.0*fModZ),V.vRot[3]}, sPlayer = sCol, sCatanChitDesc = params.sCatanChitDesc})
                            elseif sItem == 'Wall' and isCKenabled() == true then
                                Obj = spawnWall({vPosition = vPos, vRotation = V.vRot, sPlayer = sCol})
                            elseif sItem == 'Merchant' and isCKenabled() == true then
                                Obj = spawnMerchant({vPosition = vPos, vRotation = {V.vRot[1],V.vRot[2],V.vRot[3]}, sPlayer = sCol})
                            elseif sItem == 'Basic Knight' and isCKenabled() == true then
                                Obj = spawnKnight({vPosition = vPos, vRotation = {V.vRot[1],V.vRot[2]+(90.0*fModZ),V.vRot[3]}, sPlayer = sCol, sType = 'Basic'})
                            elseif sItem == 'Strong Knight' and isCKenabled() == true then
                                Obj = spawnKnight({vPosition = vPos, vRotation = {V.vRot[1],V.vRot[2]+(90.0*fModZ),V.vRot[3]}, sPlayer = sCol, sType = 'Strong'})
                            elseif sItem == 'Mighty Knight' and isCKenabled() == true then
                                Obj = spawnKnight({vPosition = vPos, vRotation = {V.vRot[1],V.vRot[2]+(90.0*fModZ),V.vRot[3]}, sPlayer = sCol, sType = 'Mighty'})
                            elseif sItem == 'Settlement' then --never should have implemented this scenario :'( only needed for S7
                                Obj = spawnSettlement(vPos, sCol)
                            elseif sItem == 'City' then
                                Obj = spawnCity(vPos, {V.vRot[1],V.vRot[2]*fModX,V.vRot[3]}, sCol, isCKenabled())
                            elseif sItem == 'Bridge' then
                                Obj = spawnBridge(vPos, sCol)
                            elseif sItem == 'Knight' then
                                Obj = spawnBAttackKnight({vPosition = vPos, vRotation = vRot, sPlayer = sCol})
                            end
                        else
                            if sItem == 'Basic Knight' or sItem == 'Strong Knight' or sItem == 'Mighty Knight' then
                                Obj.setRotation({V.vRot[1],V.vRot[2]+(90.0*fModZ),V.vRot[3]})
                            elseif sItem == 'City' then --rotate cities to settlements so no items are spawned to high next to one to avoid the snap points grabbing them
                                Obj.setRotation({V.vRot[1],V.vRot[2]*fModX,V.vRot[3]})
                            else
                                Obj.setRotation({V.vRot[1],V.vRot[2],V.vRot[3]})
                            end
                            Obj.setPosition(vPos)
                        end

                        if i % V.iStack == 0 then --start new stack
                            vPos.z = Opt.vStart.z + (V.fZGap * fModZ)
                            vPos.x = vPos.x + (V.fXSpace * fModX)
                            if V.fYSpace ~= nil then --stack vertical
                                vPos.y = vPos.y + V.fYSpace
                            else
                                vPos.y = Opt.vStart.y + V.fYOffset
                            end
                        else
                            vPos.z = vPos.z + (V.fZSpace * fModZ)
                        end
                    end
                end
            end
        end
    end

    --Spawn pawns as indicators for the special build phase when playing with 5-6 players
    if m_CurScenario.bExtension == true and m_MapScript ~= nil then
        for sPlayer, Info in pairs(m_PlayerColors) do
            --spawn the pawn next to the counter
            local CounterObj = getObjectFromGUID(m_MapScript.call('getCounterGUID', {sColor = sPlayer}))
            if CounterObj ~= nil then
                local vCounterPos = CounterObj.getPosition()
                local fXoff = 2.0
                if vCounterPos.z > 0.0 then
                    fXoff = fXoff * -1.0
                end
                local vPos = {vCounterPos.x + fXoff, 1.0, vCounterPos.z}
                spawnSpecialBuildPhasePawn({vPos = vPos, sColor = sPlayer})
            end
        end
    end
end

--handle 'Shuffle Cards' buttons for player hands: show button only for used colors / hide them for unused
function onPlayerChangeColor(player_color)
    if player_color == nil then return end
    local Zones = { ['Green'] = 'd866a9',
                    ['Blue'] = 'f37d36',
                    ['Purple'] = 'a60284',
                    ['Orange'] = '15c3aa',
                    ['Red'] = '24632e',
                    ['White'] = 'cdde1f',
                }

    for sColor, sGUID in pairs(Zones) do
        local Zone = getObjectFromGUID(sGUID)
        if Zone ~= nil then
            if sColor == player_color then --spawn the button for the newly occupied color
                Zone.call('createShuffleButton')
            else --check unoccupied player zones and remove the shuffle buttons if there are no more cards in the player area
                if Player[sColor] ~= nil and Player[sColor].seated == false then
                    if #Player[sColor].getHandObjects() == 0 then
                        Zone.clearButtons()
                    end
                end
            end
        end
    end
end

--shuffle the resource card in a player hand
function shuffleHandCards(p)
    --[[
    if p.sZoneColor ~= p.sPlayer then --players may only press their own button
        broadcastToColor('You can only shuffle your own cards', p.sPlayer, {1.0,1.0,1.0})
        return
    end
    --]]

    local Cards = Player[p.sZoneColor].getHandObjects()
    local ShuffleItems = {}
    for i, Card in pairs(Cards) do
        if Card.tag == 'Card' then
            local sName = Card.getName()
            --find all resource / commodity cards to shuffle
            if sName == 'Lumber' or sName == 'Bricks' or sName == 'Wool' or sName == 'Grain' or sName == 'Ore' or sName == 'Paper' or sName == 'Cloth' or sName == 'Coins' then
                table.insert(ShuffleItems, Card)
            end
        end
    end
    --randomize resource card positions
    if #ShuffleItems > 1 then
        for i = #ShuffleItems, 2, -1 do
            local iRand = math.random(i)
            local vPosCard = ShuffleItems[i].getPosition()
            local vPosRand = ShuffleItems[iRand].getPosition()
            ShuffleItems[i].setPosition(vPosRand)
            ShuffleItems[iRand].setPosition(vPosCard)
        end
        --make all cards move a bit as feedback that the shuffle function did something and to obfuscate whether cards changed position or not
        local fHandCenter = Player[p.sZoneColor].getPlayerHand().pos_x
        for i = 1, #ShuffleItems do
            local vPosNew = ShuffleItems[i].getPosition()
            local fOffset = -0.2
            if vPosNew.x < fHandCenter then
                fOffset = 0.2
            end
            ShuffleItems[i].setPosition({vPosNew.x+fOffset,vPosNew.y,vPosNew.z})
        end
    end
end

-- spawn the pirate ship (called from the control panel on map load)
function spawnPirate(params)
    local vRot = {0.0,160.0,0.0} --make him look like he is going somewhere :-)
    if params.vRot ~= nil then
        vRot = params.vRot
    end
    local ShipObj = spawnShip({vPosition = params.vPos, vRotation = vRot, vScale = {1.2,1.2,1.2}})
    if ShipObj ~= nil then
        ShipObj.setName('Pirate Ship (Arrrr)')
        ShipObj.setDescription('May be moved INSTEAD of the robber. The pirate is placed in the center of ocean tiles and blocks new ships from being built on this tile. Ships adjacent to the hex cannot be moved.')
        ShipObj.setColorTint({0.15, 0.15, 0.15})
        ShipObj.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'seafarers_add\\') end\\r\\n\\r\\nfunction onObjectDrop(player_color,object)\\r\\n\\r\\nif(object.guid == self.guid) then\\r\\n\\r\\nself.setColorTint(player_color)\\r\\n\\r\\nend\\r\\n\\r\\nend') --so it will be deleted when the next map is spawned
    end
end

function spawnShip(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x, p.vPosition.y, p.vPosition.z}
    params.rotation = p.vRotation
    params.scale = {1.0, 1.0, 1.0}
    if p.vScale ~= nil then
        params.scale = p.vScale
    end
    params.snap_to_grid = false

    local custom = {}
    if p.bIsWarShip == true then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379838327/CFAC6A762AE832DB84513D78947D65D0DE34A39D/'
    else
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379843989/82018A077B99A1206F2B74A1FBAFF2D4304083EF/'
    end
    custom.diffuse = ''
    custom.convex = true
    custom.type = 0 --generic
    custom.material = 1 --wood

    local ShipObj = spawnObject(params)
    ShipObj.setCustomObject(custom)

    if p.sPlayer ~= nil then
        if p.bIsWarShip == true then
            ShipObj.setName('Warship')
        else
            ShipObj.setName('Ship')
        end
        ShipObj.setDescription(p.sPlayer)
        ShipObj.setColorTint(m_PlayerColors[p.sPlayer])
    end

    ShipObj.setLock(true)
    addToUnlockList({Obj = ShipObj})

    return ShipObj
end

--Spawn pawn as an indicator for the special build phase with 5-6 players
function spawnSpecialBuildPhasePawn(p)
    local params = {}
    params.type = 'PlayerPawn'
    params.position = p.vPos
    params.scale = {1.2, 1.0, 1.2}

    local Pawn = spawnObject(params)
    Pawn.setName('Indicator Special Build Phase')
    Pawn.setDescription('Move this pawn in front of your player area before the current player ends their turn to indicate you want to build something in the special build phase. (for 5-6 Players)')
    Pawn.setColorTint(m_PlayerColors[p.sColor])
    Pawn.setLuaScript([[    m_ActiveIndic = nil
                            function onPlayerTurnEnd(player_color_end, player_color_next)
                                if m_ActiveIndic ~= nil then
                                    m_ActiveIndic.destruct()
                                end
                                --check if this pawn is outside the player area and if so spawn an arrow to draw attention
                                local vPos = self.getPosition()
                                if vPos.z > -16.2 and vPos.z < 16.2 then
                                    m_ActiveIndic = Global.call('spawnIndicatorArrow', {vPos = {vPos.x, vPos.y + 1.0 + (self.getScale().y * 1.4), vPos.z}, vScale = {1.0, 1.0, 1.0}, vColor = {1.0,0.8627,0.05098}, fTTL = 6.7})
                                end
                            end
                            function onPickUp(player_color) --remove active arrow when player picks up the pawn
                                if m_ActiveIndic ~= nil then
                                    m_ActiveIndic.destruct()
                                end
                            end
                      ]])
end

--[[ callbackGeneral
    Callback function used by many different objects.
    params:
    vRot        oblig. vector rotation
    vPos        oblig. vector position
    vScale      vector scale
    bLock       bool lock the object
    ThResume    coroutine Coroutine to call after processing the callback
--]]
function callbackGeneral(Obj, p)
    Obj.setRotation(p.vRot)
    Obj.setPosition(p.vPos)
    if p.vScale ~= nil then
        Obj.setScale(p.vScale)
    end
    if p.bLock == true then
        Obj.setLock(true)
    end
    if p.ThResume ~= nil then
        coroutine.resume(p.ThResume)
    end
end

function callbackHex(Obj, p)
    --callbackGeneral(Obj, p)
    callback_HexLoaded()
end

function spawnMetropolisGate(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x,p.vPosition.y,p.vPosition.z}
    params.rotation = p.vRotation

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379846524/3B83C6691E306D61176BBD975A0F31CBCB6F7F71/'
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379849079/1F532EF7B11F7242E8B164E77838D2E028B83D69/'
    custom.diffuse = ''
    custom.type = 1 --figurine
    custom.material = 1 --wood

    local Gate = spawnObject(params)
    Gate.setCustomObject(custom)
    --Add script for scoring: the points have to be awarded when the metropolis is touching a certain players city
    Gate.setLuaScript( [[   m_bLoaded = false
                            function onSave()
                                local ToSave = { sScorer = self.getVar('sScorer') }
                                return JSON.encode(ToSave)
                            end
                            function onLoad(save_state)
                                local saved_data = JSON.decode(save_state)
                                if saved_data ~= nil then
                                    self.setVar('sScorer', saved_data.sScorer)
                                end
                                m_bLoaded = true --workaround: when rewinding time onCollisionEnter can be called before own lua scripts in mapscript are initialized
                            end
                            function onCollisionEnter(collision_info)
                                if self == nil or m_bLoaded == false then
                                    return
                                end
                                if self.getVar('sScorer') ~= nil then --score is applied already, ignore this collision
                                    return
                                end
                                if collision_info == nil then return end
                                local ColObj = collision_info.collision_object
                                if ColObj.getName() == 'City' then
                                    local MapScript = getObjectFromGUID('42fd8e')
                                    if MapScript ~= nil then
                                        --check if the collision is within the map area
                                        local bScore = false
                                        local ChkObj = MapScript.getObjects()
                                        for i, Obj in ipairs(ChkObj) do
                                            if Obj == ColObj then
                                                bScore = true
                                                break
                                            end
                                        end
                                        --award the points
                                        if bScore == true then
                                            if true == MapScript.call('addScore', {iScore = 2, sPlayer = ColObj.getDescription()}) then
                                                self.setVar('sScorer', ColObj.getDescription())
                                            end
                                        end
                                    end
                                end
                            end
                            function onPickUp(player_color) --remove the score from the previous scorer when the gate is picked up
                                local sOldScorer = self.getVar('sScorer')
                                if sOldScorer ~= nil then
                                    self.setVar('sScorer', nil)
                                    local MapScript = getObjectFromGUID('42fd8e')
                                    if MapScript ~= nil then
                                        MapScript.call('subtractScore',{iScore = 2, sPlayer = sOldScorer})
                                    end
                                end
                            end ]] )

    Gate.setName('Metropolis - ' .. p.sType)
    Gate.setDescription('2 Victory Points!\\nPlace it on one of your cities if you reach stage 4 in the ' .. p.sType .. ' category first. If someone else manages to get to stage 5 first you have to give the metropolis to this player.')
    if p.sType == 'Politics' then
        Gate.setColorTint({0.0,0.37647,0.67843})
    elseif p.sType == 'Science' then
        Gate.setColorTint({0.0,0.64313,0.32156})
    elseif p.sType == 'Trade' then
        Gate.setColorTint({0.97255,0.74902,0.08235})
    end
end
\n\nfunction spawnCKCounter(p)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = p

    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/1666853884554238781/C138BD0F4D8D71F435FF72A5C58AD7630B2A5BD1/'
    custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601381658626/C5AA874A01D6579D4357F6F32BD61B12B7896448/'
    custom.thickness = '0.10'\n    custom.position = p
    local counter = spawnObject(params)
    counter.setCustomObject(custom)\n    counter.scale(2)\n    counter.setName('C&K Counter')\n    counter.setDescription('Tracks the number of player Cities and Knights on the board (top) and individual knight strength (bottom) Save Catan!'\r)
    
    counter.setLuaScript([[ m_iCities = 0
    m_BtnIdx = {}
    function dummy() end
    function onLoad(save_state)
        local iBtnIdx = 0
        -- Create dummy buttons as display
        --City button (ID 0)
        local button_parameters = {}
        button_parameters.function_owner = self
        button_parameters.click_function = 'dummy'
        button_parameters.rotation = {0.0, 0.0, 0.0}
        local iBtnIdx = 0
        -- Create dummy buttons as display
        --City button (ID 0)
        button_parameters.font_color = {r=1,g=1,b=1}
        button_parameters.tooltip = 'Total Cities'
        button_parameters.position = {-0.48, 0.1, -0.53}
        button_parameters.width = 0
        button_parameters.height = 0
        button_parameters.font_size = 250
        button_parameters.label = '0'
        self.createButton( button_parameters )
        m_BtnIdx['TotalCities'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        --Knights button (ID 1)
        button_parameters.label = '0'
        button_parameters.tooltip = 'Total Knights'
        button_parameters.position = {1.2, 0.1, -0.53}
        self.createButton(button_parameters)
        m_BtnIdx['TotalKnights'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        --Knight Strength per player button
        button_parameters.font_size = 180
        button_parameters.label = '0'
        button_parameters.tooltip = 'Orange Knights'
        button_parameters.position = {0.27, 0.1, 0.5}    --Orange Knights
        self.createButton(button_parameters)
        m_BtnIdx['Orange'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        button_parameters.label = '0'
        button_parameters.tooltip = 'Red Knights'
        button_parameters.position = {0.8, 0.1, 0.5}    --Red Knights
        self.createButton(button_parameters)
        m_BtnIdx['Red'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        button_parameters.label = '0'
        button_parameters.tooltip = 'White Knights'
        button_parameters.position = {1.33, 0.1, 0.5}     --White Knights
        self.createButton(button_parameters)
        m_BtnIdx['White'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        button_parameters.label = '0'
        button_parameters.tooltip = 'Green Knights'
        button_parameters.position = {-1.32, 0.1, 0.5}    --Green Knights
        self.createButton(button_parameters)
        m_BtnIdx['Green'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        button_parameters.label = '0'
        button_parameters.tooltip = 'Blue Knights'
        button_parameters.position = {-0.79, 0.1, 0.5}    --Blue Knights
        self.createButton(button_parameters)
        m_BtnIdx['Blue'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
        button_parameters.label = '0'
        button_parameters.tooltip = 'Purple Knights'
        button_parameters.position = {-0.26, 0.1, 0.5}     --Purple Knights
        self.createButton(button_parameters)
        m_BtnIdx['Purple'] = iBtnIdx
        iBtnIdx = iBtnIdx + 1
    
        if getObjectFromGUID('42fd8e') ~= nil then --check if the map script exists and only enable counter functions if so (avoid errors when spawned outside the settlers mod)
            startLuaCoroutine(self, 'initializeCityCount')
            startLuaCoroutine(self, 'initializeKnightCount')
    
            Global.call('registerKnightEventReceiver', {Obj = self})
        end
    end
    function setCityCount(iNum)
        self.editButton({index = 0, label = iNum, width = 0, height = 0})
    end
    function setKnightCount(KnightStr)
        local iTotalStr = 0
        for sColor, iStrength in pairs(KnightStr) do
            iTotalStr = iTotalStr + iStrength
            --update the player counter
            self.editButton({index = m_BtnIdx[sColor], label = iStrength, width = 0, height = 0})
        end
        --update the total knight strength
        self.editButton({index = 1, label = iTotalStr, width = 0, height = 0})
    end
    function resetCounter()
        m_iCities = 0
        self.editButton({index = 0, label = '0', width = 0, height = 0})
        self.editButton({index = 1, label = '0', width = 0, height = 0})
    end
    function onKnightCollision()
        --some knight collided with something -> just count all active knights again
        setKnightCount(getKnightStrength())
    end
    function initializeKnightCount()
        coroutine.yield() --wait a frame to allow map script zone to initialize (if they are loaded in the same frame (rewind))
        setKnightCount(getKnightStrength())
        return true
    end
    function initializeCityCount()
        coroutine.yield() --wait a frame to allow map script zone to initialize (if they are loaded in the same frame (rewind))
        local iNum = 0
        local MapScript = getObjectFromGUID('42fd8e')
        if MapScript ~= nil then
            local BoardObjects = MapScript.getObjects()
            for i, Obj in pairs(BoardObjects) do
                local sName = Obj.getName()
                if sName == 'City' then
                    iNum = iNum + 1
                end
            end
        end
        m_iCities = iNum
        setCityCount(iNum)
        return true
    end
    function onObjectEnterScriptingZone(zone, enter_object)
        if zone.getGUID() == '42fd8e' and enter_object.getName() == 'City' then
            m_iCities = m_iCities + 1
            setCityCount(m_iCities)
        end
    end
    function onObjectLeaveScriptingZone(zone, leave_object)
        if zone.getGUID() == '42fd8e' and leave_object.getName() == 'City' then
            m_iCities = m_iCities - 1
            setCityCount(m_iCities)
        end
    end
    function getKnightStrength()
        local Knights = { ['Orange'] = 0, ['Red'] = 0, ['White'] = 0, ['Green'] = 0, ['Blue'] = 0, ['Purple'] = 0 }
        local MapScript = getObjectFromGUID('42fd8e')
        if MapScript ~= nil then
            local BoardObjects = MapScript.getObjects()
            for i, Obj in pairs(BoardObjects) do
                local sName = Obj.getName()
                if string.find(sName, 'Knight') then
                    local zRot = Obj.getRotation().z
                    if zRot < 230.0 and zRot > 150.0 or Obj.held_by_color ~= nil then
                        --ignore inactive knights and ones currently held by a player
                    else
                        local bAdd = true
                        --and of course there is no way this is going down without exceptions ;-): In scenarios T5 and T6 only knights ont he main island count
                        local sSID = Global.call('getScenarioID')
                        if sSID == 'T5' then
                            local vKPos = Obj.getPosition()
                            if Global.call('isUsingExtension') then --5-6 players layout
                                if vKPos.z < -5.9 or
                                   (vKPos.z < -3.0 and vKPos.x < -6.97) or
                                   (vKPos.z < -0.15 and vKPos.x < -9.64) then
                                    bAdd = false
                                end
                            else --3-4 players layout
                                if vKPos.z < -5.9 or
                                   (vKPos.z < -3.0 and vKPos.x < -3.9) or
                                   (vKPos.z < -0.15 and vKPos.x < -6.36) then
                                    bAdd = false
                                end
                            end
                        end
                        if sSID == 'T6' then
                            local vKPos = Obj.getPosition()
                            if Global.call('isUsingExtension') then --5-6 players layout
                                if vKPos.z < 2.7 and vKPos.x > -2.5 then
                                    bAdd = false
                                end
                            else --3-4 players layout
                                if vKPos.z < 2.7 and vKPos.x > -4.34 then
                                    bAdd = false
                                end
                            end
                        end
    
                        if bAdd then
                            local sDesc = Obj.getDescription()
                            if Knights[sDesc] ~= nil then
                                if sName == 'Basic Knight' then
                                    Knights[sDesc] = Knights[sDesc] + 1
                                elseif sName == 'Strong Knight' then
                                    Knights[sDesc] = Knights[sDesc] + 2
                                elseif sName == 'Mighty Knight' then
                                    Knights[sDesc] = Knights[sDesc] + 3
                                end
                            end
                        end
                    end
                end
            end
        end
        return Knights
    end ]])
end
     \n\n
function spawnWall(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x,p.vPosition.y,p.vPosition.z}
    params.rotation = p.vRotation

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379855106/394C23AB4BD900AAD134BD8F8F217B4F5DF2BA82/'
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379857723/2029EA7FC070B4CD260492063BE0D7E7129852E8/'
    custom.diffuse = ''
    custom.type = 0 --generic
    custom.material = 1 --wood

    local Wall = spawnObject(params)
    Wall.setCustomObject(custom)

    Wall.setName('Wall')
    if p.sPlayer ~= nil then
        Wall.setDescription(p.sPlayer)
        Wall.setColorTint(m_PlayerColors[p.sPlayer])
    end
end

function spawnKnight(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x,p.vPosition.y,p.vPosition.z}
    params.rotation = p.vRotation
    params.scale = {0.9, 0.9, 0.9}

    local custom = {}
    if p.sType == 'Mighty' then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601380173660/814EB937A7102F76BF68D7D891190B1C895C2DF4/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380178917/0E84E940D57266A700908F2B3EFFD20662B2CABF/'
    elseif p.sType == 'Strong' then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601380175749/27E1062B3DD72D7CDAC4A776C02D9088CF0B67D1/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380180091/6D683F3DF23C367CCAAC0191C384D2906389EE45/'
    elseif p.sType == 'Basic' then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601380177408/EFE31FE4FF37E006E1825A56DC56E7F5678D4618/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380181828/C1384EA9F5BFAFCA59A27456243C4DC601C9C361/'
    end
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379865464/95822A8471E23E0A048D10243B63BF31137336F2/'
    custom.type = 0 --generic
    custom.material = 1 --wood

    local KnightToken = spawnObject(params)
    KnightToken.setCustomObject(custom)

    KnightToken.setName(p.sType .. ' Knight')
    if p.sPlayer ~= nil then
        KnightToken.setDescription(p.sPlayer)
        KnightToken.setColorTint(m_PlayerColors[p.sPlayer])
    end

    --report the collision to possible receivers (Cities / Knights counter tool)
    KnightToken.setLuaScript([[ m_bActive = false
                                function onLoad(save_state)
                                    m_bActive = true --workaround for possible collision calls before stuff is initialized
                                end
                                function onCollisionEnter(collision_info)
                                    if m_bActive then
                                        Global.call('reportKnightCollision')
                                    end
                                end
                                function onPickUp(player_color)
                                    Global.call('reportKnightCollision')
                                end ]])
end

function spawnMerchant(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x,p.vPosition.y,p.vPosition.z}
    params.rotation = p.vRotation

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379869495/388CFE018FFB1969CBD518D22737FD5D6D4D5818/'
    custom.collider = ''
    custom.diffuse = ''
    custom.type = 1 --figurine
    custom.material = 1 --wood

    local Trader = spawnObject(params)
    Trader.setCustomObject(custom)
    Trader.use_snap_points = false

    Trader.setName('Merchant')
    Trader.setDescription('When you play the progress card Merchant you may place your Merchant on a hex adjacent to one of your Settlements/Cities. As long as your merchant is active you may trade the resource he is placed on 2:1 with the bank. There can only be one merchant active at a time. If another player has his or her merchant on the map, he has to remove it. You get 1 Victory Point for an active merchant.')
    if p.sPlayer ~= nil then
        Trader.setLuaScript('function onLoad() self.setVar(\\'sPlayer\\', \\'' .. p.sPlayer .. '\\') end')
        Trader.setColorTint(m_PlayerColors[p.sPlayer])
    end
end

function spawnCatanChit(p)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = {p.vPosition.x, p.vPosition.y, p.vPosition.z}
    params.rotation = p.vRotation
    params.scale = {0.37, 1.0, 0.37}

    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379873242/F2E9C25F70C5154ACD5407238EFBCA0AC527A625/'
    custom.type = 0 --Box
    custom.thickness = 0.1

    local Chit = spawnObject(params)
    Chit.setCustomObject(custom)

    Chit.setName('Catan Chit')
    if p.sCatanChitDesc ~= nil then
        Chit.setDescription(p.sCatanChitDesc)
    end
    if p.sPlayer ~= nil then
        Chit.setName('Catan Chit - ' .. p.sPlayer)
        Chit.setColorTint(m_PlayerColors[p.sPlayer])
    end
    Chit.setLock(true)

    if p.bLock ~= true then
        addToUnlockList({Obj = Chit})
    end

    return Chit
end

function spawnSettlement(vPos, sColor)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {vPos.x,vPos.y,vPos.z}
    params.rotation = {0.0,90.0,0.0}

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379876219/C36F94BAF590D30E6CE987015C610096E4CFB1A0/'
    custom.type = 0 --generic
    custom.material = 1 --wood

    local Settlement = spawnObject(params)
    Settlement.setCustomObject(custom)

    Settlement.setName('Settlement')
    Settlement.setDescription(sColor)
    Settlement.setColorTint(m_PlayerColors[sColor])
end

function spawnCity(vPos, vRot, sColor, bSnap)

    local spawnParams = {
      json = '',
      position = vPos,
      rotation = vRot,
      scale = {x=1, y=1, z=1},
      sound = false,
      snap_to_grid = false,
    }
    spawnParams.json = [[{\"Name\": \"Custom_Model\",\"Transform\":{\"posX\": 0.0,\"posY\": 0.0,\"posZ\": 0.0,\"rotX\": 0.0,\"rotY\": 90.0,\"rotZ\": 0.0,\"scaleX\": 1.0,\"scaleY\": 1.0,\"scaleZ\": 1.0},
                          \"Nickname\": \"City\",\"Description\": \"\",\"ColorDiffuse\": {\"r\": 0.0,\"g\": 0.0,\"b\": 0.0},
                          \"Locked\": false,\"Grid\": false,\"Snap\": true,\"Autoraise\": true,\"Sticky\": true,\"Tooltip\": true,\"GridProjection\": false,
                          \"CustomMesh\": { \"MeshURL\": \"http://cloud-3.steamusercontent.com/ugc/155773601379968288/7C90D14438E242A55B5D9AE341F6B04324497844/\",\"DiffuseURL\": \"\",
                                          \"NormalURL\": \"\",\"ColliderURL\": \"http://cloud-3.steamusercontent.com/ugc/155773601379974669/A9D471291F61C37755E461695E31F31846136135/\",
                                          \"Convex\": true, \"MaterialIndex\": 1, \"TypeIndex\": 0, \"CustomShader\":{\"SpecularColor\":{\"r\": 0.8745098,\"g\": 0.8117647,\"b\": 0.745098054},\"SpecularIntensity\": 0.05,\"SpecularSharpness\": 3.0,\"FresnelStrength\": 0.1},
                                          \"CastShadows\": true },]]
    if bSnap then
      spawnParams.json = spawnParams.json .. '\"AttachedSnapPoints\": [{ \"Position\": {\"x\": 0.0,\"y\": 0.0904851,\"z\": 0.247542784},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}}]'
    end
    spawnParams.json = spawnParams.json .. '}'
    local CityObj = spawnObjectJSON(spawnParams)
    CityObj.setDescription(sColor)
    CityObj.setColorTint(m_PlayerColors[sColor])
    return CityObj
end

function spawnBridge(vPos, sColor)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {vPos.x,vPos.y,vPos.z}

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379879290/3E67CC0119F31A97C5C8E221EE9A23C873FF03CB/'
    custom.collider = ''
    custom.diffuse = ''
    custom.type = 0 --generic
    custom.material = 1 --wood

    local Bridge = spawnObject(params)
    Bridge.setCustomObject(custom)

    Bridge.setName('Bridge')
    Bridge.setDescription(sColor)
    Bridge.setColorTint(m_PlayerColors[sColor])
end

--Spawn knight token needed for the Barbarian Attack scenario
function spawnBAttackKnight(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x,p.vPosition.y,p.vPosition.z}
    params.rotation = p.vRotation

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379883118/6CB181322189657641C89B44DB60CAD8DC5B880E/'
    custom.diffuse = ''
    custom.type = 1 --figurine
    custom.material = 1 --wood

    local Knight = spawnObject(params)
    Knight.setCustomObject(custom)
    Knight.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'battack\\') end')

    Knight.setName('Knight')
    if p.sPlayer ~= nil then
        Knight.setDescription(p.sPlayer)
        Knight.setColorTint(m_PlayerColors[p.sPlayer])
    end
end

function spawnBarbarians(p)
    if m_CurScenario.bUseBAttack then
        return --no barbarian tile when playing the \"Barbarian Attack\" campaign
    end

    local vPos = {p.fXPos, 1.0, 1.018}
    --spawn the sea tile with the barbarian \"path\"
    local spawnParams = {
      json = '',
      position = vPos,
      rotation = {0.0, -115.0, 0.0},
      sound = false,
    }
    spawnParams.json = [[{ \"Name\": \"Custom_Token\", \"Transform\": {\"posX\":0,\"posY\":0,\"posZ\":0,\"rotX\":0,\"rotY\":240,\"rotZ\":0,\"scaleX\": 1.0,\"scaleY\": 1.0,\"scaleZ\": 1.0},
  \"Nickname\": \"\",\"Description\": \"Barbarian route\",\"ColorDiffuse\": {\"r\": 1.0,\"g\": 1.0,\"b\": 1.0},
  \"Locked\": false,\"Grid\": false,\"Snap\":false,\"Autoraise\": true,\"Sticky\": true,\"Tooltip\": true,\"GridProjection\": false,
  \"CustomImage\": {\"ImageURL\": \"http://cloud-3.steamusercontent.com/ugc/450741327172506210/007C1C7543ADFA6A64EB311294AE344B23BBEE16/\",\"ImageSecondaryURL\": \"\",\"WidthScale\": 0.0,
  \"CustomToken\": {\"Thickness\": 0.1,\"MergeDistancePixels\": 15.0,\"Stackable\": false}},
  \"AttachedSnapPoints\":[{\"Position\": {\"x\": 1.24433219,\"y\": 0.05,\"z\": -1.10996151},\"Rotation\": {\"x\":0,\"y\":270,\"z\":0}},{\"Position\": {\"x\": 1.25466645,\"y\": 0.05,\"z\": -0.186871886},\"Rotation\": {\"x\": 0,\"y\": 264.0,\"z\":0}},
\t\t\t\t\t\t{\"Position\": {\"x\": 1.25102139,\"y\": 0.05,\"z\": 0.7510462},\"Rotation\": {\"x\":0,\"y\": 155,\"z\":0}},{\"Position\": {\"x\": 0.335297167,\"y\": 0.05,\"z\": 0.4979036},\"Rotation\": {\"x\":0,\"y\": 130,\"z\":0}},
\t\t\t\t\t\t{\"Position\": {\"x\": -0.292334616,\"y\": 0.05,\"z\": -0.200186551},\"Rotation\": {\"x\":0,\"y\": 130,\"z\":0}},{\"Position\": {\"x\": -1.15396369,\"y\": 0.05,\"z\": -0.7464708},\"Rotation\": {\"x\":0,\"y\": 264,\"z\":0}},
\t\t\t\t\t\t{\"Position\": {\"x\": -1.30079424,\"y\": 0.05,\"z\": 0.218444377},\"Rotation\": {\"x\":0,\"y\": 264,\"z\":0}},{\"Position\": {\"x\": -1.31302512,\"y\": 0.05,\"z\": 1.12471962},\"Rotation\": {\"x\":0,\"y\": 280,\"z\":0}}]}]]
    spawnObjectJSON(spawnParams)

    --spawn the ship
    local params = {}
    params.type = 'Custom_Model'
    params.position = {vPos[1] + 0.5, vPos[2] + 1.0, vPos[3] + 1.6}
    params.rotation = {0.0,155.0,0.0}
    params.scale = {0.7, 0.7, 0.7}

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379886620/8A66725468D9E84827F10A4E973138C525409A87/'
    custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379888618/799E1DC2DD38BE927934E136AFC02AE3DE97563C/'
    custom.type = 1 --figurine
    custom.material = 1 --wood

    local ShipObj = spawnObject(params)
    ShipObj.setCustomObject(custom)

    ShipObj.setName('Automatic Barbarian Ship')
    ShipObj.setDescription('Automaticlly Advances when barbarians are rolled.')
    ShipObj.setColorTint({0.15, 0.15, 0.15})
    ShipObj.setLuaScript([[ m_SnapOff = {   { 1.24433219, 0.0, -1.10996151 },
                { 1.25466645, 0.0, -0.186871886 },
                { 1.25102139, 0.0, 0.7510462 },
                { 0.335297167, 0.0, 0.4979036 },
                { -0.292334616, 0.0, -0.200186551 },
                { -1.15396369, 0.0, -0.7464708 },
                { -1.30079424, 0.0, 0.218444377 },
                { -1.31302512, 0.0, 1.12471962 },
}
m_SnapRot = {   {0.0, 270.0 + 245.0, 0.0},
                {0.0, 264.0 + 245.0, 0.0},
                {0.0, 155.0 + 245.0, 0.0},
                {0.0, 130.0 + 245.0, 0.0},
                {0.0, 130.0 + 245.0, 0.0},
                {0.0, 264.0 + 245.0, 0.0},
                {0.0, 264.0 + 245.0, 0.0},
                {0.0, 280.0 + 245.0, 0.0},
}

m_bDisplayRaidInfo = false
m_BarbarianRoute = nil




function onLoad(save_state)
    if getObjectFromGUID('42fd8e') ~= nil then --check if the map script exists to avoid errors when spawned outside the catan mod
        if Global.call('getModVersion') > 1.31 then
            Global.call('registerDiceEventReceiver', {Obj = self})
        else
            --the dice event receiver is supported by mod versions >= 1.30 only --> display error message
            broadcastToAll('This tool does not work with your version of the Settlers of Catan mod. Please make sure you have the latest version.', {1.0,1.0,1.0})
        end
    end
    iMoved=false
end




function onCardsDealt(p)
    if Global.call('getEventDieValue') == 'barbarians' then
        local NextMove = getMovementParameters()
        moveShip(NextMove)
    end
end



function moveShip(p)
    if iMoved then
        printToAll('The Barbarian Ship has already been moved this turn')
        return
    else
    m_bDisplayRaidInfo = true --moving the ship unlocks the raid message again

    self.setPositionSmooth(p.vPos)
    self.setRotationSmooth(p.vRot)
    iMoved=true
    if p.bMessage then
        m_bDisplayRaidInfo = false --prevent the message from being sent again until ship is picked up or it moves
        local MapScript = getObjectFromGUID('42fd8e')
        if MapScript ~= nil then
            MapScript.call('displayBarbarianRaidMessage')
            flipAllKnights()
            --spawn indicator arrow above the ship
            local params = {}
            params.vPos = {p.vPos[1], p.vPos[2] + 1.7, p.vPos[3]}
            params.vScale = {0.8, 0.8, 0.8}
            params.vColor = {0.6, 0.39, 0.38}
            params.fTTL = 4.4
            Global.call('spawnIndicatorArrow', params)
        end
    end

    end
end


function onPlayerTurnEnd(player_color_end, player_color_next)
    if iMoved == false and Global.call('getEventDieValue') == 'barbarians' then
      printToAll('Do not forget to hit deal! Moving barbarain ship.')
      local NextMove = getMovementParameters()
      moveShip(NextMove)

    end
    iMoved=false
end

function getMovementParameters()
    if m_BarbarianRoute == nil then
        return
    end

    --calculate the actual snap point positions from their offset to the route token
    local SnapPos = {}
    local vBasePos = m_BarbarianRoute.getPosition()
    local fCurHeight = self.getPosition().y
    for i = 1, #m_SnapOff do
        local fSin = math.sin(335.0)
        local fCos = math.cos(335.0)
        local fOffX = m_SnapOff[i][1] * fCos - m_SnapOff[i][3] * fSin
        local fOffZ = m_SnapOff[i][1] * fSin + m_SnapOff[i][3] * fCos
        table.insert(SnapPos, {(vBasePos.x + fOffX), fCurHeight, (vBasePos.z + fOffZ)})
    end

    --determine the current snap point
    local iCurSnap = -1
    local fBestDist = 999.0
    local vCurPos = self.getPosition()
    for i, vPos in ipairs(SnapPos) do
        local fDistance = math.abs(vCurPos.x - vPos[1]) + math.abs(vCurPos.z - vPos[3])
        if fDistance < fBestDist then
            fBestDist = fDistance
            iCurSnap = i
        end
    end

    local iNextSnap = iCurSnap + 1
    if iNextSnap > #SnapPos then
        --reset to the start field (can be done without waiting first, if movement is cancelled the next step will be #2 anyways)
        self.setPosition(SnapPos[1])
        self.setRotation(m_SnapRot[1])
        iNextSnap = 2
    end

    return {    vPos = SnapPos[iNextSnap],
                vRot = m_SnapRot[iNextSnap],
                bMessage = (iNextSnap == #SnapPos)
        }
end


-- Function for flipping knights on raid message triggered
function flipAllKnights()
local MapScript = getObjectFromGUID('42fd8e')
  if MapScript ~= nil then
      local BoardObjects = MapScript.getObjects()
      for i, Obj in pairs(BoardObjects) do
          local sName = Obj.getName()
          if string.find(sName, 'Knight') then
              local zRot = Obj.getRotation().z
              --printToAll('Knight Vector: ' .. zRot)
              if zRot > 230.0 or zRot < 150.0 then
                  Obj.setRotationSmooth({x=0,y=0,z=180})
              end
          end
       end
   end
end


function onCollisionEnter(collision_info)
    if collision_info == nil then return end
    if collision_info.collision_object.tag == 'Dice' then
        --make barbarian (mostly) un-knockoverable from dice
        self.setLock(true)
    elseif collision_info.collision_object.getDescription() == 'Barbarian route' then
        if m_BarbarianRoute ~= collision_info.collision_object then
            m_BarbarianRoute = collision_info.collision_object
        end
        if m_bDisplayRaidInfo then
            --check if the barbarians hit the raid field and post City and Knight count in the chat
            local vPosRoute = collision_info.collision_object.getPosition()
            local vPosShip = self.getPosition()
            local fDistanceX = math.abs(vPosShip.x - vPosRoute.x - (-0.47))
            local fDistanceZ = math.abs(vPosShip.z - vPosRoute.z - (-1.67))
            if fDistanceX < 0.12 and fDistanceZ < 0.12 then
                m_bDisplayRaidInfo = false --prevent the message from being sent again until ship is picked up
                local MapScript = getObjectFromGUID('42fd8e')
                if MapScript ~= nil then
                    MapScript.call('displayBarbarianRaidMessage')
                    flipAllKnights()
                end
            end
        end
    end
end
function onCollisionExit(collision_info)
    if collision_info == nil then return end
    if collision_info.collision_object.tag == 'Dice' then
        self.setLock(false)
    end
end
--stop running timer if a player picks up the ship before it can move
function onPickUp(player_color)
    m_bDisplayRaidInfo = true --picking the ship up unlocks the message again
    Timer.destroy(self.guid)
end
--stop movement if a die gets picked up before the ship moved
function onObjectPickUp(player_color, picked_up_object)
    if picked_up_object.tag == 'Dice' then
        Timer.destroy(self.guid)
    end
end
                            ]])
    ShipObj.setLock(true)
    addToUnlockList({Obj = ShipObj})
end

--Goods tokens for the Traders & Barbarians campaign -> called from the layout definition in the control panel
function spawnGoodsToken(p)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = p.vPos
    params.rotation = p.vRot
    params.scale = {0.5, 1.0, 0.5}
    local custom = {}
    if p.sFront == 'castle' then
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601380186899/B5240B0937C7183C98D014DE7685BDC8583547D8/'
    elseif p.sFront == 'glass_factory' then
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601380192420/750676486E726958714E8528E64DC5AE428A3579/'
    elseif p.sFront == 'quarry' then
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601380193703/F1DDC3B5E87DC1A52A2CF661CE19ABDA3CC5C955/'
    end
    if p.sBack == 'glass' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380191908/A0BBD817C67E9FEE8270845B3898070D9AA0EC69/'
    elseif p.sBack == 'marble' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380193059/1ECD9EB112AF7414F9126FA748D21B3F62086719/'
    elseif p.sBack == 'sand' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380194233/C6C3B2A1E765F9DC5AA4ACD6C79DE625D929588D/'
    elseif p.sBack == 'tools' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380194618/2C6CC8F25692AD86F32D6F2D9AB95CED65AC8E32/'
    end
    custom.type = 0 --Box
    custom.thickness = 0.06

    local Token = spawnObject(params)
    Token.setCustomObject(custom)
    Token.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'traders\\') end')
    if p.sFront == 'glass_factory' then
        Token.setColorTint({0.216,0.596,0.231})
    elseif p.sFront == 'quarry' then
        Token.setColorTint({0.804,0.616,0.224})
    elseif p.sFront == 'castle' then
        Token.setColorTint({0.537,0.839,0.188})
    end
    Token.setName('Commodity Token')
    Token.use_snap_points = false
    Token.dynamic_friction = 1.0
    Token.static_friction = 1.0
    Token.drag = 2.0
    Token.setLock(true)
    addToUnlockList({Obj = Token})

    return Token
end

--spawn specialist card decks
function spawnSpecialistCards(p)
    local DeckBag = getObjectFromGUID('cc360f')
    if DeckBag ~= nil then
        local params = {callback = 'callbackGeneral',
                        callback_owner = Global,
                        params = {vPos = p.vPos, vRot = {0.0, 180.0, 0.0}}
                    }
        takeObjectWorkaround(DeckBag, params)
    end
end

-- find the robber
function getRobber()
    if m_Robber ~= nil then
        return m_Robber
    else
        local AllObj = getAllObjects()
        for i, Obj in ipairs(AllObj) do
            if Obj.getName() == 'Robber' then
                m_Robber = Obj
                return Obj
            end
        end
    end
    return nil
end

function placeRobber(p)
    local Robber = getRobber()
    if Robber ~= nil then
        Robber.setPosition(p.vPos)
        Robber.setLock(true) -- lock for now - it will be unlocked when all hex tiles are spawned
    end
    -- put him in the list of objects to unlock after hexes have finished loading
    addToUnlockList({Obj = Robber})
end


--[[ Dice-Force field for hand zones
     bounces dice incoming from the table side back onto the table
]]--
function onObjectEnterScriptingZone(zone, enter_object)
    if enter_object ~= nil and enter_object.held_by_color == nil then --allow people to carry dice into the hand zones
        if enter_object.tag == 'Dice' then
            if string.sub(zone.getDescription(), 18, 21) == 'Hand' then
                local fMod = 1.0
                if zone.getPosition().z < 0 then fMod = -1.0 end

                local vVel = enter_object.getVelocity()
                if (enter_object.getPosition().z * fMod) < 18.3 and (vVel.z * fMod) > 0 then
                    enter_object.addForce({vVel.x*-0.1,vVel.y*0.8,vVel.z*-1.3}, 4)
                end
            end
        end
    end
end

--[[  Function for the button to align certain tiles to the 'inofficial' grid within the border frames
    This is called when the button on page 2 of the control panel is pressed
]]--
function alignHexes()
    if isMapLoaded() == false then
        return true
    end
    --find the positions of the border tiles to determine map size and offset
    local Borders = { ['left'] = nil, ['top'] = nil, ['right'] = nil, ['bottom'] = nil }
    local AllObj = getAllObjects()
    for i, Obj in ipairs(AllObj) do
        local sObjType = Obj.getVar('sObjType')
        if sObjType ~= nil then
            if sObjType == 'border' then
                --find leftmost border tile
                if Borders['left'] ~= nil then
                    if Borders['left'].getPosition().x > Obj.getPosition().x then
                        Borders['left'] = Obj
                    end
                else
                    Borders['left'] = Obj
                end
                --find topmost border tile
                if Borders['top'] ~= nil then
                    if Borders['top'].getPosition().z < Obj.getPosition().z then
                        Borders['top'] = Obj
                    end
                else
                    Borders['top'] = Obj
                end
                --find rightmost border tile
                if Borders['right'] ~= nil then
                    if Borders['right'].getPosition().x < Obj.getPosition().x then
                        Borders['right'] = Obj
                    end
                else
                    Borders['right'] = Obj
                end
                --find bottommost border tile
                if Borders['bottom'] ~= nil then
                    if Borders['bottom'].getPosition().z > Obj.getPosition().z then
                        Borders['bottom'] = Obj
                    end
                else
                    Borders['bottom'] = Obj
                end
            end
        end
    end

    --calculate possible hex positions
    if Borders['left'] == nil or Borders['top'] == nil or Borders['right'] == nil or Borders['bottom'] == nil then
        print('Error: Unable to determine border frame positions')
        return false
    end

    local HexPos = {}
    local vPos = Borders['left'].getPosition()
    local fXStart = Borders['left'].getPosition().x
    local fXEnd = Borders['right'].getPosition().x - 3.48
    local fZEnd = Borders['top'].getPosition().z
    local fZ = Borders['left'].getPosition().z --start in the middle

    while fZ < fZEnd do
        local fX = fXStart
        while fX < fXEnd do
            fX = fX + 3.48
            table.insert(HexPos, {x=fX, y=0.965, z=fZ})
            if fZ > 1.0 or fZ < -1.0 then --insert positions for the rows above and below the center row in the same loop
                table.insert(HexPos, {x=fX, y=0.965, z=fZ * -1})
            end
        end
        fXStart = fXStart + 1.74
        fXEnd = fXEnd - 1.74
        fZ = fZ + 3.01
    end

    --Find all hex tiles tiles within the map scripting zone
    local HexTiles = {}
    local NumTokens = {}
    local SearchZone = getObjectFromGUID('42fd8e')
    local AllObj = SearchZone.getObjects()
    for i, Obj in ipairs(AllObj) do
        if Obj.getLock() == false then
            local sType = Obj.getVar('sObjType')
            if sType == 'hex' then
                table.insert(HexTiles, Obj)
            elseif sType == 'numtoken' then
                table.insert(NumTokens, Obj)
            end
        end
    end

    --find the closest hex for each position
    local MoveList = {}
    for i, Pos in ipairs(HexPos) do
        local iBestHex = -1
        local fBestHexDist = 3.0
        --find closest hex
        for j, Hex in pairs(HexTiles) do
            local fDistance = math.abs(Pos.x - Hex.getPosition().x) + math.abs(Pos.z - Hex.getPosition().z)
            if fDistance < fBestHexDist then
                iBestHex = j
                fBestHexDist = fDistance
            end
        end
        --find closest number token
        local iBestToken = -1
        local fBestTokenDist = 2.2
        for j, Token in pairs(NumTokens) do
            local fDistance = math.abs(Pos.x - Token.getPosition().x) + math.abs(Pos.z - Token.getPosition().z)
            if fDistance < fBestTokenDist then
                iBestToken = j
                fBestTokenDist = fDistance
            end
        end

        if iBestHex >= 0 then
            local MoveItem = {Hex = HexTiles[iBestHex], vPos = Pos}
            if iBestToken >= 0 and HexTiles[iBestHex].getDescription() ~= 'Lake' then --save the matching hex to this token, ignore lakes because they can have 2 - 4 num tokens
                MoveItem.Token = NumTokens[iBestToken]
            end
            table.insert(MoveList, MoveItem)
            HexTiles[iBestHex] = nil --this hex found its new home, ignore it from now on
            if iBestToken >= 0 then
                NumTokens[iBestToken] = nil
            end
        end
    end

    --position the hexes & tokens
    for i, Item in ipairs(MoveList) do
        local zRot = Item.Hex.getRotation().z
        if zRot < 230.0 and zRot > 150.0 then --it is probably meant to be upside down
            zRot = 180.0
        else
            zRot = 0.0
        end

        if Item.Token ~= nil then
            local zRotToken = Item.Token.getRotation().z
            if zRotToken < 230.0 and zRotToken > 150.0 then --it is probably meant to be upside down
                zRotToken = 180.0
            else
                zRotToken = 0.0
            end
            Item.Token.setRotation({0.0,180.0,zRotToken})
            Item.Token.setPosition({Item.vPos.x, Item.vPos.y + 0.115, Item.vPos.z})
        end

        --rotate to the closest valid angle (default is 90.0 but in case someone wants to place river hexes we need to consider the current rotation)
        local yRot = Item.Hex.getRotation().y
        yRot = math.floor(yRot / 60) * 60 + 30
        Item.Hex.setRotation({0.0,yRot,zRot}) --make sure it is oriented properly to fit in with the other tiles
        if zRot == 180.0 then
            Item.Hex.setPosition({Item.vPos.x, 1.07, Item.vPos.z})
        else
            Item.Hex.setPosition(Item.vPos)
            Item.Hex.setLock(true)
        end
    end

    return true
end

--[[
        Map creation
]]--
--[[ createMap
    Parameters: PlacemInfo  = list of all hexes to be used + parameters for placement of these hexes

    Members of PlacemInfo:
        pos          - XYZ vector -> coordinates to place the tiles in

        sHexType     - type of hex to spawn
        bRandHex     - Flag if this tile should be randomized
        bFlipped     - Start this tile upside down (to be explored by players)
        iNumToken    - Number token to into this position by default (nil = do not place one on this pos/terrain hex)

        vRot         - orientation of the border piece

        sHarborType  - Type of the harbor tile to put in this position by default (nil = do not place one on this pos) values: 'generic','wool','lumber','grain','ore','bricks'
        bRandHarbor  - Flag if this harbor should be randomized
        vHarborRot   - Rotation for the harbor object

        iGroup       - Tile group - needed for seafarers scenarios where certain islands can be randomized but should always have the same resources

        bRobberPos   - Start the robber on this tile
]]--
function createMap( p )
    local PlacemInfo = p.PlacemInfo

    --find position to place the stack of flipped tokens depending on the map size
    local vPosTokenStack = {30.0,1.0,-3.0}
    if m_MapScript ~= nil then
        vPosTokenStack[1] = ((m_MapScript.getScale().x / 2) + m_MapScript.getPosition().x) + 3.0
    end

--  1. Randomize Hexes/Numbers/Harbors which should be randomized
    shuffleHexes( PlacemInfo )
    shuffleChips( PlacemInfo )
    shuffleHarbors( PlacemInfo )
    if m_CurScenario.bUseFishermen then
        setFishTiles( PlacemInfo )
    end

--  2. Spawn objects
    local iTokenStack = 0
    for i, Tile in pairs(PlacemInfo) do

        -- Spawn hex tile
        if Tile.sHexType == 'border' or Tile.sHexType == 'corner' or Tile.sHexType == 'side' then
            spawnBorderTile(Tile.sHexType, Tile.pos, Tile.vRot)
        elseif Tile.sHexType == 'lake' then
            spawnLake({vPosition = Tile.pos, bSecLake = Tile.bSecLake})
        elseif Tile.sHexType == 'castle' then
            spawnCastle(Tile.pos)
        else
            if m_bHiddenTiles and Tile.sHexType ~= 'ocean' then --hide all tiles option enabled
                Tile.bFlipped = true
            end

            local HexTile = spawnHex({sType = Tile.sHexType, vPos = {Tile.pos.x,Tile.pos.y,Tile.pos.z}, vRot = Tile.vRot, bFlipped = Tile.bFlipped})
            if Tile.bRobberPos and Tile.bFlipped ~= true then
                local vPos = Tile.pos
                vPos.y = vPos.y + 1.0
                placeRobber({vPos = vPos})
            end
        end

        -- Spawn number chips
        local Token = nil
        if Tile.iNumToken ~= nil then
            local vPos = Tile.pos
            vPos.y = 1.085
            if m_bHiddenNumbers or Tile.bFlipped then
                if Tile.bFlipped then
                    --the tile this token belongs to is upside down -> spawn it next to the map upside down on a stack
                    iTokenStack = iTokenStack + 1
                    vPos.x = vPosTokenStack[1]
                    --vPos.x = 22.0
                    vPos.y = 1.0 + iTokenStack * 0.1 --when spawning stuff close together they seem to get pushed in the table .. strange ... this here give me very little \"wiggle\" though
                    --vPos.z = -2.0
                    vPos.z = vPosTokenStack[3]
                    if iTokenStack > 20 then
                        vPos.z = vPosTokenStack[3] - 2.1
                        vPos.y = 1.0 + (iTokenStack - 20) * 0.1
                    end
                end
                spawnHiddenNumberToken({iNum = Tile.iNumToken, vPos = vPos})
            else
                if Tile.iNumTokenSec ~= nil then --hex gets 2 number tokens (used with rivers of catan -> 1 tile with 2 and 12)
                    spawnNumberToken( {iNum = Tile.iNumToken, vPosition = {x=vPos.x-0.7,y=vPos.y,z=vPos.z}, vScale = {1.35,1.5,1.35}, vRotation = {0.0,180.0,0.0} } )
                    spawnNumberToken( {iNum = Tile.iNumTokenSec, vPosition = {x=vPos.x+0.7,y=vPos.y,z=vPos.z}, vScale = {1.35,1.5,1.35}, vRotation = {0.0,180.0,0.0} } )
                else
                    spawnNumberToken( {iNum = Tile.iNumToken, vPosition = vPos, vRotation = {0.0,180.0,0.0} } )
                end
            end
        end

        -- Spawn harbor tiles
        local HarborTile = nil
        if Tile.sHarborType ~= nil then
            local vPos = Tile.pos
            vPos.y = 1.073
            HarborTile = spawnHarborTile({sType=Tile.sHarborType, vPos=vPos, vRot=Tile.vHarborRot})
            HarborTile.setLock(true)
        end

        -- Spawn fish grounds for Fishermen expansion
        if Tile.vFishRot ~= nil then
            local FishTile = nil
            local vPos = Tile.pos
            vPos.y = 1.073
            FishTile = spawnFishTile({vPos=vPos, vRot=Tile.vFishRot})
            FishTile.setLock(true)

            --spawn the number token too
            if Tile.iNumTokenFish ~= nil then
                local vPos = Tile.pos
                vPos.y = 1.085
                spawnNumberTokenFish( {iNum = Tile.iNumTokenFish, vPosition = vPos, vRotation = {0.0,180.0,0.0}, FishTile = FishTile } )
            end
        end
    end
end

function spawnHex(p)
    local bFlipped = p.bFlipped or false
    local bLock = (bFlipped ~= true) --keep flipped hexes unlocked
    if p.bLock ~= nil then --additional scenario 4 uses the bLock parameter to spawn some unlocked ocean tiles
        bLock = p.bLock
    end
    local sLock = 'false'
    if bLock then sLock = 'true' end
    local vPos = {p.vPos[1], p.vPos[2], p.vPos[3]}
    local vRot = p.vRot or {0.0,90.0,0.0}
    if bFlipped then
        vRot[3] = 180.0
        vPos[2] = vPos[2] + 0.1
    end

    local HexDef = m_HexObjects[p.sType]
    if HexDef == nil then
        if m_CurScenario.bUseCaravans or m_CurScenario.bUseRivers or m_CurScenario.bUseBAttack or m_CurScenario.bUseTraders then
            SpawnBag = getTaBBag()
            HexDef = SpawnBag.call('getHexDef', {sType = p.sType})
        end
    end

    if HexDef ~= nil then
        local iNext = HexDef.iNext + 1
        if iNext > #HexDef.Texture then
            iNext = 1
        end
        HexDef.iNext = iNext

        m_iSpawnedHexes = m_iSpawnedHexes + 1

        local spawnParams = {
          json = '',
          position = vPos,
          rotation = vRot,
          scale = {x=2, y=1, z=2},
          sound = false,
          snap_to_grid = false,
          callback = \"callback_HexLoaded\",
          callback_owner = Global
        }
        spawnParams.json = [[{ \"Name\": \"Custom_Tile\", \"Transform\": {\"posX\": 0.0,\"posY\": 0.0,\"posZ\": 0.0,\"rotX\": 0.0,\"rotY\": 270.0,\"rotZ\": 0.0,\"scaleX\": 2.0,\"scaleY\": 1.0,\"scaleZ\": 2.0},
          \"Description\": \"]] .. HexDef.sName .. [[\",\"ColorDiffuse\": {\"r\": 0.9921568,\"g\": 0.905882359,\"b\": 0.619607747},
          \"Locked\": ]] .. sLock .. [[,\"Grid\": false,\"Snap\": false,\"Autoraise\": true,\"Sticky\": true,\"Tooltip\": true,\"GridProjection\": false,
          \"CustomImage\": {  \"ImageURL\": \"]] .. HexDef.Texture[iNext] .. [[\",
                            \"ImageSecondaryURL\": \"]] .. m_HexDefaultBack .. [[\",
                            \"WidthScale\": 0.0,\"CustomTile\": {\"Type\": 1,\"Thickness\": 0.1,\"Stackable\": false,\"Stretch\": false}  },
          \"AttachedSnapPoints\": [ ]]
        if p.sType == 's6_desert' or p.sType == 's6_gold' then
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -0.25,\"y\": 0.035,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 270.0,\"z\": 0.0}},'
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.25,\"y\": 0.035,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 90.0,\"z\": 0.0}},'
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.75,\"y\": 0.035,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 90.0,\"z\": 0.0}},'
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -0.75,\"y\": 0.035,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 90.0,\"z\": 0.0}}'
        else
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -0.75,\"y\": 0.035,\"z\": -0.45},\"Rotation\": {\"x\": 0.0,\"y\": 240.0,\"z\": 0.0}},' --corner NW
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -0.75,\"y\": 0.035,\"z\": 0.45},\"Rotation\": {\"x\": 0.0,\"y\": 300.0,\"z\": 0.0}},' --corner SW
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.0,\"y\": 0.035,\"z\": -0.85},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}},' --corner N
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.75,\"y\": 0.035,\"z\": -0.45},\"Rotation\": {\"x\": 0.0,\"y\": 120.0,\"z\": 0.0}},' --corner NE
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.75,\"y\": 0.035,\"z\": 0.45},\"Rotation\": {\"x\": 0.0,\"y\": 60.0,\"z\": 0.0}},' --corner SE
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.0,\"y\": 0.035,\"z\": 0.85},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},' --corner S
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.0,\"y\": 0.035,\"z\": 0.0}},' --center
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 1.0,\"y\": 0.035,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}},' --path E
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.5,\"y\": 0.035,\"z\": 0.85},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}},' --path SE
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -0.5,\"y\": 0.035,\"z\": 0.85},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}},' --path SW
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -1.0,\"y\": 0.035,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}},' --path W
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": -0.5,\"y\": 0.035,\"z\": -0.85},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}},' --path NW
          spawnParams.json = spawnParams.json .. '{\"Position\": {\"x\": 0.5,\"y\": 0.035,\"z\": -0.85},\"Rotation\": {\"x\": 0.0,\"y\": 180.0,\"z\": 0.0}}' --path NE
        end
        spawnParams.json = spawnParams.json .. ']}'
        local HexObj = spawnObjectJSON(spawnParams)
        HexObj.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'hex\\') end')

        m_iLoadingHexes = m_iLoadingHexes + 1

        --If the tile is spawned flipped the name/description must not give away what type of tile it is
        --so we give it some custom scripts to remove the name/description and reset it once it is flipped back (discovered)
        if bFlipped then
            local sName = HexObj.getDescription()
            if sName == '' then
                sName = HexObj.getName()
            end
            HexObj.setLuaScript([[  m_sDesc = ']] .. sName .. [['
                                    function onLoad(save_state) self.setVar('sObjType', 'hex') end
                                    function onCollisionEnter(collision_info)
                                        local zRot = self.getRotation().z
                                        if zRot < 230.0 and zRot > 150.0 then
                                            if self.getDescription() ~= '' then
                                                self.setDescription('')
                                            end
                                        elseif self.getDescription() == '' then
                                            self.setDescription(m_sDesc)
                                        end
                                    end]]
                                )
        end
    end
end

function spawnHex_BACKUP(p)
    local bFlipped = p.bFlipped or false
    local bLock = (bFlipped ~= true) --keep flipped hexes unlocked
    if p.bLock ~= nil then --additional scenario 4 uses the bLock parameter to spawn some unlocked ocean tiles
        bLock = p.bLock
    end
    local vRot = p.vRot or {0.0,90.0,0.0}
    if bFlipped then
        vRot[3] = 180.0
    end

    local params = {}
    params.callback_owner = Global
    params.callback = 'callbackHex'
    params.params = {vPos = p.vPos, vRot = vRot, bLock = bLock}

    local HexDef = m_HexObjects[p.sType]
    local SpawnBag = getObjectFromGUID(m_HexBag)
    if m_CurScenario.bUseCaravans or m_CurScenario.bUseRivers or m_CurScenario.bUseBAttack or m_CurScenario.bUseTraders then
        if HexDef == nil then
            SpawnBag = getTaBBag()
            HexDef = SpawnBag.call('getHexDef', {sType = p.sType})
        end
    end
    if SpawnBag ~= nil and HexDef ~= nil then
        local iNext = HexDef.iNext + 1
        if iNext > #HexDef.Tile then
            iNext = 1
        end

        params.guid = HexDef.Tile[iNext]
        HexDef.iNext = iNext

        m_iSpawnedHexes = m_iSpawnedHexes + 1
        --Workaround as of v7.8: hex tiles must not touch when taken from the bag before being positioned by the callback (Please Berserk, give me scripting access to snap points :'( )
        --Make sure hex tiles to not touch each other after being taken out of their bags
        local fYoff = 0.25
        if m_iSpawnedHexes % 2 == 0 then --alternate the height so we can put them closer together (otherwise there is a noticable delay for hexes that are put far away from their bag)
            fYoff = -0.25
        end
        local iRow = math.floor(m_iSpawnedHexes / 10)
        local fZoff = 0.0
        fZoff = fZoff - (iRow * - 5.0)
        local vBagPos = SpawnBag.getPosition()
        local iRowHex = m_iSpawnedHexes - (iRow * 10)
        params.position = {vBagPos.x - iRowHex * 1.76, vBagPos.y + fYoff, vBagPos.z + fZoff}
        --/

        local HexObj = takeObjectWorkaround(SpawnBag, params)
        HexObj.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'hex\\') end')
        if HexObj.getDescription() == '' then
            HexObj.setDescription(HexObj.getName())
        end
        m_iLoadingHexes = m_iLoadingHexes + 1

        --If the tile is spawned flipped the name/description must not give away what type of tile it is
        --so we give it some custom scripts to remove the name/description and reset it once it is flipped back (discovered)
        if bFlipped then
            local sName = HexObj.getDescription()
            if sName == '' then
                sName = HexObj.getName()
            end
            HexObj.setLuaScript([[  m_sDesc = ']] .. sName .. [['
                                    function onLoad(save_state) self.setVar('sObjType', 'hex') end
                                    function onCollisionEnter(collision_info)
                                        local zRot = self.getRotation().z
                                        if zRot < 230.0 and zRot > 150.0 then
                                            if self.getDescription() ~= '' then
                                                self.setDescription('')
                                            end
                                        elseif self.getDescription() == '' then
                                            self.setDescription(m_sDesc)
                                        end
                                    end]]
                                )
        end
    end
end

function spawnBorderTile(sType, vPosition, vRotation)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {vPosition.x, 1.015, vPosition.z}
    params.rotation = vRotation
    params.callback = 'lockObject'
    params.callback_owner = Global

    local custom = {}
    if sType == 'border' then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601380204690/A9DD85903F9977C30C680739868BED6BD0A11FAF/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380209162/AE668F8B0369BBE7CE2D7F088AC9AEAB6143F086/'
    elseif sType == 'corner' then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601380205664/E08A940216107C4A1AFBB9295E192D449FFF6720/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380209469/91F6A9E1947BA1154A6A62AA511B640147BD1A09/'
    elseif sType == 'side' then
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/847089545433329233/1F25DBBB05E468E83C9B32F7EB53DB293EB42F18/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/847089545433330296/F99FBF3D1ED01F6196F19FEB2ADC1BA353A4683D/'
    end
    custom.collider = custom.mesh
    custom.convex = false
    custom.type = 0
    custom.material = 1

    local Tile = spawnObject(params)
    Tile.setCustomObject(custom)
    Tile.setDescription('Ocean')

    --set a custom variable to identify the object type when the map is reset
    Tile.setVar('sObjType', 'border')
    Tile.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'border\\') end') --keep the variable on rewind

    return Tile
end

function spawnDie(iDie, vPos, vRot)
    local params = {}
    params.type = 'Die_6'
    params.position = {vPos.x,vPos.y,vPos.z}
    params.rotation = vRot
    params.scale = {1.24999976, 1.24999976, 1.24999976}

    local Die = spawnObject(params)
    Die.setColorTint({0.90588,0.82745,0.72157})
    Die.setLuaScript([[ m_bActive = false
                        function enableDie() m_bActive = true end
                        m_sLastPlayer = nil
                        m_bInQueue = false
                        function setQueueStatus(p) m_bInQueue = p.bActive end
                        function onLoad(save_state) m_bActive = true end
                        function onCollisionEnter(collision_info)
                            if m_bInQueue == false then
                                if m_bActive then
                                    m_bInQueue = Global.call('queueDieCheck', {DieObj = self})
                                    Global.call('registerNumberDie', {DieObj = self, iDie = ]] .. iDie .. [[})
                                end
                            end
                        end
                        function onPickUp(player_color)
                            m_sLastPlayer = player_color
                            local MapScript = getObjectFromGUID('42fd8e')
                            if MapScript ~= nil then MapScript.call('hideDealButtonDie') end
                        end
                        function getLastPlayerColor() return m_sLastPlayer end
                    ]])
                    --[[TODO: enable if Berserk finally implements such an event
                    function onRoll(player_color)
                        m_sLastPlayer = player_color
                        --hide the deal button if it is still visible
                        local MapScript = getObjectFromGUID('42fd8e')
                        if MapScript ~= nil then
                            MapScript.call('hideDealButtonDie')
                        end
                    end
                    --]]
    return Die
end
--[[ Spawn custom event die for Cities & Knights
]]
function spawnEventDie(vPos)
    local params = {}
    params.type = 'Custom_Dice'
    params.position = {x=40.5,y=35,z=-10.68}
    params.rotation = {0.0,0.0,0.0}
    params.scale = {1.24999976, 1.24999976, 1.24999976}
    local custom = {
        type = 1, --6 sided
        image = 'http://cloud-3.steamusercontent.com/ugc/155773601379893824/EC932B85B64F5B484FDF35B18B0E7AFE066F1293/'
    }

    local Die = spawnObject(params)
    Die.setCustomObject(custom)
    Die.setLuaScript([[ m_bActive = false
                        function enableDie() m_bActive = true end
                        m_bInQueue = false
                        function setQueueStatus(p) m_bInQueue = p.bActive end
                        function onLoad(save_state) m_bActive = true end
                        function onCollisionEnter(collision_info)
                            if m_bInQueue == false then
                                if m_bActive then
                                    m_bInQueue = Global.call('queueDieCheck', {DieObj = self})
                                    Global.call('registerNumberDie', {DieObj = self, iDie = 3})
                                end
                            end
                        end
                    ]])
    return Die
end

function spawnHarborTile(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPos.x, p.vPos.y, p.vPos.z}
    params.rotation = p.vRot

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379896629/5FBC5A99616B48F733C49103F95F80D1ABA676D8/'
    custom.collider = custom.mesh
    if p.sType == 'generic' then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380215722/13D5E6345E5F179AC0E4B39B0E8E03B4146CEF82/'
    elseif p.sType == 'bricks' then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380214901/8B907632A00BA41614D1E3DA7D7EF49EA1604E1F/'
    elseif p.sType == 'grain' then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380216515/9E2813DD7E2CF9553AFAC42449B14AE653EFDC4C/'
    elseif p.sType == 'lumber' then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380217126/9563E370591EE97786DB2BDBC57E5C48BCF91D73/'
    elseif p.sType == 'ore' then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380217927/17FDA65567BF05F63CF0780540D13C580F227B39/'
    elseif p.sType == 'wool' then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380218943/98A114E362A57FFF06BE329661C811FB1135CC95/'
    end
    custom.type = 0 --generic
    custom.material = 1 --wood

    local HarborObj = spawnObject(params)
    HarborObj.setCustomObject(custom)

    if p.bNoLock == true then
        addToUnlockList({Obj = HarborObj})
    end

    HarborObj.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'harbor\\') end') --keep the variable on rewind

    if p.sType == 'generic' then
        HarborObj.setName('Any 3 : 1')
        HarborObj.setDescription('You may exchange 3 identical resource cards for any 1 other resource card during your turn.')
    elseif p.sType == 'wool' then
        HarborObj.setName('Wool 2 : 1')
        HarborObj.setDescription('You may exchange 2 Wool resource cards for any 1 other resource card during your turn.')
    elseif p.sType == 'lumber' then
        HarborObj.setName('Lumber 2 : 1')
        HarborObj.setDescription('You may exchange 2 Lumber resource cards for any 1 other resource card during your turn.')
    elseif p.sType == 'bricks' then
        HarborObj.setName('Brick 2 : 1')
        HarborObj.setDescription('You may exchange 2 Bricks resource cards for any 1 other resource card during your turn.')
    elseif p.sType == 'grain' then
        HarborObj.setName('Grain 2 : 1')
        HarborObj.setDescription('You may exchange 2 Grain resource cards for any 1 other resource card during your turn.')
    elseif p.sType == 'ore' then
        HarborObj.setName('Ore 2 : 1')
        HarborObj.setDescription('You may exchange 2 Ore resource cards for any 1 other resource card during your turn.')
    end

    return HarborObj
end

function spawnFishTile(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPos.x, p.vPos.y, p.vPos.z}
    params.rotation = p.vRot

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379899883/77EF7A4AE8268E8DA3553A4FA4457000507CB5B2/'
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379902556/884151AB27FD9EA3F96B222C5CF96EA059AE56CB/'
    custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379904511/62647B9C144D291B436069F2A819C468D1130D75/'
    custom.type = 0 --generic
    custom.material = 1 --wood

    local FishTile = spawnObject(params)
    FishTile.setCustomObject(custom)

    if p.bNoLock == true then
        addToUnlockList({Obj = FishTile})
    end

    --set a custom variable to identify the object type when the map is reset
    FishTile.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'fishermen\\') end') --keep the variable on rewind

    return FishTile
end
function spawnLake(p)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = {p.vPosition.x, 0.96, p.vPosition.z}
    params.rotation = {0.0,90.0,0.0}
    params.scale = {1.735, 1.0, 2.0}
    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379906588/A6AD5B05B94BABDCB8F1A4121E5C3003CC2A4277/'
    custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601379910328/F0F3F849353CEADE84EFD7EBC9633E2D515D065B/'
    custom.thickness = 0.1
    custom.type = 1

    local Tile = spawnObject(params)
    Tile.setCustomObject(custom)
    Tile.setDescription('Lake')
    Tile.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'hex\\') end')
    Tile.setColorTint({0.99,0.906,0.62})
    if p.bLock ~= false then
        Tile.setLock(true)
    end

    --Spawn the number tokens for the lake
    local Tokens = {}
    if p.bSecLake == true then --secondary lake for 5-6 players with different number tokens
        table.insert(Tokens, spawnNumberTokenFish( {iNum = 10, vPosition = {x=p.vPosition.x-0.5,y=1.075,z=p.vPosition.z}, vRotation = {0.0,180.0,0.0}} ))
        table.insert(Tokens, spawnNumberTokenFish( {iNum = 4, vPosition = {x=p.vPosition.x+0.5,y=1.075,z=p.vPosition.z}, vRotation = {0.0,180.0,0.0}} ))
    else
        table.insert(Tokens, spawnNumberTokenFish( {iNum = 11, vPosition = {x=p.vPosition.x-0.5,y=1.075,z=p.vPosition.z+0.5}, vRotation = {0.0,180.0,0.0}} ))
        table.insert(Tokens, spawnNumberTokenFish( {iNum = 12, vPosition = {x=p.vPosition.x+0.5,y=1.075,z=p.vPosition.z+0.5}, vRotation = {0.0,180.0,0.0}} ))
        table.insert(Tokens, spawnNumberTokenFish( {iNum = 2, vPosition = {x=p.vPosition.x-0.5,y=1.075,z=p.vPosition.z-0.5}, vRotation = {0.0,180.0,0.0}} ))
        table.insert(Tokens, spawnNumberTokenFish( {iNum = 3, vPosition = {x=p.vPosition.x+0.5,y=1.075,z=p.vPosition.z-0.5}, vRotation = {0.0,180.0,0.0}} ))
    end

    if p.bLock == false then
        for i, Token in ipairs(Tokens) do
            addToUnlockList({Obj = Token})
            Token.use_snap_points = false
        end
    end

    return Tile
end

function spawnCastle(vPosition)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = {vPosition.x, 0.96, vPosition.z}
    params.rotation = {0.0,90.0,0.0}
    params.scale = {1.735, 1.0, 2.0}
    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379912853/A299D139509BD49544CE5E5029B2261D26442D4E/'
    custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601379910328/F0F3F849353CEADE84EFD7EBC9633E2D515D065B/'
    custom.thickness = 0.1
    custom.type = 1

    local Tile = spawnObject(params)
    Tile.setCustomObject(custom)
    Tile.setDescription('Castle')
    Tile.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'hex\\') end')
    Tile.setColorTint({0.99,0.906,0.62})
    Tile.setLock(true)

    if m_bColorDieSpawned == false then
        local params = {}
        params.type = 'Custom_Dice'
        params.position = {vPosition.x, 2.0, vPosition.z}
        params.rotation = {0.0,-90.0,0.0}
        params.scale = {1.24999976, 1.24999976, 1.24999976}

        local Die = spawnObject(params)
        Die.setCustomObject({image = 'http://cloud-3.steamusercontent.com/ugc/155773601379914796/5C44A4A31E8ACF20DBDABF7F19B86D8EDBF077CC/'})
        Die.setName('Color Die')
        Die.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'battack\\') end')
        m_bColorDieSpawned = true
    end

    return Tile
end

function lockObject( Tile )
    Tile.setLock(true)
end

function spawnTABBarbarian(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = p.vPos
    params.rotation = p.vRot
    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379916581/CC5F1A1245557667D4C8A638D33EDACDD211776B/'
    custom.diffuse = ''
    custom.type = 1 --figurine
    custom.material = 1 --wood
    local Barbarian = spawnObject(params)
    Barbarian.setCustomObject(custom)
    Barbarian.setName('Barbarian')
    Barbarian.setColorTint({0.745,0.608,0.4})
    return Barbarian
end

function spawnHiddenNumberToken(p)
    Token = spawnNumberToken( {iNum = p.iNum, vPosition = p.vPos, vScale = p.vScale, vRotation = {0.0,180.0,180.0}} )
    local sScript = 'm_sName = \\'' .. tostring(p.iNum) .. '\\' ' ..
                    Token.getLuaScript() .. --onload event & registration with scriptzone map
                    --Routine to hide the object name while upside down
                    ' function onCollisionEnter(collision_info) ' ..
                        'local zRot = self.getRotation().z ' ..
                        'if zRot < 230.0 and zRot > 150.0 then ' ..
                            'if self.getName() ~= \\'\\' then self.setName(\\'\\') end ' ..
                        'elseif self.getName() == \\'\\' then ' ..
                            'self.setName(m_sName) ' ..
                        'end ' ..
                    'end'
    Token.setLuaScript(sScript)
    Token.setName('')

    addToUnlockList({Obj = Token})

    return Token
end

function spawnNumberToken( p )
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x, p.vPosition.y, p.vPosition.z}
    params.rotation = p.vRotation
    params.scale = {1.5, 1.5, 1.5}
    if p.vScale ~= nil then
        params.scale = p.vScale
    end

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379918528/3DCDB66BED81A36614EE1ADDF4EE9BAC28F3F581/'
    if p.iNum == 2 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380226244/D1B2EE97E84DEE989B29A73D9BEF7863C9C38DC5/'
    elseif p.iNum == 3 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380226640/9EC721CFC6B970FA037495CD5FC2945669ECF5FE/'
    elseif p.iNum == 4 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380226972/08D00021E63566357B54B42F96603C818D22ABCD/'
    elseif p.iNum == 5 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380227302/EC88CC96CDB45A4DD1CD4926EB040CAB07206B1E/'
    elseif p.iNum == 6 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380227728/A8C37F7BBA9AAD1059063731CC5E09BE1B3C954B/'
    elseif p.iNum == 8 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380228044/668F73AFD5E1166AD5136756E0A857E67FA2B2A9/'
    elseif p.iNum == 9 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380228423/A9138776CAF26E2B390E14D795F8CD203D3E1A7D/'
    elseif p.iNum == 10 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380228887/27E401D034ED756729D0936F72350F6BA5F2A0A5/'
    elseif p.iNum == 11 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380229190/7AC8D6001FB37322A545E77FA748862B1C303E29/'
    elseif p.iNum == 12 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380229536/7352353D5C5DE259F280D323FB32929DD2C857D7/'
    end
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379920973/0B3B12438279975756D988CC1F7756D3E152F2D7/'
    custom.type = 0 --generic
    custom.material = 3 --cardboard

    local Token = spawnObject(params)
    Token.setName(p.iNum)
    Token.setCustomObject(custom)

    --set a custom variable to identify the object type when the map is reset
    Token.setVar('sObjType', 'numtoken')
    Token.setLuaScript('function onLoad() ' ..
                            'self.setVar(\\'sObjType\\', \\'numtoken\\') ' .. --keep the variable on rewind
                            'self.setVar(\\'iNum\\', ' .. p.iNum .. ') ' ..
                            'startLuaCoroutine(self, \\'registerToken\\') ' .. --Workaround: onLoad is called before the new object has its own GUID (when copied it still has the GUID of the source object...) -> wait a frame and then register the new token
                        'end ' ..
                        'function registerToken() ' ..
                            'coroutine.yield(0) ' ..
                            'local MapScript = getObjectFromGUID(\\'42fd8e\\') ' ..
                            'if MapScript ~= nil then ' ..
                                'MapScript.call(\\'addNumberChip\\', { TokenObj = self, iNum = self.getVar(\\'iNum\\') }) ' ..
                                'return true ' ..
                            'end ' ..
                            'return false ' ..
                        'end')

    if m_CurScenario.bUseBAttack then --when tokens are turned upside down in this scenario check if any buildings get blocked from it
        Token.setLuaScript( Token.getLuaScript() ..
            [[
                function onCollisionEnter(collision_info)
                    if collision_info ~= nil then
                        if collision_info.collision_object.getVar('sObjType') == 'hex' then
                            local TaBBag = Global.call('getTaBBag')
                            if TaBBag ~= nil then
                                TaBBag.call('checkBarbarianBlocks')
                            end
                        end
                    end
                end
            ]]
        )
    end

    Token.setLock(true)

    return Token
end

function spawnNumberTokenFish(p)
    local params = {}
    params.type = 'Custom_Model'
    params.position = {p.vPosition.x, p.vPosition.y, p.vPosition.z}
    params.rotation = p.vRotation
    params.scale = {0.95, 1.0, 0.95}
    if p.vScale ~= nil then
        params.scale = p.vScale
    end
    params.callback = 'callbackNumberTokenFish'
    params.callback_owner = Global
    params.params = { vScale = params.scale, FishTile = p.FishTile }

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379918528/3DCDB66BED81A36614EE1ADDF4EE9BAC28F3F581/'
    if p.iNum == 2 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380226244/D1B2EE97E84DEE989B29A73D9BEF7863C9C38DC5/'
    elseif p.iNum == 3 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380226640/9EC721CFC6B970FA037495CD5FC2945669ECF5FE/'
    elseif p.iNum == 4 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380226972/08D00021E63566357B54B42F96603C818D22ABCD/'
    elseif p.iNum == 5 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380227302/EC88CC96CDB45A4DD1CD4926EB040CAB07206B1E/'
    elseif p.iNum == 6 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380227728/A8C37F7BBA9AAD1059063731CC5E09BE1B3C954B/'
    elseif p.iNum == 8 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380228044/668F73AFD5E1166AD5136756E0A857E67FA2B2A9/'
    elseif p.iNum == 9 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380228423/A9138776CAF26E2B390E14D795F8CD203D3E1A7D/'
    elseif p.iNum == 10 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380228887/27E401D034ED756729D0936F72350F6BA5F2A0A5/'
    elseif p.iNum == 11 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380229190/7AC8D6001FB37322A545E77FA748862B1C303E29/'
    elseif p.iNum == 12 then
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380229536/7352353D5C5DE259F280D323FB32929DD2C857D7/'
    end
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379920973/0B3B12438279975756D988CC1F7756D3E152F2D7/'
    custom.type = 0 --generic
    custom.material = 3 --cardboard

    local Token = spawnObject(params)
    Token.setName(p.iNum)
    Token.setCustomObject(custom)
    Token.setColorTint({0.305882335,0.499539942,1.0})

    Token.setLuaScript([[   m_sGUIDFishTile = nil
                            function setFishTileGUID(p) m_sGUIDFishTile = p.sGUID end
                            function getFishTileGUID() return m_sGUIDFishTile end
                            function onSave()
                                return JSON.encode({sGUIDFishTile = m_sGUIDFishTile})
                            end
                            function onLoad(saved_state)
                                self.setVar('sObjType', 'numtoken')
                                self.setVar('bFishToken', true)
                                self.setVar('iNum', ]] .. p.iNum .. [[)
                                local saved_data = JSON.decode(saved_state)
                                if saved_data ~= nil then
                                    m_sGUIDFishTile = saved_data.sGUIDFishTile
                                end
                                startLuaCoroutine(self, 'registerToken')
                            end
                            function registerToken()
                                --workaround: when a token is copied it will have the guid of the original item initially -> wait 1 frame
                                coroutine.yield(0)
                                local MapScript = getObjectFromGUID('42fd8e')
                                if MapScript ~= nil then
                                    MapScript.call('addNumberChip', { TokenObj = self, iNum = self.getVar('iNum') })
                                    return true
                                end
                                return false
                            end
                            function onPickUp(player_color)
                                m_sGUIDFishTile = nil --invalidate associated tile and find new one
                            end
                            function onCollisionEnter(collision_info)
                                if m_sGUIDFishTile == nil then
                                    m_sGUIDFishTile = getFishTile()
                                end
                            end
                            function getFishTile()
                                local AllObj = getAllObjects()
                                local vPos = self.getPosition()
                                for i, Obj in ipairs(AllObj) do
                                    if Obj.getVar('sObjType') == 'fishermen' then
                                        local fDist = math.abs(Obj.getPosition().x - vPos.x) + math.abs(Obj.getPosition().z - vPos.z)
                                        if fDist < 1.5 then
                                            return Obj.getGUID()
                                        end
                                    end
                                end
                            end]]
                        )
    Token.setLock(true)

    return Token
end
function callbackNumberTokenFish(Object, p)
    if p.FishTile ~= nil then --set GUID of associated fish tile in the callback since the fish tile object does not have a GUID earlier
        Object.call('setFishTileGUID', {sGUID = p.FishTile.getGUID()})
    end
end

--[[ spawn treasure tokens for TDD and additional scenarios
        Called from the respective control panel that defines the layout
--]]
function spawnTreasureToken(p)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = p.vPos
    params.rotation = {0.0,180.0,0.0}
    params.scale = {0.45, 1.0, 0.45}

    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379924745/1741D18558247F22A7DF9AD4317BE5701C798B69/'
    if p.sBack == '1res' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380238738/7212F420BC6BFE34D9C9E5D912644304E794868E/'
    elseif p.sBack == '2res' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380240691/C9E5CEABB085A5B87D34A6B6AEC037DA75CC88EB/'
    elseif p.sBack == '3res' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380241222/822EF373AA3E68D059F1E7FE6351125D1051690D/'
    elseif p.sBack == 'dev' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380241827/611419F9D4152FF0C394FC3D6FC60E3824C7904C/'
    elseif p.sBack == 'roads' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380242274/A3FAA5B5A4C46E2A93B5B543B4B7042706FAEBA3/'
    elseif p.sBack == 'robber' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380243237/D8065F9548E0183F0080FA7064C9379CAFA73757/'
    elseif p.sBack == 'vp' then
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/155773601380244249/9A58840F1DD7F84E20C1019FC61A509352574138/'
    end
    custom.type = 0 --Box
    custom.thickness = 0.06

    local Token = spawnObject(params)
    Token.setCustomObject(custom)

    Token.setColorTint({0.93,0.53,0.0})
    Token.setName('Treasure Chest')
    local sDesc = ''
    if sBack == '1res' then
        sDesc = 'You may take any 1 resource from the bank'
    elseif sBack == '2res' then
        sDesc = 'You may take any 2 resources from the bank'
    elseif sBack == '3res' then
        sDesc = 'You get 1 Grain, 1 Wool, 1 Bricks'
    elseif sBack == 'dev' then
        sDesc = 'You may take 1 Development card (when playing with Cities & Knights: 1 Progress card)'
    elseif sBack == 'roads' then
        sDesc = 'You may build 2 roads/ships for free'
    end
    Token.setLuaScript('m_sDesc = \\'' .. sDesc .. '\\'\\n' ..
                       'function onCollisionEnter(collision_info) ' ..
                            'local zRot = self.getRotation().z ' ..
                            'if zRot < 0.0 then zRot = 360.0 + zRot end ' ..
                            'if zRot < 230.0 and zRot > 130.0 then ' .. --it's facing down
                                'if self.getDescription() == \\'\\' then ' ..
                                    'self.setDescription(m_sDesc) ' ..
                                'end ' ..
                            'else ' ..
                                'if self.getDescription() ~= \\'\\' then ' ..
                                    'self.setDescription(\\'\\') ' ..
                                'end ' ..
                            'end ' ..
                        'end ')

    Token.setLock(true)
    Global.call('addToUnlockList', {Obj = Token})

    return Token
end

--[[    Spawn victory point card Longest Road   ]]--
function spawnLongestRoadCard(vPos, vRot)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = vPos
    params.rotation = vRot
    params.scale = {2.11755562,1.0,2.11755562}
    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379927983/C7109CE55B4403815B5515C29EC5E3B9E534FEEC/'
    custom.type = 0 --Box
    custom.thickness = 0.06

    local Tile = spawnObject(params)
    Tile.setCustomObject(custom)
    Tile.setName('Longest Road')
    Tile.setDescription('2 Victory Points!\\nThis card goes to the player with the longest unbroken road of at least 5 segments. Another player who builds a longer road takes this card.')
    Tile.setLock(true)
    addToUnlockList({Obj = Tile})
end

--[[    Spawn victory point card Largest Army   ]]--
function spawnLargestArmyCard(vPos, vRot)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = vPos
    params.rotation = vRot
    params.scale = {2.11755562,1.0,2.11755562}
    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379932520/2B23103F9A5E74B60009817693B851FDF4D980B0/'
    custom.type = 0 --Box
    custom.thickness = 0.06

    local Tile = spawnObject(params)
    Tile.setCustomObject(custom)
    Tile.setName('Largest Army')
    Tile.setDescription('2 Victory Points!\\nThe first player to play 3 Knight cards gets this card. Another player who plays more Knight cards takes this card.')
    Tile.setLock(true)
    addToUnlockList({Obj = Tile})
end

--[[    Spawn victory point card Harbormaster   ]]--
function spawnHarbormasterCard(vPos, vRot)
    local params = {}
    params.type = 'Custom_Tile'
    params.position = vPos
    params.rotation = vRot
    params.scale = {2.11755562,1.0,2.11755562}
    local custom = {}
    custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379935112/3E2BFEAEF079A9B4F94E071DE363B7BC3646D03A/'
    custom.type = 0 --Box
    custom.thickness = 0.06

    local Tile = spawnObject(params)
    Tile.setCustomObject(custom)
    Tile.setName('Harbormaster')
    Tile.setDescription('2 Victory Points!\\nThe first player to acquire 3 harbor points gets this card. Another player who acquires more harbor points takes this card.')
    Tile.setLock(true)
    addToUnlockList({Obj = Tile})
end

--[[ Randomize terrain hexes in the placement info table ]]--
function shuffleHexes( InfoTab )
    -- Create sequential table with all indexes of InfoTab that can be randomized
    local Keys = {}
    for i, Line in pairs(InfoTab) do
        if Line.bRandHex then
            table.insert(Keys, i)
        end
    end

    if #Keys <= 1 then
        return
    end

    for i = #Keys, 2, -1 do
        local iRand = nil
        local iRUpper = i
        local iCount = 0
        while true do
            iCount = iCount + 1
            iRand = math.random(iRUpper)
            if InfoTab[Keys[iRand]].iGroup == InfoTab[Keys[i]].iGroup then --allow tile groups to be shuffled only amongst each other
                local bSwitch = true
                if m_CurScenario.bUseFishermen == true then --make sure the lake tile is not put next to the ocean
                    if InfoTab[Keys[i]].sHexType == 'lake' then --check if the new position is adjacent to water
                        local OceanTiles = getOceanNeighbors(InfoTab, Keys[iRand])
                        if #OceanTiles == 1 then --check if the adjacent ocean tile is the tile we are moving right now
                            if OceanTiles[1].index == Keys[i] --it is the tile we are moving
                            and InfoTab[Keys[iRand]].sHexType ~= 'ocean' then --do not allow if we are switching with an ocean tile
                            else
                                bSwitch = false
                            end
                        elseif #OceanTiles > 0 then
                            bSwitch = false
                        end

                    elseif InfoTab[Keys[iRand]].sHexType == 'lake' then --check if the current hex is adjacent to ocean (is it a valid position for a lake)
                        local OceanTiles = getOceanNeighbors(InfoTab, Keys[i])
                        if #OceanTiles == 1 then
                            if OceanTiles[1].index == Keys[iRand] and InfoTab[Keys[i]].sHexType ~= 'ocean' then
                            else
                                bSwitch = false
                            end
                        elseif #OceanTiles > 0 then
                            bSwitch = false
                        end
                    end
                end
                if bSwitch then
                    break
                end
            end
            --when looking for a spot for lake tiles it might happen that the last two positions are lakes
            --> just switch it with any hex
            if iCount >= #Keys then
                iRUpper = #Keys
            end
        end

        if (InfoTab[Keys[i]].bRandNum ~= false and InfoTab[Keys[iRand]].bRandNum ~= false)
        or (InfoTab[Keys[i]].iNumToken ~= nil and InfoTab[Keys[iRand]].iNumToken ~= nil) then --do not switch a hex with a fixed number token with one that does not have a token (e.g. desert)
            InfoTab[Keys[i]].sHexType, InfoTab[Keys[iRand]].sHexType = InfoTab[Keys[iRand]].sHexType, InfoTab[Keys[i]].sHexType
        end
        if InfoTab[Keys[i]].bRandNum ~= false and InfoTab[Keys[iRand]].bRandNum ~= false then --do not switch the number tokens, they are supposed to be fixed
            InfoTab[Keys[i]].iNumToken, InfoTab[Keys[iRand]].iNumToken = InfoTab[Keys[iRand]].iNumToken, InfoTab[Keys[i]].iNumToken
            InfoTab[Keys[i]].iNumTokenSec, InfoTab[Keys[iRand]].iNumTokenSec = InfoTab[Keys[iRand]].iNumTokenSec, InfoTab[Keys[i]].iNumTokenSec
        end
        InfoTab[Keys[i]].bRobberPos, InfoTab[Keys[iRand]].bRobberPos = InfoTab[Keys[iRand]].bRobberPos, InfoTab[Keys[i]].bRobberPos
        InfoTab[Keys[i]].bSecLake, InfoTab[Keys[iRand]].bSecLake = InfoTab[Keys[iRand]].bSecLake, InfoTab[Keys[i]].bSecLake
        InfoTab[Keys[i]].sOilSource, InfoTab[Keys[iRand]].sOilSource = InfoTab[Keys[iRand]].sOilSource, InfoTab[Keys[i]].sOilSource
    end
end

--check the tiles adjacent to a given position index and return a table with all tiles that are ocean
function getOceanNeighbors(PlacemTable, idx)
    local OceanList = {}
    for sDir, iTile in pairs(NBRS[idx]) do
        if PlacemTable[iTile] ~= nil then
            local sType = PlacemTable[iTile].sHexType
            if sType == 'ocean' or sType == 'border' or sType == 'corner' or sType == 'side' or sType == 'lake' then
                table.insert(OceanList,{index = iTile, sDir = sDir})
            end
        end
    end
    return OceanList
end

--[[ Randomize number chips assigned to terrain hexes
     This function will also make sure there are no two red numbers (6, 8) next to each other
 ]]--
function shuffleChips( InfoTab )
    -- Create sequential table with all indexes of InfoTab that can be randomized
    local Keys = {}
    for iIdx, Line in pairs(InfoTab) do
        if Line.iNumToken ~= nil and ((Line.bRandHex and Line.bRandNum ~= false) or Line.bRandNum == true) then
            table.insert(Keys, iIdx)
        end
    end

    if #Keys <= 1 then
        return
    end

    -- Randomize the numbers
    for i = #Keys, 2, -1 do
        while true do
            local iRand = math.random(i)
            if InfoTab[Keys[iRand]].iGroup == InfoTab[Keys[i]].iGroup then --allow tile groups to be shuffled only amongst each other
                InfoTab[Keys[i]].iNumToken, InfoTab[Keys[iRand]].iNumToken = InfoTab[Keys[iRand]].iNumToken, InfoTab[Keys[i]].iNumToken
                InfoTab[Keys[i]].iNumTokenSec, InfoTab[Keys[iRand]].iNumTokenSec = InfoTab[Keys[iRand]].iNumTokenSec, InfoTab[Keys[i]].iNumTokenSec
                break
            end
        end
    end

    -- Check for neighboring red numbers and replace one of them with a black token
    for i=1, #Keys do
        if isChipRed( InfoTab[Keys[i]].iNumToken ) and InfoTab[Keys[i]].bRandNum ~= false then
            --check if the chip has any red neighbor chips
            local bSwitch = false
            for sDir, iNbIdx in pairs(NBRS[Keys[i]]) do
                if InfoTab[iNbIdx] ~= nil  then
                    if isChipRed( InfoTab[iNbIdx].iNumToken ) then
                        bSwitch = true
                        break
                    end
                end
            end

            if bSwitch then
                replaceRedChip( InfoTab, Keys, Keys[i] )
            end
        end
    end
end

--[[ Randomize harbors defined in the map tile placement info table ]]--
function shuffleHarbors( InfoTab )
    -- Create sequential table with all indexes of InfoTab that can be randomized
    local Keys = {}
    for i, Line in pairs(InfoTab) do
        if Line.sHarborType ~= nil and Line.bRandHarbor then
            table.insert(Keys, i)
        end
    end

    if #Keys <= 1 then
        return
    end

    for i = #Keys, 2, -1 do
        local iRand = nil
        while true do
            iRand = math.random(i)
            if InfoTab[Keys[iRand]].iGroup == InfoTab[Keys[i]].iGroup then --allow tile groups to be shuffled only amongst each other
                break
            end
        end

        InfoTab[Keys[i]].sHarborType, InfoTab[Keys[iRand]].sHarborType = InfoTab[Keys[iRand]].sHarborType, InfoTab[Keys[i]].sHarborType
    end
end

--[[ Define in which positions to spawn fish tiles depending on the position of the land tiles & assign token numbers ]]--
function setFishTiles( InfoTab )
    local FishTiles = {}
    -- Create sequential table with all indexes of InfoTab that can be randomized
    local Keys = {}
    for i, Line in pairs(InfoTab) do
        if Line.vFishRot ~= nil then
            if Line.bVarFish == true then
                table.insert(Keys, i)
            else
                table.insert(FishTiles, i)
            end
        end
    end

    --randomize the order of variable fish tiles
    if #Keys > 0 then
        for i = #Keys, 2, -1 do
            local iRand = math.random(i)
            Keys[i], Keys[iRand] = Keys[iRand], Keys[i]
        end
    end

    local iTodo = 6
    local Numbers = {4,5,6,8,9,10}
    if m_CurScenario.bExtension == true then
        iTodo = 8
        Numbers = {4,5,6,8,9,10,5,9}
    end
    iTodo = iTodo - #FishTiles

    --randomize the order of numbers
    for i = #Numbers, 2, -1 do
        local iRand = math.random(i)
        Numbers[i], Numbers[iRand] = Numbers[iRand], Numbers[i]
    end

    --check which of the possible fish tile locations are valid
    for iRun = 1, 2 do
        local bOptimize = true
        if iRun == 2 then
            bOptimize = false --we tried positioning all fish tiles but did not find a valid spot for all -> check again without min spacing
        end
        for i, iKey in pairs(Keys) do
            if iTodo == 0 then break end

            local sType = InfoTab[iKey].sHexType
            if sType == 'ocean' or sType == 'border' or sType == 'corner' then --tile itself must be an ocean tile
                local OceanTiles = getOceanNeighbors(InfoTab, iKey)
                local TestDir = {}
                local fOrient = InfoTab[iKey].vFishRot[2]
                if fOrient == 180.0 then --N
                    TestDir = {'NW','NE'}
                elseif fOrient == -120.0 then --NE
                    TestDir = {'NE', 'E'}
                elseif fOrient == -60.0 then --SE
                    TestDir = {'E', 'SE'}
                elseif fOrient == 0.0 then --S
                    TestDir = {'SE', 'SW'}
                elseif fOrient == 60.0 then --SW
                    TestDir = {'SW', 'W'}
                elseif fOrient == 120.0 then --NW
                    TestDir = {'W', 'NW'}
                end
                local bSpawn = true
                for j = 1, #TestDir do
                    for k = 1, #OceanTiles do
                        if OceanTiles[k].sDir == TestDir[j] then --ocean tile in relevant direction -> invalid position for a fish tile
                            bSpawn = false
                            break
                        end
                    end
                end

                if bSpawn == true and bOptimize == true then --do not spawn a fish tile when one is already next to it (distribute them more evenly)
                    local CheckNBRS = NBRS[iKey]
                    for sDir, idx in pairs(CheckNBRS) do
                        for idxFish = 1, #FishTiles do
                            if FishTiles[idxFish] == idx then
                                bSpawn = false
                                break
                            end
                        end
                    end
                end

                if bSpawn then
                    table.insert(FishTiles, iKey)
                    Keys[i] = nil
                    iTodo = iTodo - 1
                end
            end
        end
        if iTodo == 0 then break end
    end

    --assign a number token to each tile
    for i = 1, #FishTiles do
        if InfoTab[FishTiles[i]].iNumTokenFish == nil then
            InfoTab[FishTiles[i]].iNumTokenFish = Numbers[i]
        end
    end

    --remove fish tile info for tiles that should not receive a fish tile
    for i, iLine in pairs(Keys) do
        InfoTab[iLine].vFishRot = nil
    end
end

--[[ Checks if a number chip GUID is a red number (6, 8)
     Returns true when it is either a 6 or an 8]]--
function isChipRed( iNumToken )
    if iNumToken == 6 or iNumToken == 8 then
        return true
    end
    return false
end

--[[ Find a black number chip that has no red neighboring chips and switch it with the passed chip ]]--
function replaceRedChip( InfoTab, Keys, iHexIdx )
    local iRand = nil
    local bFound = true
    local iCounter = 1
    local HexInfo = InfoTab[iHexIdx]
    --search for a random black chip that doesn't have any red neighbors
    while iCounter < 30 do
        iRand = math.random(1, #Keys)
        if InfoTab[Keys[iRand]].iGroup == HexInfo.iGroup then
            iCounter = iCounter + 1
            bFound = true
            if InfoTab[Keys[iRand]].bRandNum == false then
                bFound = false
            elseif isChipRed( InfoTab[Keys[iRand]].iNumToken ) then
                bFound = false
            else
                --target chip is black -> check if there are any red neighbors
                for sDir, iNbIdx in pairs(NBRS[Keys[iRand]]) do
                    if InfoTab[iNbIdx] ~= nil and InfoTab[iNbIdx].iNumToken ~= nil then
                        if iNbIdx ~= iHexIdx then --ignore the token to be switched when checking for red neighbors
                            if isChipRed( InfoTab[iNbIdx].iNumToken ) then
                                bFound = false
                                break
                            end
                        end
                    end
                end
            end
            if bFound then
                HexInfo.iNumToken, InfoTab[Keys[iRand]].iNumToken = InfoTab[Keys[iRand]].iNumToken, HexInfo.iNumToken
                HexInfo.iNumTokenSec, InfoTab[Keys[iRand]].iNumTokenSec = InfoTab[Keys[iRand]].iNumTokenSec, HexInfo.iNumTokenSec
                break
            end
        end
    end
end

--[[    spawnIndicatorArrow
    spawn a little twirling/dancing arrow
    - called from MapScript to indicate settlements / cities that receive resources from gold fields
    - called from the special build phase indicator pawns when a turn ends and they are in front of the player area
]]
function spawnIndicatorArrow(p)
    p.fHeight = p.fHeight or 0.25   --default height (up and down movement distance)

    local params = {}
    params.type = 'Custom_Model'
    params.position = p.vPos
    params.scale = p.vScale

    local custom = {}
    custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379937202/9CB668278FFE49D61A4917473D98D59CD54BB369/'
    custom.collider = 'http://cloud-3.steamusercontent.com/ugc/155773601379939502/63697125130DFF7A7B53ADDA8798B847C80FC799/'
    custom.diffuse = ''
    custom.type = 0 --generic

    local Arrow = spawnObject(params)
    Arrow.setCustomObject(custom)
    Arrow.interactable = false
    Arrow.use_gravity = false
    Arrow.setColorTint(p.vColor)
    Arrow.setLuaScript([[   m_fCreated = 0.0
                            function onLoad(save_state)
                                Timer.create({
                                    identifier = self.guid .. '_Timer',
                                    function_name = 'destroyArrow',
                                    function_owner = self,
                                    delay = ]] .. p.fTTL .. [[
                                })
                                self.setVar('sObjType', 'arrow')
                                m_fCreated = os.time()
                            end
                            function destroyArrow()
                                self.destruct()
                            end
                            function onDestroy()
                                Timer.destroy(self.guid .. '_Timer')
                            end
                            function onUpdate()
                                self.rotate({0.0,20.0,0.0})
                                local fYtrans = math.sin((os.time()-m_fCreated)*3.0) * ]] .. p.fHeight .. [[
                                self.translate({0.0,fYtrans,0.0})
                            end
                        ]])
    return Arrow
end

--[[ checkCardLimits
    Called from update function when a 7 is rolled. This will count the resource cards for all players to check if they
    are exceeding the limit for the robber. If so, the number of cards is displayed by the relevant scripting zone.
--]]
function checkCardLimits()
    coroutine.yield(0)
    coroutine.yield(0)

    local PlayerData = {
        ['Orange'] = {iLimit = 7, iCards = 0, sGUIDzone = '15c3aa' },
        ['Red'] = {iLimit = 7, iCards = 0, sGUIDzone = '24632e' },
        ['White'] = {iLimit = 7, iCards = 0, sGUIDzone = 'cdde1f' },
        ['Purple'] = {iLimit = 7, iCards = 0, sGUIDzone = 'a60284' },
        ['Blue'] = {iLimit = 7, iCards = 0, sGUIDzone = 'f37d36' },
        ['Green'] = {iLimit = 7, iCards = 0, sGUIDzone = 'd866a9' },
    }

-- Determine the card limit for each player
    --Find out the current card limit for each player when playing with C&K
    if isCKenabled() then
        if m_MapScript == nil then
            return false
        else
            local MapObj = m_MapScript.getObjects()
            for i = 1, #MapObj do
                if MapObj[i].getName() == 'Wall' then
                    local sColor = MapObj[i].getDescription()
                    if PlayerData[sColor] ~= nil then
                        PlayerData[sColor].iLimit = PlayerData[sColor].iLimit + 2
                    end
                end
            end
        end
    end
    --In Treasures scenario T2 players can increase their card limit by holding 1 treasure
    if getScenarioID() == 'T2' then
        for sColor, Info in pairs(PlayerData) do
            local Zone = getObjectFromGUID(Info.sGUIDzone)
            if Zone ~= nil then
                local ZoneObj = Zone.getObjects()
                for i = 1, #ZoneObj do
                    if ZoneObj[i].getName() == 'Treasure Chest' then
                        --PlayerData[sColor].iLimit = PlayerData[sColor].iLimit + 2
                        Info.iLimit = Info.iLimit + 2
                        break --only the first treasure increases the limit
                    end
                end
            end
        end
    end

-- Count the cards held by each player
    for sColor, Info in pairs(PlayerData) do
        local HandObj = Player[sColor].getHandObjects()
        for i = 1, #HandObj do
            local sName = HandObj[i].getName()
            if sName == 'Lumber' or sName == 'Bricks' or sName == 'Wool' or sName == 'Grain' or sName == 'Ore' or
               sName == 'Coins' or sName == 'Cloth' or sName == 'Paper' then
                Info.iCards = Info.iCards + 1
            end
        end
    end

-- Check which players exceed their limit
  for sColor, Info in pairs(PlayerData) do
      if Info.iCards > Info.iLimit then
          local Zone = getObjectFromGUID(Info.sGUIDzone)
          local discCards = tonumber(Info.iCards)
          local discCardsTwo = math.floor(discCards/2)
          Zone.call('displayCardCount', {iCards = Info.iCards})
          if m_bEnableWelfare then
            printToAll(\"[b][LoC-CM][/b] \" .. Player[sColor].steam_name .. \" must discard \" .. discCardsTwo .. \" cards and all of their welfare coins.\", {1.0, 0.4, 0})
          else
            printToAll(\"[b][LoC-CM][/b] \" .. Player[sColor].steam_name .. \" must discard \" .. discCardsTwo .. \" cards.\", {1.0, 0.4, 0})
            end
      end
  end

    return true
end
--clears the 3D text showing the card counts when a player exceeded the limit on a 7
--run as a coroutine to make sure not to block anything important by this little gimmick (it gets called from update on a roll that is not 7)
function clearCardCounts()
    coroutine.yield(0)
    coroutine.yield(0)

    local Zones = {
        '15c3aa', --Orange
        '24632e', --Red
        'cdde1f', --White
        'a60284', --Purple
        'f37d36', --Blue
        'd866a9', --Green
    }
    for i = 1, #Zones do
        local PlZone = getObjectFromGUID(Zones[i])
        if PlZone ~= nil then
            PlZone.call('clearCardCount')
        end
    end
    return true
end

function callback_HexLoaded()
    m_iLoadingHexes = m_iLoadingHexes - 1

    if m_iLoadingHexes == 0 then --all hex tiles have finished loading -> unlock all number tokens so they drop on the map
        for i, Obj in ipairs(m_UnlockOnLoad) do
            if Obj ~= nil then
                Obj.setLock(false)
            end
        end
        m_UnlockOnLoad = {}

        --reset the counters -> cannot be done right after setting up the player items because the set position seems to trigger the onLeave event 1 frame later...
        if m_MapScript ~= nil then
            m_MapScript.call('setCountersEnabled', {bEnable = true})
        end

        --consider the game loaded (enable dice highlighting etc.)
        m_bMapLoaded = true
    end
end

--[[ workaround infinite bag preview
    This will clone a spawn bag, draw the first object from it and then delete the bag again
    made necessary because the object preview of inifinite bags will load the object even if
    it is still in the bag
]]--
function takeObjectWorkaround(Bag, params)
    local vPos = Bag.getPosition()
    local CloneBag = Bag.clone({position = vPos})
    CloneBag.setPosition(vPos)  --otherwise the bag will be spawned very high above the original bag...
    local Obj = CloneBag.takeObject(params)
    CloneBag.destruct()
    return Obj
end

--[[
    Spawn items for Cities & Knights (most work is done in setupPlayerItems and setupDecks however...)
--]]
function spawnCKExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        --event die
        if m_EventDie ~= nil then
            m_EventDie.setRotation({0.0,0.0,0.0})
            m_EventDie.setPosition({x=-31.0,y=1.373,z=-1.5})
        else
            m_EventDie = spawnEventDie({-31.0,1.373,-1.5})
        end

        --Spawn Metropolis gates
        local vPosMetrP = {x=-23.0,y=1.3,z=-11.4}
        local vPosMetrS = {x=-23.0,y=1.3,z=-12.4}
        local vPosMetrT = {x=-23.0,y=1.3,z=-13.4}
        if m_CurScenario.bUseFishermen then --move metropolises out of the way of the fishermen board
            vPosMetrP.x = -18.0
            vPosMetrS.x = -18.0
            vPosMetrT.x = -18.0
        end
        spawnMetropolisGate({vPosition=vPosMetrP, vRotation={0.0,90.0,0.0}, sType='Politics'})
        spawnMetropolisGate({vPosition=vPosMetrS, vRotation={0.0,90.0,0.0}, sType='Science'})
        spawnMetropolisGate({vPosition=vPosMetrT, vRotation={0.0,90.0,0.0}, sType='Trade'})\n\n        --SpawnC&K Counters
        spawnCKCounter({x=30.6,y=1.5,z=-8.3})
        spawnCKCounter({x=30.6,y=2.5,z=-8.3})\n
        --color the second die red
        if m_Die2 ~= nil then
            m_Die2.setColorTint({0.9,0.0,0.0})
        end

        --spawn the city upgrade charts in all player areas
        local ChartPos = {  ['Orange'] = { x=-41.1385, y=0.9852, z=-19.29 },
                            ['Red'] =    { x=-11.52, y=0.9852, z=-19.29 },
                            ['White'] =  { x=17.7826, y=0.9852, z=-19.29 },
                            ['Purple'] = { x=41.1845, y=0.9852, z=19.29 },
                            ['Blue'] =   { x=11.156, y=0.9852, z=19.29 },
                            ['Green'] =  { x=-18.0121, y=0.9852, z=19.29 }
                         }
        local CKitemsBag = getObjectFromGUID(m_CKitems.Bag)
        if CKitemsBag ~= nil then
            local vInitPos = CKitemsBag.getPosition()
            vInitPos.x = vInitPos.x + 4.0

            local params = { callback = 'callbackGeneral', callback_owner = Global }
            local iNum = 0
            for sCol, vPos in pairs(ChartPos) do
                local vRot = {0.0,0.0,0.0}
                local fModX = -1.0
                if vPos.z < 0.0 then
                    vRot[2] = 180.0
                    fModX = 1.0
                end
                params.guid = m_CKitems.Item['ChartPolitics']
                params.params = {vPos = vPos, vRot = vRot, bLock = true}
                params.position = {vInitPos.x, vInitPos.y - iNum * 0.3, vInitPos.z} --vary the heigt of the initial position to avoid them colliding and being placed at an angle
                takeObjectWorkaround(CKitemsBag, params)
                iNum = iNum + 1
                params.guid = m_CKitems.Item['ChartScience']
                params.params = {vPos = {x=vPos.x+(3.255*fModX),y=vPos.y,z=vPos.z}, vRot = vRot, bLock = true}
                params.position = {vInitPos.x, vInitPos.y - iNum * 0.3, vInitPos.z} --vary the heigt of the initial position to avoid them colliding and being placed at an angle
                takeObjectWorkaround(CKitemsBag, params)
                iNum = iNum + 1
                params.guid = m_CKitems.Item['ChartTrade']
                params.params = {vPos = {x=vPos.x+(3.255*2*fModX),y=vPos.y,z=vPos.z}, vRot = vRot, bLock = true}
                params.position = {vInitPos.x, vInitPos.y - iNum * 0.3, vInitPos.z} --vary the heigt of the initial position to avoid them colliding and being placed at an angle
                takeObjectWorkaround(CKitemsBag, params)
                iNum = iNum + 1
            end
        end


        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[ spawn objects for the Frenemies mini-expansion
        Called from onMapLoad when a map is loaded and the mini expansion enabled
]]--
function spawnFrenemiesExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        local iPlayers = m_iFrenemiesPlayers
        --board:
        local params = {}
        params.type = 'Custom_Tile'
        params.position = {-23.032, 0.96, 12.938}
        params.rotation = {0.0,180.0,0.0}
        params.scale = {1.1,1.0,1.1}
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379941451/382D6A4EAD28F35910F6FC56A9DF65FAF7CFD1AD/'
        custom.type = 0 --Box
        custom.thickness = 0.06

        local Board = spawnObject(params)
        Board.setCustomObject(custom)
        Board.setDescription('Frenemies Mini-Expansion\\nPut spent favor tokens into the bags.')
        Board.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        Board.setColorTint({0.902,0.892,0.8314})
        Board.setLock(true)

        --spawn discard bags:
        params = {}
        params.type = 'Bag'
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.475,0.475,0.475}
        --Trader
        params.position = {-27.0, 0.872, 14.64}
        local TokenBag = spawnObject(params)
        TokenBag.setName('Trader Tokens')
        TokenBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        TokenBag.setColorTint({0.9255,0.91,0.796})
        TokenBag.setLock(true)
        --Merchant
        params.position = {-25.0, 0.872, 14.64}
        local TokenBag = spawnObject(params)
        TokenBag.setName('Merchant Tokens')
        TokenBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        TokenBag.setColorTint({0.78,0.851,0.992})
        TokenBag.setLock(true)
        --Road Builder
        params.position = {-23.0, 0.872, 14.64}
        local TokenBag = spawnObject(params)
        TokenBag.setName('Road Builder Tokens')
        TokenBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        TokenBag.setColorTint({0.824,0.616,0.412})
        TokenBag.setLock(true)
        --Scholar
        params.position = {-21.0, 0.872, 14.64}
        local TokenBag = spawnObject(params)
        TokenBag.setName('Scholar Tokens')
        TokenBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        TokenBag.setColorTint({0.949,0.843,0.337})
        TokenBag.setLock(true)
        --Master Builder
        params.position = {-19.0, 0.872, 14.64}
        local TokenBag = spawnObject(params)
        TokenBag.setName('Master Builder Tokens')
        TokenBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        TokenBag.setColorTint({0.737,0.89,0.533})
        TokenBag.setLock(true)

        -- Bag to place tokens in
        params = {}
        params.type = 'Bag'
        params.position = {-19.0, 0.849, 8.77}
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.8,0.6,0.8}
        local TokenBag = spawnObject(params)
        TokenBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
        TokenBag.setName('Frenemies Favor Tokens')
        TokenBag.setColorTint({0.902,0.892,0.8314})

        --generate list with required amount of tokens
        local Tokens = {}
        local iNum = math.ceil(4.2 * iPlayers)
        for i = 1, iNum do
            table.insert(Tokens, 'book')
            table.insert(Tokens, 'compass')
        end
        iNum = iPlayers * 2
        for i = 1, iNum do
            table.insert(Tokens, 'ship')
            table.insert(Tokens, 'shovel')
            table.insert(Tokens, 'wagon')
        end
        for i = #Tokens, 2, -1 do --make the order random
            local iRand = math.random(i)
            Tokens[i],Tokens[iRand] = Tokens[iRand],Tokens[i]
        end

        --spawn the tokens to be put into the bag
        for i, sType in pairs(Tokens) do
            local params = {}
            params.type = 'Custom_Model'
            params.position = {-70.0, 200.0, -40.0}
            params.rotation = {0.0,180.0,180.0}
            local custom = {}
            custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379943471/32300EFCC842A3D85EFCEDE3E61E9639BC1F683D/'
            if sType == 'book' then
                custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380251523/05B4E90B3B3000828AED2A94974B3FE5C0EC92D1/'
            elseif sType == 'compass' then
                custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380252189/5843A89BB35F414B15BCEC579D0434DF801DFA77/'
            elseif sType == 'ship' then
                custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380252779/30C6B37EB353430B9D906A81E37B9F2CB2F684DE/'
            elseif sType == 'shovel' then
                custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380253308/297E093104E94D8DC7DFFF244D2BABBE59CBD58F/'
            elseif sType == 'wagon' then
                custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601380253938/17064D72B64B52A816CD26497542A8AFADF31242/'
            end
            custom.type = 0 --generic
            custom.material = 3 --cardboard
            local Token = spawnObject(params)
            Token.setCustomObject(custom)
            Token.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
            Token.setColorTint({0.902,0.892,0.8314})
            TokenBag.putObject(Token)
        end

        --Spawn victory point tokens
        iNum = iPlayers * 2
        if iPlayers == 6 then iNum = 13 end
        local params = {}
        params.type = 'Custom_Model'
        params.rotation = {0.0,180.0,0.0}
        local custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379943471/32300EFCC842A3D85EFCEDE3E61E9639BC1F683D/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379946921/965DEA504C0F686ECA7C1BE850FE8CE9DA03BD5E/'
        custom.type = 0 --generic
        custom.material = 3 --cardboard
        local vPos = {-19.505, 1.0, 11.0}
        for i = 1, iNum do
            vPos[2] = vPos[2] + 0.1
            params.position = vPos
            local Token = spawnObject(params)
            Token.setCustomObject(custom)
            Token.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'frenemies\\') end') --keep the variable on rewind
            Token.setColorTint({0.733,0.259,0.184})
            Token.setName('1 Victory Point')

            if i == math.ceil(iNum / 2) then
                vPos[1] = vPos[1] + 1.1
                vPos[2] = 1.0
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[ spawn objects for the Helpers of Catan mini-expansion
        Called from onMapLoad when a map is loaded and mini expansion enabled
]]--
function spawnHelpersExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield()

        local ThCurrent = coroutine.running()

        local SpawnBag = getObjectFromGUID(m_HelpersItems.Bag)
        if SpawnBag ~= nil then
            local params = {}
            params.guid = m_HelpersItems.Item['Deck']
            params.callback_owner = Global
            params.callback = 'callbackGeneral'
            params.params = {vPos = {-21.2,1.1,-7.71}, vRot = {0.0,180.0,0.0}, bLock = false, ThResume = ThCurrent}
            local Deck = takeObjectWorkaround(SpawnBag, params)

            coroutine.yield()

            local spawnParams = {
              json = '',
              position = {-50.0,4.0,0.0},
              rotation = {10.0,90.0,0.0},
              scale = {0.45,0.45,0.43},
              sound = false,
              snap_to_grid = false,
              callback = \"callbackGeneral\",
              callback_owner = Global,
              params = {vPos = {-50.0,4.0,0.0}, vRot = {10.0,90.0,0.0}, bLock = true, ThResume = ThCurrent}
            }
            spawnParams.json = [[{ \"Name\": \"Custom_Board\",\"Transform\":{\"posX\":-100,\"posY\":0,\"posZ\":0,\"rotX\":0,\"rotY\":180,\"rotZ\":0,\"scaleX\": 0.45,\"scaleY\": 0.45,\"scaleZ\": 0.43},
              \"Nickname\": \"\",\"Description\": \"The Helpers of Catan\",\"ColorDiffuse\": {\"r\": 0.7867647,\"g\": 0.7867647,\"b\": 0.7867647},
              \"Locked\": false,\"Grid\": true,\"Snap\": true,\"Autoraise\": true,\"Sticky\": true,\"Tooltip\": true,\"GridProjection\": false,
              \"CustomImage\": {\"ImageURL\": \"http://cloud-3.steamusercontent.com/ugc/155773601379992011/60105B904B53B63FD52A2B1DE8497C5DAD2E3930/\",\"ImageSecondaryURL\": \"\",\"WidthScale\": 1.59792483},
              \"AttachedSnapPoints\": [{\"Position\": {\"x\": -6.42,\"y\": 0.6,\"z\": 4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},{\"Position\": {\"x\": -6.42,\"y\": 0.6,\"z\": -4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},
            \t\t\t\t\t\t {\"Position\": {\"x\": -3.19,\"y\": 0.6,\"z\": -4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},{\"Position\": {\"x\": -3.19,\"y\": 0.6,\"z\": 4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},
            \t\t\t\t\t\t {\"Position\": {\"x\": 0.04,\"y\": 0.6,\"z\": -4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},{\"Position\": {\"x\": 0.04,\"y\": 0.6,\"z\": 4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},
            \t\t\t\t\t\t {\"Position\": {\"x\": 3.27,\"y\": 0.6,\"z\": -4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},{\"Position\": {\"x\": 3.27,\"y\": 0.6,\"z\": 4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},
            \t\t\t\t\t\t {\"Position\": {\"x\": 6.5,\"y\": 0.6,\"z\": -4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},{\"Position\": {\"x\": 6.5,\"y\": 0.6,\"z\": 4.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}}]
            }]]
            local Board = spawnObjectJSON(spawnParams)
            Board.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'helpers\\') end')

            coroutine.yield()

            --take individual cards from the deck and place them on display
            local vBasePos = {-52.64,6.0,0.0}
            local params = {}
            params.callback_owner = Global
            params.callback = 'callbackGeneral'

            --Jean
            local Cards = Deck.getObjects()
            for i = 1, #Cards do
                if Cards[i].nickname == 'Jean' then
                    local vCardPos = {vBasePos[1], vBasePos[2], vBasePos[3] - 7.5}
                    params.index = Cards[i].index
                    params.position = vCardPos
                    params.params = {vPos = vCardPos, vRot = {10.0,90.0,0.0}, bLock = false, ThResume = ThCurrent}
                    Deck.takeObject(params)
                    coroutine.yield()
                    break
                end
            end
            --Vincent
            Cards = Deck.getObjects()
            for i = 1, #Cards do
                if Cards[i].nickname == 'Vincent' then
                    local vCardPos = {vBasePos[1], vBasePos[2], vBasePos[3] - 3.77}
                    params.index = Cards[i].index
                    params.position = vCardPos
                    params.params = {vPos = vCardPos, vRot = {10.0,90.0,0.0}, bLock = false, ThResume = ThCurrent}
                    Deck.takeObject(params)
                    coroutine.yield()
                    break
                end
            end

            --Lin
            Cards = Deck.getObjects()
            for i = 1, #Cards do
                if Cards[i].nickname == 'Lin' then
                    local vCardPos = {vBasePos[1], vBasePos[2], vBasePos[3] - 0.04}
                    params.index = Cards[i].index
                    params.position = vCardPos
                    params.params = {vPos = vCardPos, vRot = {10.0,90.0,0.0}, bLock = false, ThResume = ThCurrent}
                    Deck.takeObject(params)
                    coroutine.yield()
                    break
                end
            end

            --Hilde
            Cards = Deck.getObjects()
            for i = 1, #Cards do
                if Cards[i].nickname == 'Hilde' then
                    local vCardPos = {vBasePos[1], vBasePos[2], vBasePos[3] + 3.69}
                    params.index = Cards[i].index
                    params.position = vCardPos
                    params.params = {vPos = vCardPos, vRot = {10.0,90.0,0.0}, bLock = false, ThResume = ThCurrent}
                    Deck.takeObject(params)
                    coroutine.yield()
                    break
                end
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[ spawn objects for the Fishermen of Catan mini-expansion
        Called from onMapLoad when a map is loaded and mini expansion enabled
]]--
function spawnFishermenExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        local fZOffset = 0.0
        if m_CurScenario.bUseCK == true then
            fZOffset = -3.65
        end

        local FishermenBag = getObjectFromGUID(m_FishermenItems.Bag)
        if FishermenBag ~= nil then
            local spawnParams = {
              json = '',
              position = {-25.75,0.97,-8.75 + fZOffset},
              rotation = {0.0,180.0,0.0},
              scale = {0.13,0.13,0.13},
              sound = false,
            }
            spawnParams.json = [[{ \"Name\": \"Custom_Board\",\"Transform\": {\"posX\":0,\"posY\":0,\"posZ\":0,\"rotX\":0,\"rotY\":0,\"rotZ\":0,\"scaleX\": 0.08,\"scaleY\": 0.08,\"scaleZ\": 0.08},
            \"Nickname\": \"\",\"Description\": \"The Fishermen of Catan - Fish Cards\",\"ColorDiffuse\": {\"r\": 0.7867647,\"g\": 0.7867647,\"b\": 0.7867647},
            \"Locked\": true,\"Grid\": false,\"Snap\": false,\"Autoraise\": true,\"Sticky\": true,\"Tooltip\": true,\"GridProjection\": false,
            \"CustomImage\": {\"ImageURL\": \"http://cloud-3.steamusercontent.com/ugc/155773601379993896/FCB2EF79B225EB0234B9FB32162BEDC1CC5B00AA/\",\"ImageSecondaryURL\": \"\",\"WidthScale\": 1.43},
            \"AttachedSnapPoints\": [{\"Position\": {\"x\": 4.2,\"y\": 0.6,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}},{\"Position\": {\"x\": -4.2,\"y\": 0.6,\"z\": 0.0},\"Rotation\": {\"x\": 0.0,\"y\": 0.0,\"z\": 0.0}} ]}]]
            m_FishermenCardBoard = spawnObjectJSON(spawnParams)
            m_FishermenCardBoard.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'fishermen\\') end')

            local sDeckGUID = nil
            if m_CurScenario.bExtension == true then
                sDeckGUID = m_FishermenItems.Item['Deck_ext']
            else
                sDeckGUID = m_FishermenItems.Item['Deck']
            end
            local params = {}
            params.guid = sDeckGUID
            params.callback_owner = Global
            params.callback = 'callbackDeck'
            params.params = {vPos = {-27.0,2.0,-8.75 + fZOffset}, vRot = {0.0,180.0,180.0}, bShuffle = true}
            takeObjectWorkaround(FishermenBag, params)
        end

        --spawn fishmarket tiles for each player
        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {2.92764568,1.0,2.92764568}

        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379949257/D7E42C4DFAD38761601AB6B1B4313BF51A3ECE14/'
        custom.type = 0 --Box
        custom.thickness = 0.03

        local MarketPos = {
            ['Orange'] = {vPos = {-23.186,0.96,-21.727}, vRot = {0.0,180.0,0.0}},
            ['Red'] = {vPos = {5.960,0.96,-21.727}, vRot = {0.0,180.0,0.0}},
            ['White'] = {vPos = {36.061,0.96,-21.727}, vRot = {0.0,180.0,0.0}},
            ['Purple'] = {vPos = {22.763,0.96,21.727}, vRot = {0.0,0.0,0.0}},
            ['Blue'] = {vPos = {-6.457,0.96,21.727}, vRot = {0.0,0.0,0.0}},
            ['Green'] = {vPos = {-36.047,0.96,21.727}, vRot = {0.0,0.0,0.0}},
        }
        for sCol, Info in pairs(MarketPos) do
            params.position = Info.vPos
            params.rotation = Info.vRot

            local Tile = spawnObject(params)
            Tile.setCustomObject(custom)
            Tile.setName('The Fish Market')
            Tile.setColorTint({0.643,0.784,0.839})
            Tile.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'fishermen\\') end')
            Tile.setLock(true)
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[ spawn objects for the unoffical Welfare Variant mini-expansion
        Called from onMapLoad when a map is loaded and mini expansion enabled
]]--
function spawnWelfareExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        --spawn infinite bag to take coins from
        local params = {}
        params.type = 'Infinite_Bag'
        params.position = {-22.02,0.95,2.96}
        params.rotation = {0.0,330.0,0.0}
        params.scale = {0.8,0.6,0.8}
        local SupplyBag = spawnObject(params)
        SupplyBag.setName('Welfare Coins Supply')
        SupplyBag.setDescription('Each time a player does not receive any resource or fish cards during a turn, they receive a welfare coin instead.')
        SupplyBag.setColorTint({190/255,157/255,132/255})
        SupplyBag.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'welfare\\') end')
        SupplyBag.setLock(true)

        --put the welfare coin into the infinite bag
        local params = {}
        params.type = 'Custom_Model'
        params.position = {-22.02,2.95,2.96}
        params.scale = {0.5,1.0,0.5}
        custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379951416/DF35BA080143304EC36CC9A25CF45E333A19724E/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/177162202731459822/F6E9126E4AFDC0AEED84E746E5107FC3C7B0B399/'
        custom.type = 5 --Chip
        custom.material = 2 --metal
        custom.specular_sharpness = 0.0
        custom.specular_intensity = 0.0
        local Coin = spawnObject(params)
        Coin.setCustomObject(custom)
        Coin.setName('Welfare Coin')
        Coin.setDescription('You can exchange welfare coins for resource or commodity cards. The exchange rate depends on your current victory points.')
        Coin.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'welfare\\') end')
        SupplyBag.putObject(Coin)

        --spawn normal bags for each player
        local BagPos = {
            ['Orange'] = {-30.63,0.96,-14.83},
            ['Red'] = {5.960,0.96,-15.0},
            ['White'] = {27.83,0.96,-11.70},
            ['Purple'] = {24.55,0.96,14.82},
            ['Blue'] = {-6.457,0.96,15.0},
            ['Green'] = {-38.02,0.96,14.69},
        }

        local params = {}
        params.type = 'Bag'
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.8,0.6,0.8}
        for sCol, vPos in pairs(BagPos) do
            params.position = vPos
            local Bag = spawnObject(params)
            Bag.setName('Welfare Coins')
            Bag.setDescription(sCol)
            Bag.setColorTint(getPlayerColor({sPlayer = sCol}))
            Bag.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'welfare\\') end')
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end


-- spawn the event card deck, shuffle it and place it so that the New Year card is 6th from the bottom
function spawnEventCardsExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield()

        if m_Die1 ~= nil then destroyObject(m_Die1) end
        if m_Die2 ~= nil and isCKenabled() == false then destroyObject(m_Die2) end

        m_iEventCardResult = 0

        local DeckSpawnBag = getObjectFromGUID(m_DeckEventCards)
        if DeckSpawnBag ~= nil then
            local ThCurrent = coroutine.running()
            local Deck = takeObjectWorkaround(DeckSpawnBag, { rotation = {0.0,180.0,180.0},
                                               callback = 'callbackGeneral', callback_owner = Global,
                                               params = {vPos = {x=-33.5,y=1.2,z=0.0}, vRot = {0.0,180.0,180.0}, ThResume = ThCurrent} })
            coroutine.yield() --resumed from deck callback
            Deck.takeObject({ position = {x=-33.5,y=1.8,z=0.0}, rotation = {0.0,180.0,180.0},
                              callback = 'callbackGeneral', callback_owner = Global,
                              params = {vPos = {x=-33.5,y=1.8,z=0.0}, vRot = {0.0,180.0,180.0}, ThResume = ThCurrent} }) -- pick the new year card
            coroutine.yield()
            Deck.shuffle()

            -- spawn the 31 cards on top first to retain the stack name --TODO: come back here when scripting features for deck manipulation have been extended!
            for i = 1, 31 do
                if i == 31 then
                    Deck.takeObject({ position = {x=-33.5,y=(14.6-i*0.4),z=0.0}, rotation = {0.0,180.0,180.0},
                                      callback = 'callbackGeneral', callback_owner = Global,
                                      params = {vPos = {x=-33.5,y=(14.6-i*0.4),z=0.0}, vRot = {0.0,180.0,180.0}, ThResume = ThCurrent} })
                    coroutine.yield()
                else
                    Deck.takeObject({ position = {x=-33.5,y=(14.6-i*0.4),z=0.0}, rotation = {0.0,180.0,180.0} })
                end
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end
function onObjectPickUp(player_color, picked_up_object)
    if m_CurScenario.bUseEventCards then
        if picked_up_object.getDescription() == 'Event Card' then
            m_bAllowDeal = true --reset the block for the deal cards button
            local sName = picked_up_object.getName()
            local iResult = tonumber(string.sub(sName,1,2))
            if iResult == nil then --no event (new year) -> remove highlighting, no auto deal
                m_iEventCardResult = 0
            else
                m_iEventCardResult = iResult
                --check if it is the epidemic event cards for the auto deal to take into consideration
                if string.sub(sName, 5, 12) == 'Epidemic' then
                    m_bEpidemic = true
                else
                    m_bEpidemic = false
                end
            end

            if m_MapScript ~= nil then
                m_MapScript.call('highlightChits', { iNum = m_iEventCardResult })
            end
        end
    end
end

--[[ spawn objects for the Oilsprings mini-expansion
        Called from onMapLoad when a map is loaded and mini expansion enabled
]]--
function spawnOilspringsExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        local ThCurrent = coroutine.running()

        --spawn building costs tiles for each player
        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {1.47602439,1.0,1.47602439}
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/447367065311953591/2DA2B003948C9298B7C5B56E61F9F099958AEEF0/'
        custom.type = 0 --Box
        custom.thickness = 0.03

        local MarketPos = {
            ['Orange'] = {vPos = {-21.170314,0.96,-20.2506}, vRot = {0.0,180.0,0.0}},
            ['Red'] = {vPos = {7.975686,0.96,-20.2506}, vRot = {0.0,180.0,0.0}},
            ['White'] = {vPos = {38.0,0.96,-20.2506}, vRot = {0.0,180.0,0.0}},
            ['Purple'] = {vPos = {20.93,0.96,20.2506}, vRot = {0.0,0.0,0.0}},
            ['Blue'] = {vPos = {-8.39,0.96,20.2506}, vRot = {0.0,0.0,0.0}},
            ['Green'] = {vPos = {-38.0,0.96,20.2506}, vRot = {0.0,0.0,0.0}},
        }
        for sCol, Info in pairs(MarketPos) do
            params.position = Info.vPos
            --adjust position when the fishermen expansion is enabled so they don't clip
            if m_CurScenario.bUseFishermen then
                local fMod = 1.0
                if Info.vRot[2] == 180.0 then
                    fMod = -1.0
                end
                params.position[1] = params.position[1] + (6.2 * fMod)
                if m_CurScenario.bUseCK then
                    params.position[3] = params.position[3] + (1.2 * fMod)
                end
            end
            params.rotation = Info.vRot

            local Tile = spawnObject(params)
            Tile.setCustomObject(custom)
            Tile.setName('Building Costs - Oil')
            Tile.setColorTint({0.396,0.31,0.165})
            Tile.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'oilsprings\\') end')
            Tile.setLock(true)
        end

        --spawn VP token for environment champion
        local vPosToken = {-25.6,1.6,-10.0}
        if isCKenabled() then
            vPosToken[3] = vPosToken[3] - 2.4
            if m_CurScenario.bUseFishermen then  vPosToken[1] = vPosToken[1] + 5.0   end
        else
            if m_CurScenario.bUseFishermen then  vPosToken[3] = vPosToken[3] - 2.6 end
        end
        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {1.31135309,1.0,1.31135309}
        params.position = vPosToken
        params.rotation = {0.0,180.0,0.0}
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/447367065312046784/6A1E16C62E626C281D151DB743C2835277FAD339/'
        custom.type = 0 --Box
        custom.thickness = 0.09

        local Token = spawnObject(params)
        Token.setCustomObject(custom)
        Token.setName('Champion of the Environment')
        Token.setDescription('This token is awarded to the player who has sequestered the most oil (at least 3) - 1 Victory Point!')
        Token.setColorTint({0.396,0.31,0.165})
        Token.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'oilsprings\\') end')

        --spawn vp tokens for sequestered oil
        local params = {}
        params.type = 'Custom_Model'
        params.rotation = {0.0,180.0,0.0}
        local custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379943471/32300EFCC842A3D85EFCEDE3E61E9639BC1F683D/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379946921/965DEA504C0F686ECA7C1BE850FE8CE9DA03BD5E/'
        custom.type = 0 --generic
        custom.material = 3 --cardboard
        local vPosVP = {vPosToken[1]+3.6, 1.0, vPosToken[3]+1.0}
        for i = 1, 7 do
            vPosVP[2] = vPosVP[2] + 0.1
            params.position = vPosVP
            local Token = spawnObject(params)
            Token.setCustomObject(custom)
            Token.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'oilsprings\\') end') --keep the variable on rewind
            Token.setColorTint({0.733,0.259,0.184})
            Token.setName('1 Victory Point')
            Token.setDescription('For each 3 oil a player has sequestered they receive 1 victory point token.')
        end

        --spawn the metropolis tokens
        local iNum = 4
        if m_CurScenario.bExtension then
            iNum = 6
        end
        local vPosMetr = {vPosToken[1]+3.6, 1.0, vPosToken[3]-1.0}
        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {0.433980554,1.0,0.433980554}
        params.rotation = {0.0,180.0,0.0}
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/447367065314774775/4C7ED5485D4BC2F799144BB4756567173CB1B00D/'
        custom.type = 0 --Box
        custom.thickness = 0.09
        for i = 1, iNum do
            vPosMetr[2] = vPosMetr[2] + 0.3
            params.position = vPosMetr
            local Token = spawnObject(params)
            Token.setCustomObject(custom)
            Token.setColorTint({0.1686,0.1333,0.0980})
            Token.setName('Oilsprings Metropolis')
            --Handle scoring for the metropolis token (similar to C&K metropolis gate)
            Token.setLuaScript([[   m_bLoaded = false
                                    function onSave()
                                        local ToSave = { sScorer = self.getVar('sScorer') }
                                        return JSON.encode(ToSave)
                                    end
                                    function onLoad(save_state)
                                        self.setVar('sObjType', 'oilsprings')
                                        local saved_data = JSON.decode(save_state)
                                        if saved_data ~= nil then
                                            self.setVar('sScorer', saved_data.sScorer)
                                        end
                                        m_bLoaded = true
                                    end
                                    function onCollisionEnter(collision_info)
                                        if self == nil or m_bLoaded == false then
                                            return
                                        end
                                        if self.getVar('sScorer') ~= nil then
                                            return
                                        end
                                        if collision_info == nil then return end
                                        local ColObj = collision_info.collision_object
                                        if ColObj.getName() == 'City' or ColObj.getName() == 'Wall' then
                                            local MapScript = getObjectFromGUID('42fd8e')
                                            if MapScript ~= nil then
                                                local bScore = false
                                                local ChkObj = MapScript.getObjects()
                                                for i, Obj in ipairs(ChkObj) do
                                                    if Obj == ColObj then
                                                        bScore = true
                                                        break
                                                    end
                                                end
                                                --award the points
                                                if bScore == true then
                                                    if true == MapScript.call('addScore', {iScore = 1, sPlayer = ColObj.getDescription()}) then
                                                        self.setVar('sScorer', ColObj.getDescription())
                                                    end
                                                end
                                            end
                                        end
                                    end
                                    function onPickUp(player_color) --remove the score from the previous scorer when the metropolis is picked up
                                        local sOldScorer = self.getVar('sScorer')
                                        if sOldScorer ~= nil then
                                            self.setVar('sScorer', nil)
                                            local MapScript = getObjectFromGUID('42fd8e')
                                            if MapScript ~= nil then
                                                MapScript.call('subtractScore',{iScore = 1, sPlayer = sOldScorer})
                                            end
                                        end
                                    end
                                ]])
        end

        --spawn oil tokens
        iNum = 15
        if m_CurScenario.bExtension then
            iNum = 21
        end
        local vPosOil = {-22.0, 1.0, 9.77}
        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {0.5,1.0,0.5}
        params.rotation = {0.0,180.0,0.0}
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/447367065316098092/00DD562112DCC6C988257222AD3BDD1766A94D32/'
        custom.image_bottom = 'http://cloud-3.steamusercontent.com/ugc/447367065316098574/22C436B3023D0DA28B97E58C1877E361A56B7C17/'
        custom.type = 0 --Box
        custom.thickness = 0.08
        custom.stackable = true
        for i = 1, iNum do
            vPosOil[2] = vPosOil[2] + 0.1
            params.position = vPosOil
            local Token = spawnObject(params)
            Token.setCustomObject(custom)
            Token.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'oilsprings\\') end') --keep the variable on rewind
            Token.setColorTint({0.749,0.5765,0.298})
            Token.setName('Oil Token')
            if i == 10 then
                vPosOil[2] = 1.0
                vPosOil[3] = vPosOil[3] - 1.3
            end
        end

        --spawn the disaster board + oil usage indicator
        local vPosBoard = {30.0,1.0,-6.0}
        if m_MapScript ~= nil then
            vPosBoard[1] = (m_MapScript.getScale().x / 2) + m_MapScript.getPosition().x + 4.7
        end
        local spawnParams = {
          json = '',
          position = vPosBoard,
          rotation = {0.0,180.0,0.0},
          scale = {2.99,1.0,2.99},
          sound = false,
          snap_to_grid = false,
          callback = \"callbackGeneral\",
          callback_owner = Global,
          params = {vPos = vPosBoard, vRot = {0.0,180.0,0.0}, bLock = true, ThResume = ThCurrent}
        }
        spawnParams.json = [[{\"Name\": \"Custom_Tile\",\"Transform\": {\"posX\":0,\"posY\":0,\"posZ\":0,\"rotX\":0,\"rotY\":180,\"rotZ\":0,\"scaleX\":2.99,\"scaleY\": 1.0,\"scaleZ\": 2.99},
         \"Nickname\": \"Disaster Tracker\",\"Description\": \"The indicator in the bottom left shows the amount of oil used since the last disaster.\",\"ColorDiffuse\": {\"r\": 0.8588236,\"g\": 0.78039217,\"b\": 0.5803921},
         \"Locked\": false,\"Grid\": false,\"Snap\": false,\"Autoraise\": true,\"Sticky\": true,\"Tooltip\": true,\"GridProjection\": false,
         \"CustomImage\": {\"ImageURL\": \"http://cloud-3.steamusercontent.com/ugc/447367065314318778/686D7D18DBC35327579AC0D7EEBDC5A2614361C8/\",\"ImageSecondaryURL\": \"\",\"WidthScale\": 0.0,
         \"CustomTile\": {\"Type\": 0,\"Thickness\": 0.1,\"Stackable\": false,\"Stretch\": true} },
         \"AttachedSnapPoints\":[{\"Position\": {\"x\": 0.6098065,\"y\": 0.1,\"z\": -0.0007038527}},{\"Position\": {\"x\": 0.0742666,\"y\": 0.1,\"z\": 0.03509507}},{\"Position\": {\"x\": -0.156319529,\"y\": 0.1,\"z\": 0.52079767}},
        \t\t\t\t\t   {\"Position\": {\"x\": 0.771208644,\"y\": 0.1,\"z\": 0.419304371}},{\"Position\": {\"x\": 0.5446125,\"y\": 0.1,\"z\": 0.415285915}},{\"Position\": {\"x\": 0.770800233,\"y\": 0.1,\"z\": 0.651047}},
        \t\t\t\t\t   {\"Position\": {\"x\": 0.536973,\"y\": 0.1,\"z\": 0.64979887}},{\"Position\": {\"x\": 0.30507946,\"y\": 0.1,\"z\": 0.6531734}},{\"Position\": {\"x\": 0.7054365,\"y\": 0.1,\"z\": -0.5805638}},
        \t\t\t\t\t   {\"Position\": {\"x\": 0.163557366,\"y\": 0.1,\"z\": -0.52363497}},{\"Position\": {\"x\": -0.359166652,\"y\": 0.1,\"z\": -0.405847758}},{\"Position\": {\"x\": -0.587455034,\"y\": 0.1,\"z\": 0.07597994}},
        \t\t\t\t\t   {\"Position\": {\"x\": -0.6995735,\"y\": 0.1,\"z\": 0.617579639}},{\"Position\": {\"x\": 0.313636273,\"y\": 0.1,\"z\": 0.418916851}} ] }]]
        local TrackerBoard = spawnObjectJSON(spawnParams)
        TrackerBoard.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'helpers\\') end')
        TrackerBoard.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'oilsprings\\') end')

        coroutine.yield(1)
        --spawn the indicator chip when the board is initialized
        vPosBoard[1] = vPosBoard[1] - 2.2949516
        vPosBoard[2] = 1.3
        vPosBoard[3] = vPosBoard[3] - 1.25559335
        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {0.291973174,1.0,0.291973174}
        params.position = vPosBoard
        params.rotation = {0.0,180.0,0.0}
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/447367065314718788/F8DFFEA39131486BC0AE09F946B710E4CC62E03D/'
        custom.type = 0 --Box
        custom.thickness = 0.03
        local Token = spawnObject(params)
        Token.setCustomObject(custom)
        Token.setName('Disaster Track Marker')
        Token.setColorTint({0.9961,0.8824,0.6627})
        Token.setLuaScript('function onLoad(saved_state) self.setVar(\\'sObjType\\', \\'oilsprings\\') end')

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[Spawn additional items for the Rivers of Catan expansion
    the rivers hexes are defined in the scenario definition and the bridges are spawned from setupPlayerItems ]]--
function spawnRiversExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        --determine spawn location from the mapscript dimensions (map size)
        local vPos = {30.0,1.0,-9.0}
        if m_MapScript ~= nil then
            vPos[1] = (m_MapScript.getScale().x / 2) + m_MapScript.getPosition().x
        end

        --spawn wealthiest settler token
        local custom = {}
        custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379953587/A738B7C427B1903BFE09D9FCD69C233FAD9D539B/'
        custom.type = 0 --Box
        custom.thickness = 0.04

        local params = {}
        params.type = 'Custom_Tile'
        params.scale = {0.5,1.0,0.5}

        params.position = vPos
        params.rotation = {0.0,180.0,0.0}
        local Wealthiest = spawnObject(params)
        Wealthiest.setCustomObject(custom)
        Wealthiest.setName('Wealthiest Settler')
        Wealthiest.setDescription('The player who has solely the most gold gets this token for +1 Victory Point.')
        Wealthiest.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'rivers\\') end')
        Wealthiest.setColorTint({0.671, 0.141, 0.169})

        --spawn poor settler tokens
        vPos[3] = vPos[3] - 1.5
        for i=1, 6 do
            custom.image = 'http://cloud-3.steamusercontent.com/ugc/155773601379955708/5897F1D78836BD89645EE6090D50F18F07D58A72/'
            local Token = spawnObject(params)
            Token.setCustomObject(custom)
            Token.setName('Poor Settler')
            Token.setDescription('The player(s) who has the least amount of gold gets this token for -2 Victory Points.')
            Token.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'rivers\\') end')
            Token.setColorTint({0.839, 0.706, 0.596})
            vPos[2] = vPos[2] + 0.4
        end

        --spawn gold coins
        params = {}
        params.type = 'Custom_Model'
        params.position = {vPos[1]+2.2, 1.0, vPos[3]}
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.5,1.0,0.5}

        custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379951416/DF35BA080143304EC36CC9A25CF45E333A19724E/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379959874/DBC1827EF70AE3FC788D21E4C979A9A392F9B5FA/'
        custom.type = 5 --Chip
        custom.material = 2 --metal
        custom.specular_sharpness = 1.0
        custom.specular_intensity = 0.5

        for i=1, 100 do
            local Chip = spawnObject(params)
            Chip.setCustomObject(custom)
            Chip.setName('Gold')
            Chip.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'rivers\\') end') --keep the variable on rewind
            Chip.setColorTint({0.984,0.867,0.341})
            params.position[2] = params.position[2] + 0.13
            if i % 25 == 0 then
                params.position[1] = params.position[1] + 1.8
                params.position[2] = 1.0
                if i == 50 then
                    params.position[1] = params.position[1] - 3.6
                    params.position[3] = params.position[3] + 1.8
                end
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end
--[[Spawn additional items for the Caravans expansion
    Spawn camels figurines next to the map ]]--
function spawnCaravansExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        --determine spawn location from the mapscript dimensions (map size)
        local vPos = {30.0,1.5,-9.0}
        if m_MapScript ~= nil then
            vPos[1] = (m_MapScript.getScale().x / 2) + m_MapScript.getPosition().x
            vPos[1] = vPos[1] - 1.0
        end

        --spawn camels
        params = {}
        params.type = 'Custom_Model'
        params.position = {vPos[1], vPos[2], vPos[3]}
        params.rotation = {0.0,90.0,0.0}
        custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601380258198/1FD357DB6672A2502EC30E2A1D8FE3432B076570/'
        custom.diffuse = ''
        custom.type = 1 --figurine
        custom.material = 1 --wood

        local iNumCamels = 22
        if m_CurScenario.bExtension then --5-6 players
            iNumCamels = 33
        end
        for i = 1, iNumCamels do
            local Camel = spawnObject(params)
            Camel.setCustomObject(custom)
            Camel.setName('Camel')
            --Beware some inception incoming - I apologize to anyone trying to figure out what is happening here ;-)
            --In prose: make the camel generate a scripting zone around itself when it is placed on the map. This scripting zone will monitor incoming/leaving objects to make sure any buildings get score added/deducted when being placed/removed between 2 camels
            Camel.setLuaScript( [[m_Zone = nil
                                function onSave()
                                    local sGUID = nil
                                    if m_Zone ~= nil then sGUID = m_Zone.getGUID() end
                                    return JSON.encode({sZoneGUID = sGUID})
                                end
                                function onLoad(save_state)
                                    self.setVar('sObjType', 'caravans')
                                    local saved_data = JSON.decode(save_state)
                                    if saved_data ~= nil then if saved_data.sZoneGUID ~= nil then m_Zone = getObjectFromGUID(saved_data.sZoneGUID) end end
                                end
                                --Destroy the scripting zone for scoring when the camel is picked up
                                function onPickUp(player_color)
                                    if m_Zone ~= nil then destroyObject(m_Zone) end
                                end
                                --When a camel is placed, spawn a scripting zone to track settlements/cities entering leaving it to apply score
                                function onCollisionEnter(collision_info)
                                    if m_Zone ~= nil or collision_info == nil then
                                        return
                                    end
                                    local sObjType = collision_info.collision_object.getVar('sObjType')
                                    if sObjType == 'numtoken' or sObjType == 'hex' or collision_info.collision_object.getName() == 'Road' then
                                        --Spawn scripting zones to manage scoring for settlements / cities entering leaving the position between 2 camels
                                        m_Zone = spawnObject({ type = 'ScriptingTrigger', position = self.getPosition(), rotation = {0.0,self.getRotation().y,0.0}, scale = {3.5,1.0,2.6} })
                                        m_Zone.setName('camel_zone')
                                        m_Zone.setLuaScript([=[ function onLoad(save_state) self.setVar('sObjType', 'caravans') end
                                                                function checkScoring(p)
                                                                    local Camels = {}
                                                                    local ConnectedB = {}
                                                                    local UnConnectedB = {}
                                                                    local Objects = self.getObjects()
                                                                    if p.enter_object ~= nil then --add this object because it is not returned from getObjects when entering
                                                                        table.insert(Objects, p.enter_object)
                                                                    end
                                                                    if p.leave_object ~= nil then
                                                                        --it is a connected building that is leaving -> remove score and connection
                                                                        local iPosAppend = string.find(p.leave_object.getName(), '(Connected to Caravan)')
                                                                        if iPosAppend ~= nil then
                                                                            iPosAppend = iPosAppend - 3
                                                                            p.leave_object.setName(string.sub(p.leave_object.getName(), 1, iPosAppend)) --remove \"(Connected to Caravan)\" from the name
                                                                            local MapScript = getObjectFromGUID('42fd8e')
                                                                            if MapScript ~= nil then
                                                                                MapScript.call('subtractScore', {iScore = 1, sPlayer = p.leave_object.getDescription()})
                                                                            end
                                                                            return
                                                                        elseif p.leave_object.getName() == 'Camel' then --remove leaving object if it is a camel because it is still in getObjects when the leave event is triggered
                                                                            for j = 1, #Objects do
                                                                                if Objects[j] == p.leave_object then
                                                                                    table.remove(Objects, j)
                                                                                    break
                                                                                end
                                                                            end
                                                                        end
                                                                    end

                                                                    --get other camels in range
                                                                    for i, Obj in pairs(Objects) do
                                                                        if Obj.getName() == 'Camel' then
                                                                            table.insert(Camels, Obj)
                                                                        elseif Obj.getName() == 'Settlement' or Obj.getName() == 'City' then
                                                                            table.insert(UnConnectedB, Obj)
                                                                        elseif Obj.getName() == 'Settlement (Connected to Caravan)' or Obj.getName() == 'City (Connected to Caravan)' then
                                                                            table.insert(ConnectedB, Obj)
                                                                        end
                                                                    end

                                                                    --check normal settlements / cities if they should be connected now
                                                                    if #UnConnectedB > 0 then
                                                                        for i, Obj in pairs(UnConnectedB) do
                                                                            local fX = Obj.getPosition().x
                                                                            local fZ = Obj.getPosition().z
                                                                            local iConnections = 0
                                                                            for j = 1, #Camels do
                                                                                local fDistance = math.abs(Camels[j].getPosition().x - fX) + math.abs(Camels[j].getPosition().z - fZ)
                                                                                if fDistance < 2.9 then
                                                                                    iConnections = iConnections + 1
                                                                                end
                                                                            end
                                                                            if iConnections >= 2 then
                                                                                Obj.setName(Obj.getName() .. ' (Connected to Caravan)')
                                                                                local MapScript = getObjectFromGUID('42fd8e')
                                                                                if MapScript ~= nil then
                                                                                    MapScript.call('addScore', {iScore = 1, sPlayer = Obj.getDescription()})
                                                                                end
                                                                            end
                                                                        end
                                                                    end
                                                                    --check buildings connected to caravans if they are still connected to 2 camels
                                                                    if #ConnectedB > 0 then
                                                                        for i, Obj in pairs(ConnectedB) do
                                                                            local iConnections = 0
                                                                            if Obj.held_by_color == nil then --a building held by a player (it is being picked up) always gets disconnected, so don't bother counting camels
                                                                                local fX = Obj.getPosition().x
                                                                                local fZ = Obj.getPosition().z
                                                                                for j = 1, #Camels do
                                                                                    local fDistance = math.abs(Camels[j].getPosition().x - fX) + math.abs(Camels[j].getPosition().z - fZ)
                                                                                    if fDistance < 2.9 then
                                                                                        iConnections = iConnections + 1
                                                                                    end
                                                                                end
                                                                            end
                                                                            if iConnections < 2 then
                                                                                local iPosAppend = string.find(Obj.getName(), '(Connected to Caravan)')
                                                                                if iPosAppend ~= nil then
                                                                                    iPosAppend = iPosAppend - 3
                                                                                    Obj.setName(string.sub(Obj.getName(), 1, iPosAppend)) --remove \"(Connected to Caravan)\" from the name
                                                                                    local MapScript = getObjectFromGUID('42fd8e')
                                                                                    if MapScript ~= nil then
                                                                                        MapScript.call('subtractScore', {iScore = 1, sPlayer = Obj.getDescription()})
                                                                                    end
                                                                                end
                                                                            end
                                                                        end
                                                                    end
                                                                end
                                                                function onObjectEnterScriptingZone(zone, enter_object)
                                                                    if zone == self and enter_object ~= nil then
                                                                        if enter_object.getName() == 'Camel' or enter_object.getName() == 'Settlement' or enter_object.getName() == 'City' then
                                                                            checkScoring({enter_object = enter_object})
                                                                        end
                                                                    end
                                                                end
                                                                function onObjectLeaveScriptingZone(zone, leave_object)
                                                                    if zone == self and leave_object ~= nil then
                                                                        if leave_object.getName() == 'Camel' or string.find(leave_object.getName(),'(Connected to Caravan)') ~= nil then
                                                                            checkScoring({leave_object = leave_object})
                                                                        end
                                                                    end
                                                                end ]=]
                                                            )
                                    end
                                end]])
            Camel.setColorTint({0.576,0.357,0.263})

            params.position[1] = params.position[1] + 0.4
            if i % 11 == 0 then
                params.position[1] = vPos[1]
                params.position[3] = params.position[3] - 1.0
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[Spawn additional items for the Barbarian Attack campaign
    Spawn barbarian figurines & gold next to the map + special die on the castle hex
    The knight figures for players are spawned from setupPlayerItems
]]--
function spawnBarbarianAttackExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        --determine spawn location from the mapscript dimensions (map size)
        local vPos = {30.0,1.5,-9.0}
        if m_MapScript ~= nil then
            vPos[1] = (m_MapScript.getScale().x / 2) + m_MapScript.getPosition().x
        end

        --Spawn a bag for the barbarians
        params = {}
        params.type = 'Bag'
        params.position = vPos
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.8,0.6,0.8}
        if isCKenabled() then
            params.type = 'Infinite_Bag' --unlimited amounts of barbarians when played with C&K
        end

        local BarbBag = spawnObject(params)
        BarbBag.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'battack\\') end') --keep the variable on rewind
        BarbBag.setName('Barbarians')
        BarbBag.setColorTint({0.745,0.608,0.4})

        --spawn the barbarian figures over the bag
        local iNum = 36
        if m_CurScenario.bExtension then
            iNum = 48
        end
        for i = 1, iNum do
            local Barbarian = spawnTABBarbarian({vPos = {vPos[1],80.0, vPos[3]}, vRot = {320.0,0.0,0.0}})
            Barbarian.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'battack\\') end')
            Barbarian.use_snap_points = false
            BarbBag.putObject(Barbarian)

            if isCKenabled() then --infinite bag => spawn just one
                break
            end
        end

        --spawn gold coins
        params = {}
        params.type = 'Custom_Model'
        params.position = {vPos[1]+2.2, 1.0, vPos[3]}
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.5,1.0,0.5}
        custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379951416/DF35BA080143304EC36CC9A25CF45E333A19724E/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379959874/DBC1827EF70AE3FC788D21E4C979A9A392F9B5FA/'
        custom.type = 5 --Chip
        custom.material = 2 --metal
        custom.specular_sharpness = 1.0
        custom.specular_intensity = 0.5

        for i=1, 100 do
            local Chip = spawnObject(params)
            Chip.setCustomObject(custom)
            Chip.setName('Gold')
            Chip.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'battack\\') end') --keep the variable on rewind
            Chip.setColorTint({0.984,0.867,0.341})
            params.position[2] = params.position[2] + 0.13
            if i % 25 == 0 then
                params.position[1] = params.position[1] + 1.8
                params.position[2] = 1.0
                if i == 50 then
                    params.position[1] = params.position[1] - 3.6
                    params.position[3] = params.position[3] + 1.8
                end
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end

--[[Spawn additional items for the Traders & Barbarians campaign
    Spawn the player wagons and the baggage train cards next to the player areas
    Spawn gold next to the map
    The development cards deck for this expansion is spawned from setupDecks
    Barbarian figures are spawed from the map definition
]]--
function spawnTradersAndBarbariansExpansion()
    local ThRoutine = coroutine.create( function (ThNext)
        coroutine.yield(1)

        --determine spawn location from the mapscript dimensions (map size)
        local vPos = {30.0,1.5,-9.0}
        if m_MapScript ~= nil then
            vPos[1] = (m_MapScript.getScale().x / 2) + m_MapScript.getPosition().x
        end

        --spawn gold coins
        local params = {}
        params.type = 'Custom_Model'
        params.position = {vPos[1]+2.2, 1.0, vPos[3]}
        params.rotation = {0.0,180.0,0.0}
        params.scale = {0.5,1.0,0.5}
        custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379951416/DF35BA080143304EC36CC9A25CF45E333A19724E/'
        custom.diffuse = 'http://cloud-3.steamusercontent.com/ugc/155773601379959874/DBC1827EF70AE3FC788D21E4C979A9A392F9B5FA/'
        custom.type = 5 --Chip
        custom.material = 2 --metal
        custom.specular_sharpness = 1.0
        custom.specular_intensity = 0.5

        for i=1, 70 do
            local Chip = spawnObject(params)
            Chip.setCustomObject(custom)
            Chip.setName('Gold')
            Chip.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'traders\\') end') --keep the variable on rewind
            Chip.setColorTint({0.984,0.867,0.341})
            params.position[2] = params.position[2] + 0.13
            if i % 25 == 0 then
                params.position[1] = params.position[1] + 1.8
                params.position[2] = 1.0
                if i == 50 then
                    params.position[1] = params.position[1] - 3.6
                    params.position[3] = params.position[3] + 1.8
                end
            end
        end

        local PlayerDef = {  ['Green'] = {vPosWagon = {-29.6 + 3.0, 1.2, 15.0}, DeckBag = '8d01db', vPosDeck = {-29.6, 1.2, 15.0}, vPosGold = {-37.4,1.2,19.0}},
                     ['Blue'] = {vPosWagon = {-0.1 - 3.0, 1.2, 15.0}, DeckBag = '5a1d43', vPosDeck = {-0.1, 1.2, 15.0}, vPosGold = {-7.8,1.2,19.0}},
                     ['Purple'] = {vPosWagon = {29.4 - 3.0, 1.2, 15.0}, DeckBag = '3beb06', vPosDeck = {29.4, 1.2, 15.0}, vPosGold = {21.4,1.2,19.0}},
                     ['White'] = {vPosWagon = {29.4 - 3.0, 1.2, -15.0}, DeckBag = '6f9264', vPosDeck = {29.4, 1.2, -15.0}, vPosGold = {37.4,1.2,-19.0}},
                     ['Red'] = {vPosWagon = {-0.15 - 3.0, 1.2, -15.0}, DeckBag = 'b787f3', vPosDeck = {-0.15, 1.2, -15.0}, vPosGold = {7.4,1.2,-19.0}},
                     ['Orange'] = {vPosWagon = {-29.6 + 3.0, 1.2, -15.0}, DeckBag = '26b465', vPosDeck = {-29.6, 1.2, -15.0}, vPosGold = {-21.9,1.2,-19.0}},
                }

        if m_CurScenario.bUseFrenemies then --move greens cards to the side a bit
            PlayerDef['Green'].vPosWagon[1] = PlayerDef['Green'].vPosWagon[1] - 2.5
            PlayerDef['Green'].vPosDeck[1] = PlayerDef['Green'].vPosDeck[1] - 2.5
        end
        if isCKenabled() then --move oranges cards to the side a bit
            PlayerDef['Orange'].vPosWagon[1] = PlayerDef['Orange'].vPosWagon[1] - 2.5
            PlayerDef['Orange'].vPosDeck[1] = PlayerDef['Orange'].vPosDeck[1] - 2.5
        end

        --spawn 5 initial gold coins for each player
        for sCol, Info in pairs(PlayerDef) do
            params.position = Info.vPosGold
            for i=1, 5 do
                local Chip = spawnObject(params)
                Chip.setCustomObject(custom)
                Chip.setName('Gold')
                Chip.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'traders\\') end') --keep the variable on rewind
                Chip.setColorTint({0.984,0.867,0.341})
                params.position[2] = params.position[2] + 0.13
            end
        end

        --spawn wagon figure for each player & the baggage train decks
        params = {}
        params.type = 'Custom_Model'
        params.rotation = {0.0,90.0,0.0}
        custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379962685/10B747E09EEDE274FDB3F79B87288E78B8ED33CF/'
        custom.diffuse = ''
        custom.type = 1 --figurine
        custom.material = 3 --wood

        local TaBBag = getTaBBag()
        for sCol, Info in pairs(PlayerDef) do
            --spawn the wagon
            params.position = Info.vPosWagon
            local Wagon = spawnObject(params)
            Wagon.setCustomObject(custom)
            Wagon.setName('Baggage Train')
            Wagon.setDescription(sCol)
            Wagon.setLuaScript('function onLoad() self.setVar(\\'sObjType\\', \\'traders\\') end') --keep the variable on rewind
            Wagon.setColorTint(m_PlayerColors[sCol])
            Wagon.use_snap_points = false

            --spawn the baggage train card deck
            if TaBBag ~= nil then
                local vPosDeck = {Info.vPosDeck[1]-1.2,Info.vPosDeck[2],Info.vPosDeck[3]}
                local vPosCard = {Info.vPosDeck[1]+1.2,Info.vPosDeck[2],Info.vPosDeck[3]}
                local vRot = {0.0,180.0,180.0}
                if sCol == 'Green' or sCol == 'Blue' or sCol == 'Purple' then
                    vPosDeck = {Info.vPosDeck[1]+1.2,Info.vPosDeck[2],Info.vPosDeck[3]}
                    vPosCard = {Info.vPosDeck[1]-1.2,Info.vPosDeck[2],Info.vPosDeck[3]}
                    vRot = {0.0,0.0,180.0}
                end
                takeObjectWorkaround(TaBBag, {  guid = TaBBag.call('getBaggageDeckGUID', {sCol = sCol}),
                                                position = vPosDeck,
                                                rotation = vRot,
                                                callback = 'callbackDrawCard',
                                                callback_owner = Global,
                                                params = {vCardPos = vPosCard, vRot = {vRot[1],vRot[2],0.0}}
                                            } )
            end
        end

        if ThNext ~= nil then
            coroutine.resume(ThNext)
        end
        return true
    end)
    return ThRoutine
end
function callbackDrawCard(Deck, p)
    Deck.takeObject({index = 0, position = p.vCardPos, rotation = p.vRot})
end

function isRiversCompatible(p)
    local sID = p.sScenarioID
    if sID == 'B' or sID == 'B2' or sID == 'S1' or sID == 'S4' or sID == 'S5' or sID == 'T1' or sID == 'T3' then
        return true
    end
    return false
end
function isCaravansCompatible(p)
    local sID = p.sScenarioID
    if sID == 'B' or sID == 'B2' or sID == 'S1' or sID == 'S4' or sID == 'S5' or sID == 'T1' or sID == 'T3' then
        return true
    end
    return false
end
function isBAttackCompatible(p)
    local sID = p.sScenarioID
    if sID == 'B' or sID == 'B2' or sID == 'S1' or sID == 'T1' or sID == 'T3' then
        return true
    end
    return false
end
function isTradersCompatible(p)
    local sID = p.sScenarioID
    if sID == 'B' or sID == 'B2' then
        return true
    end
    return false
end

--[[ onMapLoad
    Called from the control panel, executes general tasks to be done when loading a new map:
     - Clean up old object
     - Setting map script zone size
     - Setting scenario related stuff
     - Manage Largest Army and Longest Road cards
     - Spawn correct dice and put them in the starting position
     - Put the robber back into the starting position
     - etc.
    Parameters:
    Scenario - table:
        sID - identifies the scenario
        sInfoText - info text to show in the bottom right corner
        iVPTarget - target VP for the current scenario
        iVPadjCK - additional VP needed to win when playing with C&K
        fCatanChitScoreMap - Score to give to a player for a Catan Chit on the map
        fCatanChitScoreHand - Score to give to a player for a Catan Chit in their player area
    vMapScale   - size of the map script zone (so it covers the entire playing area)
]]--
function onMapLoad(p)
    --check if it is an Explorers & Pirates scenario (ID starts with C)
    local bIsEaP = (string.sub(p.Scenario.sID,1,1) == 'C')

    m_bMapLoaded = false

    --remove the quick start overlay
    removeOverlay()

    --reset dice monitoring queue
    for i = 1, #m_CheckDice do
        if m_CheckDice[i] ~= nil then
            m_CheckDice[i].call('setQueueStatus', {bActive = false})
        end
    end
    m_CheckDice = {}

    --reset dice roll statistics
    if m_DiceLogger ~= nil then
        m_DiceLogger.call('resetStats')
    end

    m_UnlockOnLoad = {} --list of objects to be unlocked once all hex tiles are loaded
    m_bEpidemic = false --for deal function with the EventCard expansion

    --[[
        Activate the loaded scenario info and rules
    --]]
    local sScenarioID = p.Scenario.sID
    m_CurScenario = {}
    m_CurScenario.sID = sScenarioID
    m_CurScenario.bUseCK = m_bExpCK
    m_CurScenario.bUseFishermen = m_bEnableFishermen
    m_CurScenario.bUseEventCards = m_bEnableEventCards
    m_CurScenario.bUseWelfare = m_bEnableWelfare
    m_CurScenario.bUseFrenemies = (m_iFrenemiesPlayers > 0)
    if m_bEnableRivers then
        if getTaBBag() == nil then
            m_bEnableRivers = false
        else
            m_CurScenario.bUseRivers = isRiversCompatible({sScenarioID = sScenarioID})    --Only enable the rivers expansion if it works for this scenario
            if m_CurScenario.bUseRivers == false then printToAll('[i]The Rivers of Catan[/i] is not compatible with this scenario and will not be loaded.', {1.0,0.8627,0.05098}) end
        end
    else
        m_CurScenario.bUseRivers = false
    end
    if m_bEnableCaravans then
        if getTaBBag() == nil then
            m_bEnableCaravans = false
        else
            m_CurScenario.bUseCaravans = isCaravansCompatible({sScenarioID = sScenarioID})    --Only enable the caravans expansion if it works for this scenario
            if m_CurScenario.bUseCaravans == false then printToAll('[i]The Caravans[/i] is not compatible with this scenario and will not be loaded.', {1.0,0.8627,0.05098}) end
        end
    else
        m_CurScenario.bUseCaravans = false
    end
    if m_bEnableBarbarianAttack then
        if getTaBBag() == nil then
            m_bEnableBarbarianAttack = false
        else
            m_bColorDieSpawned = false
            m_CurScenario.bUseBAttack = isBAttackCompatible({sScenarioID = sScenarioID})    --Only enable the barbarian attack expansion if it works for this scenario
            if m_CurScenario.bUseBAttack == false then printToAll('[i]Barbarian Attack[/i] is not compatible with this scenario and will not be loaded.', {1.0,0.8627,0.05098}) end
        end
    else
        m_CurScenario.bUseBAttack = false
    end
    if m_bEnableTraders then
        if getTaBBag() == nil then
            m_bEnableTraders = false
        else
            m_CurScenario.bUseTraders = isTradersCompatible({sScenarioID = sScenarioID})    --Only enable the barbarian attack expansion if it works for this scenario
            if m_CurScenario.bUseTraders == false then printToAll('[i]Traders & Barbarians[/i] is not compatible with this scenario and will not be loaded.', {1.0,0.8627,0.05098}) end
        end
    else
        m_CurScenario.bUseTraders = false
    end
    if m_bEnableOilsprings then
        if sScenarioID ~= 'B' then --the Oilsprings only makes sense with the basic game
            m_bEnableOilsprings = false
            printToAll('[i]Oilsprings[/i] is not compatible with this scenario and will not be loaded.', {1.0,0.8627,0.05098})
        else
            --Oilsprings cannot be combined with any T&B scenario
            if m_CurScenario.bUseRivers or m_CurScenario.bUseCaravans or m_CurScenario.bUseBAttack or m_CurScenario.bUseTraders then
                m_bEnableOilsprings = false
                printToAll('[i]Oilsprings[/i] cannot be combined with [i]Traders & Barbarians[/i] campaigns and will not be loaded.', {1.0,0.8627,0.05098})
            end
        end
    end

    m_CurScenario.bExtension = false --5-6 Player layout
    if p.bExtension == true then
        m_CurScenario.bExtension = true
    end

    --[[
        Calculate target VP shown in the bottom right info box
    --]]
    local iTargetVP = p.Scenario.iVPTarget
    --increase the target VP display shown in the infobox when expansions are enabled
    if m_bExpCK then iTargetVP = iTargetVP + p.Scenario.iVPadjCK end
    if m_iFrenemiesPlayers > 0 then iTargetVP = iTargetVP + 1 end
    if m_bEnableHarborMaster then iTargetVP = iTargetVP + 1 end
    if m_bEnableOilsprings then iTargetVP = iTargetVP + 2 end
    if m_CurScenario.bUseCaravans then iTargetVP = iTargetVP + 2 end
    if m_CurScenario.bUseBAttack then iTargetVP = iTargetVP + 2 end
    if m_CurScenario.bUseTraders then iTargetVP = iTargetVP + 3 end
    setNotes(string.gsub(p.Scenario.sInfoText, '&VP&', iTargetVP))

    --[[
        Reset everything in the map script zone:
        - highlighting of tokens (reset list of active tokens -> repopulated when new tokens are spawned)
        - score keeping
    --]]
    if m_MapScript ~= nil then
        m_MapScript.call('onMapLoad')

        m_MapScript.call('setCatanChitScore', { fOnMap = p.Scenario.fCatanChitScoreMap, fOnHand = p.Scenario.fCatanChitScoreHand })

        m_MapScript.setScale(p.vMapScale)

        m_MapScript.call('clearCounters')
        m_MapScript.call('setCountersEnabled', {bEnable = false})
    end

    m_iLoadingHexes = 0
    m_iSpawnedHexes = 0

    --[[
        Find objects to be deleted or repositioned
    --]]
    local LargestArmy = nil
    local LongestRoad = nil
    local Harbormaster = nil
    local Robber = nil
    local BuildingCosts = {}
    local AllObj = getAllObjects()
    for i, Obj in ipairs(AllObj) do
        local sObjType = Obj.getVar('sObjType')
        local sObjName = Obj.getName()
        if  sObjType == 'hex' or sObjType == 'numtoken' or sObjType == 'border' or sObjType == 'harbor' or sObjType == 'seafarers_add' or
            sObjType == 'frenemies' or sObjType == 'channel' or sObjType == 'helpers' or sObjType == 'fishermen' or
            sObjType == 'rivers' or sObjType == 'caravans' or sObjType == 'battack' or sObjType == 'traders' or sObjType == 'oilsprings' or
            sObjType == 'welfare' or
            sObjType == 'eap' then
            destroyObject(Obj)
        elseif Obj.tag == 'Deck' or Obj.tag == 'Card' then
            destroyObject(Obj)
        elseif sObjName == 'Treasure Chest' or sObjName == 'Dragon' or sObjName == 'Automatic Barbarian Ship' or sObjName == 'C&K Counter - Knights vs Barbarains' then
            destroyObject(Obj)
        elseif sObjName == 'Robber' then
            Robber = Obj
        elseif sObjName == 'Largest Army' then
            LargestArmy = Obj
        elseif sObjName == 'Longest Road' then
            LongestRoad = Obj
        elseif sObjName == 'Harbormaster' then
            Harbormaster = Obj
        elseif sObjName == 'Longest Shipping Line' then
            destroyObject(Obj)
        elseif sObjName == 'Building Costs' then
            table.insert(BuildingCosts, Obj)
        elseif sObjName == 'Blocked Settlement' then
            Obj.setName('Settlement')
        elseif sObjName == 'Blocked City' or sObjName == 'City' or sObjName == 'City (Connected to Caravan)' then
            Obj.setName('City')
        elseif sObjName == 'Settlement (Connected to Caravan)' then
            Obj.setName('Settlement')
        elseif string.sub(sObjName, 1, 10) == 'Catan Chit' then --Delete all existing Catan Chits
            destroyObject(Obj)
        elseif string.sub(sObjName, 1, 10) == 'Metropolis' then
            destroyObject(Obj)
        elseif string.sub(Obj.getDescription(),1,15) == 'Barbarian route' then
            destroyObject(Obj) --destroy and respawn it in the proper position from the control panel if needed
        elseif Obj.getVar('sUpgradeType') ~= nil then --destroy and respawn city upgrade charts
            destroyObject(Obj)
        end
    end

    --[[
        Move the robber out of the way of spawning hexes to the starting position or spawn / delete it if necessary
    --]]
    local bUseRobber = true
    if sScenarioID == 'S7' or sScenarioID == 'T4' or m_CurScenario.bUseBAttack or m_CurScenario.bUseTraders or bIsEaP then
        bUseRobber = false
    end
    if Robber ~= nil then
        if bUseRobber == false then
            destroyObject(Robber)
        else
            Robber.setRotation({0.0,0.0,0.0})
            Robber.setPosition({x=-31.0,y=0.97,z=1.81})
        end
    elseif bUseRobber then --spawn new robber
        local params = {}
        params.type = 'Custom_Model'
        params.position = {-31.0, 0.97, 1.81}
        params.rotation = {0.0,0.0,0.0}
        params.scale = {1.25, 1.25, 1.25}
        local custom = {}
        custom.mesh = 'http://cloud-3.steamusercontent.com/ugc/155773601379964516/39142B17D65D9A9EA7175C2DDA61B52BF6FEE730/'
        custom.diffuse = ''
        custom.type = 1 --figurine
        custom.material = 1 --wood
        custom.specular_intensity = 0.04

        m_Robber = spawnObject(params)
        m_Robber.setCustomObject(custom)
        m_Robber.setColorTint({0.12,0.12,0.12})
        m_Robber.setName('Robber')\n        m_Robber.setLuaScript('function onObjectDrop(player_color,object)\\r\\n\\r\\nif(object.guid == self.guid) then\\r\\n\\r\\nself.setColorTint(player_color)\\r\\n\\r\\nend\\r\\n\\r\\nend') \n        m_Robber.setDescription('The Robber has to be moved when a 7 is rolled or a Knight is played. Put it in the center of a resource tile and steal a resource card from any 1 player having settlements/cities on this tile.\\nAs long as the robber is blocking a hex, no one will gain resources from this field.')
    end

    --[[
        Position/spawn/delete the special victory point cards (longest road, largest army, harbormaster card)
    --]]
    local vPosLR = {-25.6,1.1,-10.0}
    if isCKenabled() then
        vPosLR[3] = vPosLR[3] - 2.4
        if m_bEnableFishermen then
            vPosLR[1] = vPosLR[1] + 5.0
        end
    else
        if m_bEnableFishermen then
            vPosLR[3] = vPosLR[3] - 2.6
        end
    end
    if LongestRoad ~= nil then
        if sScenarioID == 'S6' or sScenarioID == 'S7' or m_CurScenario.bUseTraders or bIsEaP then --no longest road in these scenarios
            destroyObject(LongestRoad)
        else -- put it in the proper position
            LongestRoad.setRotation({0.0,90.0,0.0})
            LongestRoad.setPosition(vPosLR)
            LongestRoad.setLock(true)
            addToUnlockList({Obj = LongestRoad})
        end
    else
        if sScenarioID ~= 'S6' and sScenarioID ~= 'S7' and m_CurScenario.bUseTraders == false and bIsEaP == false then
            --longest road does not exist but we need it -> spawn new one
            spawnLongestRoadCard(vPosLR, {0.0,90.0,0.0})
        end
    end

    local vPosLA = {-26.2,0.96,-10.0}
    if m_bEnableFishermen then
        vPosLA[3] = vPosLA[3] - 2.6
    end
    if LargestArmy ~= nil then
        if isCKenabled() or sScenarioID == 'S7' or sScenarioID == 'T4' or m_CurScenario.bUseBAttack or bIsEaP then --no largest army with the C&K expansion and in scenario 7 & T4
            destroyObject(LargestArmy)
        else -- put it in the proper position
            LargestArmy.setRotation({0.0,90.0,0.0})
            LargestArmy.setPosition(vPosLA)
            LargestArmy.setLock(true)
            addToUnlockList({Obj = LargestArmy})
        end
    else
        if isCKenabled() == false and sScenarioID ~= 'S7' and sScenarioID ~= 'T4' and m_CurScenario.bUseBAttack == false and bIsEaP == false then
            --largest army does not exist but we need it -> spawn new one
            spawnLargestArmyCard(vPosLA, {0.0,90.0,0.0})
        end
    end

    --harbor master mini expansion
    if m_bEnableHarborMaster == false then
        if Harbormaster ~= nil then
            destroyObject(Harbormaster)
        end
    else
        local vPosHM = {-25.0,1.3,-10.0}
        if isCKenabled() then
            vPosHM[1] = vPosHM[1] - 0.6
            vPosHM[3] = vPosHM[3] - 3.2
            if m_bEnableFishermen then
                vPosHM[1] = vPosHM[1] + 5.0
            end
        else
            if m_bEnableFishermen then
                vPosHM[3] = vPosHM[3] - 2.6
            end
        end
        if Harbormaster ~= nil then
            Harbormaster.setRotation({0.0,90.0,0.0})
            Harbormaster.setPosition(vPosHM)
            Harbormaster.setLock(true)
            addToUnlockList({Obj = Harbormaster})
        else
            spawnHarbormasterCard(vPosHM, {0.0,90.0,0.0})
        end
    end

    --[[
        Select the proper state for the building costs cards
        TODO: adjust if there ever is a proper \"getState\" function
    --]]
    for i, Card in ipairs(BuildingCosts) do
        local iAvailableState = Card.getStates()[1].id -- getState returns all _other_ available states
        if isCKenabled() == true then
            if iAvailableState == 2 then --means state 2 is not set currently
                Card.setState(2)
            end
        else
            if iAvailableState == 1 then
                Card.setState(1)
            end
        end
        --Explorers & Pirates may hide the building costs --> reset it
        local vPos = Card.getPosition()
        Card.setPosition({vPos.x,0.96,vPos.z})
        Card.tooltip = true
        Card.interactable = true
    end

    --[[
        Position dice and reset color
    --]]
    if m_Die1 ~= nil then
        m_Die1.setRotation({-90.0,0.0,0.0})
        m_Die1.setPosition({x=39.5,y=35,z=12.04})
    else
        if m_bEnableEventCards == false then
            m_Die1 = spawnDie(1, {x=39.5,y=35,z=12.04}, {-90.0,0.0,0.0})
        end
    end
    if m_Die2 ~= nil then
        m_Die2.setRotation({-90.0,0.0,0.0})
        m_Die2.setPosition({x=38.34,y=35,z=-12.70})
        m_Die2.setColorTint({0.90588,0.82745,0.72157})
    else
        if m_bEnableEventCards == false or isCKenabled() then
            m_Die2 = spawnDie(2, {x=39.5,y=35,z=-11.74}, {-90.0,0.0,0.0})
        end
    end
    --remove event die if no longer needed
    if isCKenabled() == false and m_EventDie ~= nil then
        destroyObject(m_EventDie)
    end

    --[[
        Spawn selected expansions
        A coroutine is prepared for each of the selected expansions they are each given a reference to the coroutine for the
        next expansion to be loaded. The first routine is started and will automatically trigger the next one once it is done loading.
    --]]
    local SpawnRoutines = {}
    --Cities & Knights
    if isCKenabled() then   table.insert(SpawnRoutines, spawnCKExpansion()) end
    --The Fishermen of Catan
    if m_bEnableFishermen then      table.insert(SpawnRoutines, spawnFishermenExpansion())  end
    --Welfare Variant
    if m_bEnableWelfare then      table.insert(SpawnRoutines, spawnWelfareExpansion())  end
    --The Rivers of Catan
    if m_CurScenario.bUseRivers then table.insert(SpawnRoutines, spawnRiversExpansion())    end
    --The Caravans
    if m_CurScenario.bUseCaravans then table.insert(SpawnRoutines, spawnCaravansExpansion())    end
    --Barbarian Attack
    if m_CurScenario.bUseBAttack then table.insert(SpawnRoutines, spawnBarbarianAttackExpansion())    end
    --Traders & Barbarians
    if m_CurScenario.bUseTraders then table.insert(SpawnRoutines, spawnTradersAndBarbariansExpansion())    end
    --Frenemies
    if m_iFrenemiesPlayers > 0 then table.insert(SpawnRoutines, spawnFrenemiesExpansion())  end
    --Oilsprings
    if m_bEnableOilsprings then table.insert(SpawnRoutines, spawnOilspringsExpansion()) end
    --Helpers of Catan
    if m_bEnableHelpers then        table.insert(SpawnRoutines, spawnHelpersExpansion())    end
    --Catan Event Cards
    if m_bEnableEventCards then     table.insert(SpawnRoutines, spawnEventCardsExpansion()) end

    --pass each routine the next routine to start when it finishes
    for i = 1, #SpawnRoutines do
        coroutine.resume(SpawnRoutines[i], SpawnRoutines[i+1])
    end
    --trigger the first spawn function to spawn all selected ones
    if #SpawnRoutines > 0 then
        coroutine.resume(SpawnRoutines[1])
    end
end

--Neighboring tile definition
function getNBRS() return NBRS end
NBRS = { \t[1] = {['NE'] = 67, ['E'] = 2, ['SE'] = 10, ['SW'] = 9, ['W'] = 97, ['NW'] = 66},
            [2] = {['NE'] = 68, ['E'] = 3, ['SE'] = 11, ['SW'] = 10, ['W'] = 1, ['NW'] = 67},
            [3] = {['NE'] = 69, ['E'] = 4, ['SE'] = 12, ['SW'] = 11, ['W'] = 2, ['NW'] = 68},
            [4] = {['NE'] = 70, ['E'] = 5, ['SE'] = 13, ['SW'] = 12, ['W'] = 3, ['NW'] = 69},
            [5] = {['NE'] = 71, ['E'] = 6, ['SE'] = 14, ['SW'] = 13, ['W'] = 4, ['NW'] = 70},
            [6] = {['NE'] = 72, ['E'] = 7, ['SE'] = 15, ['SW'] = 14, ['W'] = 5, ['NW'] = 71},
            [7] = {['NE'] = 73, ['E'] = 8, ['SE'] = 16, ['SW'] = 15, ['W'] = 6, ['NW'] = 72},
            [8] = {['NE'] = 74, ['E'] = 75, ['SE'] = 17, ['SW'] = 16, ['W'] = 7, ['NW'] = 73},
            [9] = {['NE'] = 1, ['E'] = 10, ['SE'] = 19, ['SW'] = 18, ['W'] = 96, ['NW'] = 97},
            [10] = {['NE'] = 2, ['E'] = 11, ['SE'] = 20, ['SW'] = 19, ['W'] = 9, ['NW'] = 1},
            [11] = {['NE'] = 3, ['E'] = 12, ['SE'] = 21, ['SW'] = 20, ['W'] = 10, ['NW'] = 2},
            [12] = {['NE'] = 4, ['E'] = 13, ['SE'] = 22, ['SW'] = 21, ['W'] = 11, ['NW'] = 3},
            [13] = {['NE'] = 5, ['E'] = 14, ['SE'] = 23, ['SW'] = 22, ['W'] = 12, ['NW'] = 4},
            [14] = {['NE'] = 6, ['E'] = 15, ['SE'] = 24, ['SW'] = 23, ['W'] = 13, ['NW'] = 5},
            [15] = {['NE'] = 7, ['E'] = 16, ['SE'] = 25, ['SW'] = 24, ['W'] = 14, ['NW'] = 6},
            [16] = {['NE'] = 8, ['E'] = 17, ['SE'] = 26, ['SW'] = 25, ['W'] = 15, ['NW'] = 7},
            [17] = {['NE'] = 75, ['E'] = 76, ['SE'] = 27, ['SW'] = 26, ['W'] = 16, ['NW'] = 8},
            [18] = {['NE'] = 9, ['E'] = 19, ['SE'] = 29, ['SW'] = 28, ['W'] = 95, ['NW'] = 96},
            [19] = {['NE'] = 10, ['E'] = 20, ['SE'] = 30, ['SW'] = 29, ['W'] = 18, ['NW'] = 9},
            [20] = {['NE'] = 11, ['E'] = 21, ['SE'] = 31, ['SW'] = 30, ['W'] = 19, ['NW'] = 10},
            [21] = {['NE'] = 12, ['E'] = 22, ['SE'] = 32, ['SW'] = 31, ['W'] = 20, ['NW'] = 11},
            [22] = {['NE'] = 13, ['E'] = 23, ['SE'] = 33, ['SW'] = 32, ['W'] = 21, ['NW'] = 12},
            [23] = {['NE'] = 14, ['E'] = 24, ['SE'] = 34, ['SW'] = 33, ['W'] = 22, ['NW'] = 13},
            [24] = {['NE'] = 15, ['E'] = 25, ['SE'] = 35, ['SW'] = 34, ['W'] = 23, ['NW'] = 14},
            [25] = {['NE'] = 16, ['E'] = 26, ['SE'] = 36, ['SW'] = 35, ['W'] = 24, ['NW'] = 15},
            [26] = {['NE'] = 17, ['E'] = 27, ['SE'] = 37, ['SW'] = 36, ['W'] = 25, ['NW'] = 16},
            [27] = {['NE'] = 76, ['E'] = 77, ['SE'] = 38, ['SW'] = 37, ['W'] = 26, ['NW'] = 17},
\t\t\t[28] = {['NE'] = 18, ['E'] = 29, ['SE'] = 39, ['SW'] = 93, ['W'] = 94, ['NW'] = 95},
            [29] = {['NE'] = 19, ['E'] = 30, ['SE'] = 40, ['SW'] = 39, ['W'] = 28, ['NW'] = 18},
            [30] = {['NE'] = 20, ['E'] = 31, ['SE'] = 41, ['SW'] = 40, ['W'] = 29, ['NW'] = 19},
            [31] = {['NE'] = 21, ['E'] = 32, ['SE'] = 42, ['SW'] = 41, ['W'] = 30, ['NW'] = 20},
            [32] = {['NE'] = 22, ['E'] = 33, ['SE'] = 43, ['SW'] = 42, ['W'] = 31, ['NW'] = 21},
            [33] = {['NE'] = 23, ['E'] = 34, ['SE'] = 44, ['SW'] = 43, ['W'] = 32, ['NW'] = 22},
            [34] = {['NE'] = 24, ['E'] = 35, ['SE'] = 45, ['SW'] = 44, ['W'] = 33, ['NW'] = 23},
            [35] = {['NE'] = 25, ['E'] = 36, ['SE'] = 46, ['SW'] = 45, ['W'] = 34, ['NW'] = 24},
            [36] = {['NE'] = 26, ['E'] = 37, ['SE'] = 47, ['SW'] = 46, ['W'] = 35, ['NW'] = 25},
            [37] = {['NE'] = 27, ['E'] = 38, ['SE'] = 48, ['SW'] = 47, ['W'] = 36, ['NW'] = 26},
            [38] = {['NE'] = 77, ['E'] = 78, ['SE'] = 79, ['SW'] = 48, ['W'] = 37, ['NW'] = 27},
            [39] = {['NE'] = 29, ['E'] = 40, ['SE'] = 49, ['SW'] = 92, ['W'] = 93, ['NW'] = 28},
            [40] = {['NE'] = 30, ['E'] = 41, ['SE'] = 50, ['SW'] = 49, ['W'] = 39, ['NW'] = 29},
            [41] = {['NE'] = 31, ['E'] = 42, ['SE'] = 51, ['SW'] = 50, ['W'] = 40, ['NW'] = 30},
            [42] = {['NE'] = 32, ['E'] = 43, ['SE'] = 52, ['SW'] = 51, ['W'] = 41, ['NW'] = 31},
            [43] = {['NE'] = 33, ['E'] = 44, ['SE'] = 53, ['SW'] = 52, ['W'] = 42, ['NW'] = 32},
            [44] = {['NE'] = 34, ['E'] = 45, ['SE'] = 54, ['SW'] = 53, ['W'] = 43, ['NW'] = 33},
            [45] = {['NE'] = 35, ['E'] = 46, ['SE'] = 55, ['SW'] = 54, ['W'] = 44, ['NW'] = 34},
            [46] = {['NE'] = 36, ['E'] = 47, ['SE'] = 56, ['SW'] = 55, ['W'] = 45, ['NW'] = 35},
            [47] = {['NE'] = 37, ['E'] = 48, ['SE'] = 57, ['SW'] = 56, ['W'] = 46, ['NW'] = 36},
            [48] = {['NE'] = 38, ['E'] = 79, ['SE'] = 80, ['SW'] = 57, ['W'] = 47, ['NW'] = 37},
\t\t\t[49] = {['NE'] = 40, ['E'] = 50, ['SE'] = 58, ['SW'] = 91, ['W'] = 92, ['NW'] = 39},
            [50] = {['NE'] = 41, ['E'] = 51, ['SE'] = 59, ['SW'] = 58, ['W'] = 49, ['NW'] = 40},
            [51] = {['NE'] = 42, ['E'] = 52, ['SE'] = 60, ['SW'] = 59, ['W'] = 50, ['NW'] = 41},
            [52] = {['NE'] = 43, ['E'] = 53, ['SE'] = 61, ['SW'] = 60, ['W'] = 51, ['NW'] = 42},
            [53] = {['NE'] = 44, ['E'] = 54, ['SE'] = 62, ['SW'] = 61, ['W'] = 52, ['NW'] = 43},
            [54] = {['NE'] = 45, ['E'] = 55, ['SE'] = 63, ['SW'] = 62, ['W'] = 53, ['NW'] = 44},
            [55] = {['NE'] = 46, ['E'] = 56, ['SE'] = 64, ['SW'] = 63, ['W'] = 54, ['NW'] = 45},
            [56] = {['NE'] = 47, ['E'] = 57, ['SE'] = 65, ['SW'] = 64, ['W'] = 55, ['NW'] = 46},
            [57] = {['NE'] = 48, ['E'] = 80, ['SE'] = 81, ['SW'] = 65, ['W'] = 56, ['NW'] = 47},
\t\t\t[58] = {['NE'] = 50, ['E'] = 59, ['SE'] = 89, ['SW'] = 90, ['W'] = 91, ['NW'] = 49},
            [59] = {['NE'] = 51, ['E'] = 60, ['SE'] = 88, ['SW'] = 89, ['W'] = 58, ['NW'] = 50},
            [60] = {['NE'] = 52, ['E'] = 61, ['SE'] = 87, ['SW'] = 88, ['W'] = 59, ['NW'] = 51},
            [61] = {['NE'] = 53, ['E'] = 62, ['SE'] = 86, ['SW'] = 87, ['W'] = 60, ['NW'] = 52},
            [62] = {['NE'] = 54, ['E'] = 63, ['SE'] = 85, ['SW'] = 86, ['W'] = 61, ['NW'] = 53},
            [63] = {['NE'] = 55, ['E'] = 64, ['SE'] = 84, ['SW'] = 85, ['W'] = 62, ['NW'] = 54},
            [64] = {['NE'] = 56, ['E'] = 65, ['SE'] = 83, ['SW'] = 84, ['W'] = 63, ['NW'] = 55},
            [65] = {['NE'] = 57, ['E'] = 81, ['SE'] = 82, ['SW'] = 83, ['W'] = 64, ['NW'] = 56},
\t\t\t[66] = {['E'] = 67, ['SE'] = 1, ['SW'] = 97},               [67] = {['E'] = 68, ['SE'] = 2, ['SW'] = 1, ['W'] = 66},
            [68] = {['E'] = 69, ['SE'] = 3, ['SW'] = 2, ['W'] = 67},    [69] = {['E'] = 70, ['SE'] = 4, ['SW'] = 3, ['W'] = 68},
            [70] = {['E'] = 71, ['SE'] = 5, ['SW'] = 4, ['W'] = 69},    [71] = {['E'] = 72, ['SE'] = 6, ['SW'] = 5, ['W'] = 70},
            [72] = {['E'] = 73, ['SE'] = 7, ['SW'] = 6, ['W'] = 71},    [73] = {['E'] = 74, ['SE'] = 8, ['SW'] = 7, ['W'] = 72},
            [74] = {['E'] = 98, ['SE'] = 75, ['SW'] = 8, ['W'] = 73},   [75] = {['NE'] = 98, ['E'] = 99, ['SE'] = 76, ['SW'] = 17, ['W'] = 8, ['NW'] = 74},
            [76] = {['NE'] = 99, ['E'] = 100, ['SE'] = 77, ['SW'] = 27, ['W'] = 17, ['NW'] = 75},
            [77] = {['NE'] = 100, ['E'] = 101, ['SE'] = 78, ['SW'] = 38, ['W'] = 27, ['NW'] = 76},
            [78] = {['NE'] = 101, ['E'] = 102, ['SE'] = 103, ['SW'] = 79, ['W'] = 38, ['NW'] = 77},
            [79] = {['NE'] = 78, ['E'] = 103, ['SE'] = 104, ['SW'] = 80, ['W'] = 48, ['NW'] = 38},
            [80] = {['NE'] = 79, ['E'] = 104, ['SE'] = 105, ['SW'] = 81, ['W'] = 57, ['NW'] = 48},
            [81] = {['NE'] = 80, ['E'] = 105, ['SE'] = 106, ['SW'] = 82, ['W'] = 65, ['NW'] = 57},
            [82] = {['NE'] = 81, ['E'] = 106, ['W'] = 83, ['NW'] = 65},
            [83] = {['NE'] = 65, ['E'] = 82, ['W'] = 84, ['NW'] = 64},      [84] = {['NE'] = 64, ['E'] = 83, ['W'] = 85, ['NW'] = 63},
            [85] = {['NE'] = 63, ['E'] = 84, ['W'] = 86, ['NW'] = 62},      [86] = {['NE'] = 62, ['E'] = 85, ['W'] = 87, ['NW'] = 61},
            [87] = {['NE'] = 61, ['E'] = 86, ['W'] = 88, ['NW'] = 60},      [88] = {['NE'] = 60, ['E'] = 87, ['W'] = 89, ['NW'] = 59},
            [89] = {['NE'] = 59, ['E'] = 88, ['W'] = 90, ['NW'] = 58},      [90] = {['NE'] = 58, ['E'] = 89, ['NW'] = 91},
            [91] = {['NE'] = 49, ['E'] = 58, ['SE'] = 90, ['NW'] = 92},     [92] = {['NE'] = 39, ['E'] = 49, ['SE'] = 91, ['NW'] = 93},
            [93] = {['NE'] = 29, ['E'] = 39, ['SE'] = 92, ['NW'] = 94},     [94] = {['NE'] = 95, ['E'] = 28, ['SE'] = 93},
            [95] = {['NE'] = 96, ['E'] = 18, ['SE'] = 28, ['SW'] = 94},     [96] = {['NE'] = 97, ['E'] = 9, ['SE'] = 18, ['SW'] = 95},
            [97] = {['NE'] = 66, ['E'] = 1, ['SE'] = 9, ['SW'] = 96},       [98] = {['SE'] = 99, ['SW'] = 75, ['W'] = 74},
            [99] = {['SE'] = 100, ['SW'] = 76, ['W'] = 75, ['NW'] = 98},    [100] = {['SE'] = 101, ['SW'] = 77, ['W'] = 76, ['NW'] = 99},
            [101] = {['SE'] = 102, ['SW'] = 78, ['W'] = 77, ['NW'] = 100},  [102] = {['SW'] = 103, ['W'] = 78, ['NW'] = 101},
            [103] = {['NE'] = 102, ['SW'] = 104, ['W'] = 79, ['NW'] = 78},  [104] = {['NE'] = 103, ['SW'] = 105, ['W'] = 80, ['NW'] = 79},
            [105] = {['NE'] = 104, ['SW'] = 106, ['W'] = 81, ['NW'] = 80},  [106] = {['NE'] = 105, ['W'] = 82, ['NW'] = 81},
\t     }
