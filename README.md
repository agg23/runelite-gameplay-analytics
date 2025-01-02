# Runelite Gameplay Analytics

Analytics tools for Runelite.

Intended to gather all user related data for your Runescape characters and provide actionable metrics from that data. Track XP gain, kills, loot, locations, and more.

![XP Display](../assets/xpdisplay.png?raw=true)

## Implementation

* Stores data into local SQLite DB (perhaps send to central service at some point)
* Serves external UI from local webserver
* Client receives live updates via websockets as gameplay commences