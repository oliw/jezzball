var snakeGame = (function() {
    var Width = 500;
    var Height = 500;
    var canvas = document.getElementById("game");
    canvas.width = Width;
    canvas.height = Height;
    canvas.setAttribute('tabindex', 1);
    var ctx = canvas.getContext("2d");
    var FPS = 1000 * 60;
    
    var NCellX = 30;
    var NCellY = 30;
    var CellWidth = Width / NCellX;
    var CellHeight = Height / NCellY;

    var BG = {
        Color: '#333',
        Paint: function() {
            ctx.fillStyle = this.Color;
            ctx.fillRect(0, 0, Width, Height);
        }
    };

    var Player = {
        Score: 0,
        Color: '#999',
        Paint: function() {
            ctx.beginPath();
            ctx.fillStyle = this.Color;
            ctx.font = "normal 10pt Calibri";
            ctx.textAlign = "left";
            ctx.fillText("score: " + Player.Score, 10, 10);
        }
    };

    var Snake = {
        RearSnakeBodyPart: null,
        FrontSnakeBodyPart: null,
        Color: '#999',
        VelX: 0,
        VelY: 0,
        IsCollision: function() {
            var SnakeBodyPart = this.RearSnakeBodyPart;
            while (SnakeBodyPart != this.FrontSnakeBodyPart) {
                if (SnakeBodyPart.location.x == this.FrontSnakeBodyPart.location.x 
                    && SnakeBodyPart.location.y == this.FrontSnakeBodyPart.location.y ) {
                    console.log('Collision');
                    return true;
                }
                SnakeBodyPart = SnakeBodyPart.next;
            }
            return false;
        },
        IsHere: function(x,y) {
            var SnakeBodyPart = this.RearSnakeBodyPart;
            while (SnakeBodyPart != this.FrontSnakeBodyPart) {
                if (SnakeBodyPart.location.x <= x 
                    &&  x < SnakeBodyPart.location.x+CellWidth
                    && SnakeBodyPart.location.y <= y
                    && y < SnakeBodyPart.location.y+CellHeight) {
                    return true;
                }
                SnakeBodyPart = SnakeBodyPart.next;
            }
            return false;
        },
        Grow: function() {
            var SnakeBodyPart = this.RearSnakeBodyPart;
            this.Update();
            SnakeBodyPart.next = this.RearSnakeBodyPart;
            this.RearSnakeBodyPart = SnakeBodyPart;
        },
        Paint: function() {
            ctx.beginPath();
            ctx.fillStyle = this.Color;
            var SnakeBodyPart = this.RearSnakeBodyPart;
            while (SnakeBodyPart != null) {
                ctx.rect(SnakeBodyPart.location.x*CellWidth, SnakeBodyPart.location.y*CellHeight, CellWidth, CellHeight);
                ctx.fill();
                SnakeBodyPart = SnakeBodyPart.next;
            }
            this.Update();
        },
        Update: function() {
            var SnakeBodyPart = {
                location: {
                    x: ((this.FrontSnakeBodyPart.location.x + this.VelX) % NCellX + NCellX) % NCellX,
                    y: ((this.FrontSnakeBodyPart.location.y + this.VelY) % NCellY + NCellY) % NCellY,
                },
                next:null
            };
            this.FrontSnakeBodyPart.next = SnakeBodyPart;
            this.FrontSnakeBodyPart = SnakeBodyPart;
            this.RearSnakeBodyPart = this.RearSnakeBodyPart.next;
        },
        Reset: function() {
            var SnakeBodyPart = {
                location: {
                    x: Math.floor(NCellX/2),
                    y: Math.floor(NCellY/2)
                },
                next: null
            };
            this.RearSnakeBodyPart = SnakeBodyPart;
            this.FrontSnakeBodyPart = SnakeBodyPart;
            this.VelX = 1;
            this.VelY = 0;
        }
    };

    var Food = {
        X: 0,
        Y: 0,
        Color: '#FFA500',
        IsCollision: function() {
            var result = (this.X == Math.floor(Snake.FrontSnakeBodyPart.location.x)
                && this.Y == Math.floor(Snake.FrontSnakeBodyPart.location.y));
            return result;
        },
        Paint: function() {
            ctx.beginPath();
            ctx.fillStyle=this.Color;
            ctx.rect(this.X*CellWidth, this.Y*CellHeight, CellWidth, CellHeight);
            ctx.fill();
        },
        Reset: function() {
            this.X = Math.floor(Math.random()*((NCellX-1)-0+1)+0);
            this.Y = Math.floor(Math.random()*((NCellY-1)-0+1)+0);
            while(Snake.IsHere(this.X,this.Y)) {
                this.X = Math.floor(Math.random()*((NCellX-1)-0+1)+0);
                this.Y = Math.floor(Math.random()*((NCellY-1)-0+1)+0);
            }           
        }
    };

    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, FPS);
        };
    })();
    window.cancelRequestAnimFrame = (function() {
        return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
    })();

    function Paint() {
        ctx.beginPath();
        BG.Paint();
        Player.Paint();
        Snake.Paint();
        Food.Paint();
    };

    function KeyPressed(e) {
        e = e || window.event;
        switch (e.keyCode) {
            case 87: if (Snake.VelY == 0) {Snake.VelX = 0; Snake.VelY = -1;} break;
            case 68: if (Snake.VelX == 0) {Snake.VelX = 1; Snake.VelY = 0;} break;
            case 83: if (Snake.VelY == 0) {Snake.VelX = 0; Snake.VelY = 1;} break;
            case 65: if (Snake.VelX == 0) {Snake.VelX = -1; Snake.VelY = 0;} break;
        }
    };

    canvas.addEventListener("keydown", KeyPressed, true);

    function Loop() {
        init = requestAnimFrame(Loop);
        Paint();
        if (Snake.IsCollision()) {
             Player.Score = 0;
             Snake.Reset();
        } else if (Food.IsCollision()) {
            Food.Reset();
            Snake.Grow();
            Player.Score++;
        }
    };

    function GameOver(win) {
        cancelRequestAnimFrame(init);
        BG.Paint();
        ctx.fillStyle = "#999";
        ctx.font = "bold 40px Calibri";
        ctx.textAlign = "center";
        ctx.fillText((win ? "YOU WON!" : "GAME OVER"), Width / 2, Height / 2);
        ctx.font = "normal 16px Calibri";
        ctx.fillText("refresh to replay", Width / 2, Height / 2 + 20);
    };
    return {
        NewGame: function() {
            Snake.Reset();
            Food.Reset();
            Player.Score = 0;
            Loop();
        }
    };
})();
snakeGame.NewGame();