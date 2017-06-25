# codenames-server

Setup:
- Install the required packages for the bot, server and recognizer. For Ubuntu, this is:
```bash
sudo add-apt-repository ppa:orangain/opencv; sudo apt update # Or however you get opencv3
sudo apt install tesseract-ocr libtesseract-dev libleptonica-dev python3-opencv
sudo pip3 install scipy tesserocr flask
```
- Clone https://github.com/Gullesnuffs/Codenames into a subdirectory `bot` (or symlink it)
- Run `g++ -Ofast -march=native -std=c++11 codenames.cpp -o codenames` in that directory
- Clone https://github.com/Gullesnuffs/codenames-board-recognizer/ into a subdirectory `recognizer` (or symlink it)
- Run `python3 server.py`
