# codenames-server

Setup:
- Clone https://github.com/Gullesnuffs/Codenames into a subdirectory `bot` (or symlink it)
- Run `g++ -Ofast -march=native -std=c++11 codenames.cpp -o codenames` in that directory
- Clone https://github.com/Gullesnuffs/codenames-board-recognizer/ into a subdirectory `recognizer` (or symlink it)
- Run `python3 server.py`
