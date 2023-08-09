// Vanilla JS

var gameOverSound = document.getElementById('gameOverSound');
var backgroundMusic = document.getElementById('backgroundMusic');
var shootSound = document.getElementById('shootSound'); 

var startButton = document.getElementById("startButton");
window.addEventListener("DOMContentLoaded", function() {
    var startButton = document.getElementById('startButton');
    startButton.addEventListener('click', startGame);
});

function startGame() {
    var landingPage = document.getElementById('landingPage');
    landingPage.style.display = 'none';
    var canvas = document.getElementById('canvas');
    canvas.style.display = 'block';

    game();

    backgroundMusic.play();
}

const sprite = new Image();
const spriteExplosion = new Image();
sprite.src = '../img/spriteElement.png';

window.onload = function() {
    spriteExplosion.src = '../img/explosion.png';
};

//Game
function game() {

    var isShooting = false;

    //Canvas
    var canvas = document.getElementById('canvas'),
        ctx    = canvas.getContext('2d'),
        cH     = ctx.canvas.height = window.innerHeight,
        cW     = ctx.canvas.width  = window.innerWidth ;

    //Game
    var bullets    = [],
        viruses    = [],
        explosions = [],
        destroyed  = 0,
        record     = 0,
        count      = 0,
        playing    = false,
        gameOver   = false,
        _planet    = {deg: 0};
        lives      = 10;

    //Player
    var player = {
        posX   : -35,
        posY   : -(100+82),
        width  : 70,
        height : 79,
        deg    : 0
    };

    canvas.addEventListener('click', action);
    canvas.addEventListener('mousemove', action);
    window.addEventListener("resize", update);

    function update() {
        cH = ctx.canvas.height = window.innerHeight;
        cW = ctx.canvas.width  = window.innerWidth ;
    }

    function move(e) {
        player.deg = Math.atan2(e.offsetX - (cW/2), -(e.offsetY - (cH/2)));
    }

    function action(e) {
        e.preventDefault();
        if(playing) {
            var bullet = {
                x: -8,
                y: -179,
                sizeX : 2,
                sizeY : 10,
                realX : e.offsetX,
                realY : e.offsetY,
                dirX  : e.offsetX,
                dirY  : e.offsetY,
                deg   : Math.atan2(e.offsetX - (cW/2), -(e.offsetY - (cH/2))),
                destroyed: false
            };

            bullets.push(bullet);

             // Putar suara tembakan
             shootSound.currentTime = 0; 
             shootSound.play();
        } else {
            var dist;
            if(gameOver) {
                dist = Math.sqrt(((e.offsetX - cW/2) * (e.offsetX - cW/2)) + ((e.offsetY - (cH/2 + 45 + 22)) * (e.offsetY - (cH/2+ 45 + 22))));
                if (dist < 27) {
                    if(e.type == 'click') {
                        gameOver   = false;
                        count      = 0;
                        bullets    = [];
                        viruses  = [];
                        explosions = [];
                        destroyed  = 0;
                        player.deg = 0;
                        canvas.removeEventListener('contextmenu', action);
                        canvas.removeEventListener('mousemove', move);
                        canvas.style.cursor = "default";
                    } else {
                        canvas.style.cursor = "pointer";
                    }
                } else {
                    canvas.style.cursor = "default";
                }
            } else {
                dist = Math.sqrt(((e.offsetX - cW/2) * (e.offsetX - cW/2)) + ((e.offsetY - cH/2) * (e.offsetY - cH/2)));

                if (dist < 27) {
                    if(e.type == 'click') {
                        playing = true;
                        canvas.removeEventListener("mousemove", action);
                        canvas.addEventListener('contextmenu', action);
                        canvas.addEventListener('mousemove', move);
                        canvas.setAttribute("class", "playing");
                        canvas.style.cursor = "default";
                    } else {
                        canvas.style.cursor = "pointer";
                    }
                } else {
                    canvas.style.cursor = "default";
                }
            }
        }
    }

    function fire() {
        var distance;

        for(var i = 0; i < bullets.length; i++) {
            if(!bullets[i].destroyed) {
                ctx.save();
                ctx.translate(cW/2,cH/2);
                ctx.rotate(bullets[i].deg);

                ctx.drawImage(
                    sprite,
                    211,
                    100,
                    50,
                    75,
                    bullets[i].x,
                    bullets[i].y -= 23,
                    19,
                    30
                );
                  // Cek apakah ada tembakan aktif
                  var activeBullets = bullets.filter(bullet => !bullet.destroyed);
                  if (activeBullets.length === 0) {
                      isShooting = false;
                      shootSound.pause();
                  }

                ctx.restore();

                //Real coords
                bullets[i].realX = (0) - (bullets[i].y + 10) * Math.sin(bullets[i].deg);
                bullets[i].realY = (0) + (bullets[i].y + 10) * Math.cos(bullets[i].deg);

                bullets[i].realX += cW/2;
                bullets[i].realY += cH/2;

                //Collision
                for(var j = 0; j < viruses.length; j++) {
                    if(!viruses[j].destroyed) {
                        distance = Math.sqrt(Math.pow(
                            viruses[j].realX - bullets[i].realX, 2) +
                            Math.pow(viruses[j].realY - bullets[i].realY, 2)
                        );

                        if (distance < (((viruses[j].width/viruses[j].size) / 2) - 4) + ((19 / 2) - 4)) {
                            destroyed += 1;
                            viruses[j].destroyed = true;
                            bullets[i].destroyed   = true;
                            explosions.push(viruses[j]);
                        }
                    }
                }
            }
        }
    }

    function planet() {
        ctx.save();
        ctx.fillStyle   = 'white';
        ctx.shadowBlur    = 100;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor   = "#999";

        ctx.arc(
            (cW/2),
            (cH/2),
            100,
            0,
            Math.PI * 2
        );
        ctx.fill();

        //Planet rotation
        ctx.translate(cW/2,cH/2);
        ctx.rotate((_planet.deg += 0.1) * (Math.PI / 180));
        ctx.drawImage(sprite, 0, 0, 200, 200, -100, -100, 200,200);
        ctx.restore();
    }

    function _player() {

        ctx.save();
        ctx.translate(cW/2,cH/2);

        ctx.rotate(player.deg);
        ctx.drawImage(
            sprite,
            200,
            0,
            player.width,
            player.height,
            player.posX,
            player.posY,
            player.width,
            player.height
        );

        ctx.restore();

        if(bullets.length - destroyed && playing) {
            fire();
        }
    }

    function newvirus() {

        var type = random(1,4),
            coordsX,
            coordsY;

        switch(type){
            case 1:
                coordsX = random(0, cW);
                coordsY = 0 - 150;
                break;
            case 2:
                coordsX = cW + 150;
                coordsY = random(0, cH);
                break;
            case 3:
                coordsX = random(0, cW);
                coordsY = cH + 150;
                break;
            case 4:
                coordsX = 0 - 150;
                coordsY = random(0, cH);
                break;
        }

        var virus = {
            x: 278,
            y: 0,
            state: 0,
            stateX: 0,
            width: 134,
            height: 123,
            realX: coordsX,
            realY: coordsY,
            moveY: 0,
            coordsX: coordsX,
            coordsY: coordsY,
            size: random(1, 3),
            deg: Math.atan2(coordsX  - (cW/2), -(coordsY - (cH/2))),
            destroyed: false
        };
        viruses.push(virus);
    }

    function _viruses() {
        var distance;
    
        for(var i = 0; i < viruses.length; i++) {
            if (!viruses[i].destroyed) {
                ctx.save();
                ctx.translate(viruses[i].coordsX, viruses[i].coordsY);
                ctx.rotate(viruses[i].deg);
    
                ctx.drawImage(
                    sprite,
                    viruses[i].x,
                    viruses[i].y,
                    viruses[i].width,
                    viruses[i].height,
                    -(viruses[i].width / viruses[i].size) / 2,
                    viruses[i].moveY += 0.4 / viruses[i].size, 
                    viruses[i].width / viruses[i].size,
                    viruses[i].height / viruses[i].size
                );
    
                ctx.restore();
    
                //Real Coords
                viruses[i].realX = (0) - (viruses[i].moveY + ((viruses[i].height / viruses[i].size)/2)) * Math.sin(viruses[i].deg);
                viruses[i].realY = (0) + (viruses[i].moveY + ((viruses[i].height / viruses[i].size)/2)) * Math.cos(viruses[i].deg);
    
                viruses[i].realX += viruses[i].coordsX;
                viruses[i].realY += viruses[i].coordsY;
    
                 // Game over jika virus menabrak lingkaran
                distance = Math.sqrt(Math.pow(viruses[i].realX - cW / 2, 2) + Math.pow(viruses[i].realY - cH / 2, 2));
                if (distance < (((viruses[i].width / viruses[i].size) / 2) - 4) + 100) {
                lives--; 
                if (lives <= 0) {
                    gameOver = true;
                    playing = false;
                    canvas.addEventListener('mousemove', action);
                }
                viruses.splice(i, 1); 
                i--; 
                }
            } else if(!viruses[i].extinct) {
                explosion(viruses[i]);
                viruses[i].destroyed = true;
            } else {
                viruses.splice(i, 1);
                i--; 
            }
        }
    
        if(viruses.length - destroyed < 10 + (Math.floor(destroyed/6))) {
            newvirus();
        }
    }
    

    function explosion(virus) {
        ctx.save();
        ctx.translate(virus.realX, virus.realY);
        ctx.rotate(virus.deg);

        var spriteY,
            spriteX = 256;
        if(virus.state == 0) {
            spriteY = 0;
            spriteX = 0;
        } else if (virus.state < 8) {
            spriteY = 0;
        } else if(virus.state < 16) {
            spriteY = 256;
        } else if(virus.state < 24) {
            spriteY = 512;
        } else {
            spriteY = 768;
        }

        if(virus.state == 8 || virus.state == 16 || virus.state == 24) {
            virus.stateX = 0;
        }

        ctx.drawImage(
            spriteExplosion,
            virus.stateX += spriteX,
            spriteY,
            256,
            256,
            - (virus.width / virus.size)/2,
            -(virus.height / virus.size)/2,
            virus.width / virus.size,
            virus.height / virus.size
        );
        virus.state += 1;

        if(virus.state == 31) {
            virus.extinct = true;
        }

        ctx.restore();
    }

    function start() {
        if(!gameOver) {
            //Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();

            //Planet
            planet();

            //Player
            _player();

            if(playing) {
                _viruses();
                backgroundMusic.play();
                ctx.font = "20px Verdana";
                ctx.fillStyle = "white";
                ctx.textBaseline = 'middle';
                ctx.textAlign = "left";
                ctx.fillText('Nyawa              : ' + lives, 20, 60); 
                ctx.fillText('Score tertinggi  : '+record+'', 20, 30);
    
                ctx.font = "40px Verdana";
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';
                ctx.strokeText(''+destroyed+'', cW/2,cH/2);
                ctx.fillText(''+destroyed+'', cW/2,cH/2);

            } else {
                ctx.drawImage(sprite, 428, 12, 70, 70, cW/2 - 35, cH/2 - 35, 70,70);
            }
        } else if(count < 1) {
            count = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.rect(0,0, cW,cH);
            ctx.fill();

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, cW, cH);

            ctx.font = "60px Verdana";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER",cW/2,cH/2 - 55);

            ctx.font = "20px Verdana";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Total Virus : "+ destroyed, cW/2,cH/2 + 140);

            record = destroyed > record ? destroyed : record;

            ctx.font = "20px Verdana";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("SCORE TERTINGGI : "+ record, cW/2,cH/2 + 185);

            ctx.drawImage(sprite, 500, 18, 70, 70, cW/2 - 35, cH/2 + 40, 70,70);
            shootSound.pause();
            canvas.removeAttribute('class');

            // Tambahkan button kembali
            ctx.fillStyle = "#C72329";
            ctx.fillRect(cW/2 - 100, cH/2 + 240, 200, 40);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Kembali", cW/2, cH/2 + 260);
            
            canvas.addEventListener("click", checkButton);

            function checkButton(e) {
                var mouseX = e.clientX; 
                var mouseY = e.clientY;
                if (mouseX >= cW/2 - 100 && mouseX <= cW/2 + 100 && mouseY >= cH/2 + 240 && mouseY <= cH/2 + 280) {
                    window.location.href = "index.html"; 
                }
            }
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            gameOverSound.play();

            lives = 10;
             // kembali permainan
             var dist = Math.sqrt(((e.offsetX - cW / 2) * (e.offsetX - cW / 2)) + ((e.offsetY - cH / 2) * (e.offsetY - cH / 2)));
             if (dist < 27) {
             if (e.type == 'click') {
                playing = true;
                canvas.removeEventListener("mousemove", action);
                canvas.addEventListener('contextmenu', action);
                canvas.addEventListener('mousemove', move);
                canvas.setAttribute("class", "playing");
                canvas.style.cursor = "default";
             } else {
                canvas.style.cursor = "pointer";
            }
        } else {
            canvas.style.cursor = "default";
        }
    }
}

    function init() {
        window.requestAnimationFrame(init);
        start();
    }

    init();

    //Utils
    function random(from, to) {
        return Math.floor(Math.random() * (to - from + 1)) + from;
    }

    if(~window.location.href.indexOf('full')) {
        var full = document.getElementsByTagName('a');
        full[0].setAttribute('style', 'display: none');
    }
}

// Fungsi untuk menampilkan card cara bermain
function showHowToPlay() {
    var howToPlayCard = document.getElementById("howToPlayCard");
    howToPlayCard.style.display = "block";
}

function hideHowToPlay() {
    var howToPlayCard = document.getElementById("howToPlayCard");
    howToPlayCard.style.display = "none";
}

// Menampilkan kartu "Score Tertinggi"
function showHighScore() {
    var highScoreCard = document.getElementById('highScoreCard');
    highScoreCard.style.display = 'block';

    var highScoreValue = document.getElementById('highScoreValue');
    highScoreValue.textContent = 'SCORE TERTINGGI: ' + record;
}

function hideHighScore() {
    var highScoreCard = document.getElementById('highScoreCard');
    highScoreCard.style.display = 'none';
}

