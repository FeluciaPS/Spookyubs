.pl files
========================================================================
.pl files store player data in the following format:

```
|player ID
|player name
|branch|weapon|class
|false|false // Passive and Active item
|xp |total xp // XP
|gold // Gold
|gem1,amount,gem2,amount2 // Gems
|item1,item2 // Items (names)
|id1,id2 // Items (ids)
|sorcerer,1,heavy,1,fighter,1,archer,1,regal,1,dueler,1,clairvoyant,1,bard,1,cryokinetic,1,guardian,1,pyrokinetic,1,rifter,1,skirmisher,1 // levels (not hardcoded I promise)
|0 // apphost: 0 for no and 1 for yes```