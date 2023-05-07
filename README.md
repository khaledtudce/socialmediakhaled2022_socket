# socialmediakhaled2022_socket

Socket is for making realtime chatting option. This project is a part of project of SocialMediaKhaled20222 and here are the instruction of github CI/CD pipeline and how to configure automatically deploy this socket part of the app to AWS EC2 instance using Ubuntu. The main idea is that the socket part is pulled from backend using git everytime there is any change happened and deployed to the aws instance. 

dev.yml file
```sh
name: master Socket

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - uses: actions/checkout@v2
      - name: Use node js
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      - name: npm install and build
        run: |
          npm install
          npm run build

        env:
          CI: true

  deploy:
    needs: [build]
    runs-on: ubuntu-latest

    steps:
      - name: SSH Deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOSTMASTER }}
          username: ${{ secrets.USERMASTER }}
          key: ${{ secrets.KEYMASTER }}
          port: ${{ secrets.PORTMASTER }}
          script: |
            curl -o-   https://raw.githubusercontent.com/creationix/nvm/v0.39.1/install.sh | bash
            . ~/.nvm/nvm.sh

             nvm install 18
             npm install -g pm2
             cd /home/ubuntu/
             mkdir -p deploy/socket
             cd deploy/socket
             git reset --hard HEAD
             git pull origin master --rebase
             npm install
             npm run build
             pm2 restart socket_messgage
```

## Socket CI/CD Configuration instructions

### 1. Need following libraries to install in the backend to deploy node js application: html-webpack-plugin, webpack, webpack-node-externals, webpack-cli
```sh
npm i html-webpack-plugin
npm i webpack
npm i webpack-node-externals
npm i webpack-cli
```

### 2. Create an aws instance using ubuntu and update ubuntu
```sh
sudo apt-get update
```

### 3. Open port 8900 under Security of AWS instance, protocol: TCP. Clicking on Security Groups will open a window where it is possible to edit inbound rules

### 4. Go to the security folder 
```sh
cd .ssh
```

### 5. Generate key using ssh-keygen
```sh
ssh-keygen -t ed25519 -a 200 -C "khaledreza@gmail.com" 
```

### 6. Copy this private key and put it to the Github Action Secrets for KEYDEV
```sh
cat id_ed25519
```

### 7. Provide rest of the github Action secrets, HOSTDEV=public ip address of the aws instance, USERDEV=ubuntu (default), PORTDEV=22 (default)

### 8. Copy id_ed25519.pub key to the authorized_keys, so that github's ssh request can be validated using this public key. Otherwise there will be handshake failure because key validation failure
```sh
cat id_ed25519.pub
sudo nano authorized_keys
```
Save it with Cntl + x, then press y and then press enter. When the build is run again, it should be able to connect with aws securely. 

### 9. To pick nvm package manager,
```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.1/install.sh | bash
~/.nvm/nvm.sh
nvm -v # To see the nvm version
npm -v # To see npm version
```

### 10. For only one time, install project manager pm2, 
```sh
nvm install 18 # probably was already installed from package manager installer
npm install -g pm2  
```

### 11. For only one time make the backend directory and initialize the git repository here, so that from the CI/CD, the updated code can be pulled easily. 
```sh
mkdir -p deploy/socket 
cd deploy/socket
git init # initialize repository
git remote add origin khaledtudce/socialmediakhaled2022_socket.git # add remote repository origin
git remote set-url origin https://github.com/khaledtudce/socialmediakhaled2022_socket.git # give access right
```

### 12. Start pm2 for the first time only from the folder where index.js and package.json are
```sh
pm2 start npm --name socket_messgage -- run start:prod # start process (name it socket_messgage) from current directory start:prod from package.json
```

### 13. Make sure that you have configured the starting script of package.json of backend server using following, so that the CI/CD can pick the backend application to run from current folder
```sh
"scripts": {
    "build": "webpack --mode development",
    "start": "nodemon index.js",
    "start:prod": "node dist/server.js"
  }
```

### 14. The socket is supposed to be running and can be seen under server public address i.e. 
```sh
http://54.146.201.83:8900/
```

### 15. As our client and server are in different aws instance, we had cors from socket to avoid cors header problem. It did not work and unfortunately I could not test it enough.
```sh
# index.js file
const io = require("socket.io")(8900, { 
  cors: { origin: "*" }, //allowed all user ip to access it for now
});
```

### 16. Some useful linux command for general use,

```sh
pm2 start npm --name api -- run start:prod # Using project manager, run process from the current folder described in start:prod and name it api
pm2 logs  # show live server logs
pm2 list # List all service running in pm2
pm2 stop api # stop process named api
pm2 delete api # kill process named api

cd # will bring the location to initial place of aws
Cntl + Delete # will delete faster
cp -a /home/ubuntu/deploy/socket/socialmediakhaled2022_socket/. /home/ubuntu/deploy/socket/ # Copy all files of a folder to another file
rm -R socialmediakhaled2022_socket # Remove File with folder 
pwd # show the path of current directory
Cntl + shift + p  # paste copied item
```
