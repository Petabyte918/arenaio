const utils = require('./utilsS.js');
const normalizeVector = utils.normalizeVector;
const distVector = utils.distVector;
const subVector = utils.subVector;
const magVector = utils.magVector;
const multVector = utils.multVector;

class GameObject {
    constructor() {
        this.id = 0; //unique identifier
        this.pos = [0, 0]; //position on map
        this.radius = 40; //player radius
    }
}

class Mobile extends GameObject {
    constructor() {
        super();
        this.dir = [0, 0]; //move direction
        this.speed = 400; //move speed
    }

    move(deltaTime) {
        this.pos[0] += this.dir[0] * this.speed * deltaTime;
        this.pos[1] += this.dir[1] * this.speed * deltaTime;
    }

    fixDir() {
        this.dir = normalizeVector(this.dir);
    }
}

class Player extends Mobile {
    constructor() {
        super();
        this.color = [255, 0, 0]; //player color
        this.nickname = 'Player'; //player display name
        this.latency = 0; //player latency
    }
}

class Game {
    constructor() {
        this.mapWidth = 1500;
        this.mapHeight = 1500;
        this.players = [];
        this.projectiles = [];
    }

    checkColisions() {
        //related to players
        for (let i = 0; i < this.players.length; i++) {
            let plr = this.players[i];
            //checking colision between players and map extremes
            if (plr.pos[0] - plr.radius < 0) {
                plr.pos[0] = plr.radius;
            } else if (plr.pos[0] + plr.radius > this.mapWidth) {
                plr.pos[0] = this.mapWidth - plr.radius;
            }
            if (plr.pos[1] - plr.radius < 0) {
                plr.pos[1] = plr.radius;
            } else if (plr.pos[1] + plr.radius > this.mapHeight) {
                plr.pos[1] = this.mapHeight - plr.radius;
            }

            //checking colision between players (maybe keep this only in the server)
            for (let j = 0; j < this.players.length; j++) {
                let plr2 = this.players[j];
                if (i != j) {
                    let minDist = plr.radius + plr2.radius;
                    if (distVector(plr.pos, plr2.pos) < minDist) {
                        let colisionDir = subVector(plr2.pos, plr.pos);
                        let colisionMag = magVector(colisionDir) - minDist;
                        colisionDir = normalizeVector(colisionDir);
                        plr.pos = subVector(plr.pos, multVector(colisionDir, -colisionMag * (plr2.radius / minDist)));
                        plr2.pos = subVector(plr2.pos, multVector(colisionDir, colisionMag * (plr.radius / minDist)));
                    }
                }
            }

        }
    }

    update(deltaTime) {
        for (let i = 0; i < this.players.length; i++) {
            let plr = this.players[i];
            plr.move(deltaTime);
        }
        for (let i = 0; i < this.projectiles.length; i++) {
            let proj = this.projectiles[i];
            proj.move(deltaTime);
        }
        this.checkColisions();
    }

    updatePlayer(player, data) {
        for (let prop in player) {
            if ("undefined" != typeof (data[prop])) {
                player[prop] = data[prop];
                if (prop == 'dir') {
                    player.fixDir();
                }
            }
        }
    }

    removePlayer(id){
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id == id) {
                this.players.splice(i, 1);
                break;
            }
        }
    }

    updateProjectile(proj, data) {
        for (let prop in proj) {
            if ("undefined" != typeof (data[prop])) {
                proj[prop] = data[prop];
                if (prop == 'dir') {
                    proj.fixDir();
                }
            }
        }
    }

    removeProjectile(id){
        for (let i = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i].id == id) {
                this.projectiles.splice(i, 1);
                break;
            }
        }
    }
}

class Projectile extends Mobile {
    constructor(){
        super();
        this.damage = 0;
        this.color = [0, 0, 0];
    }
}

module.exports = {
    Player,
    Game,
    Projectile
}