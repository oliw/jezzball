var Game = (function() {
    var Width = 500;
    var Height = 500;
    var canvas = document.getElementById("game");
    canvas.width = Width;
    canvas.height = Height;
    canvas.setAttribute('tabindex', 1);
    var ctx = canvas.getContext("2d");
    var fps = 20;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;
    var FPS = 1000 * 60;

    var Balls = [];


    var BG = {
        Color: '#333',
        Paint: function() {
            ctx.fillStyle = this.Color;
            ctx.fillRect(0, 0, Width, Height);
        }
    };

    var Player = {
        Level: 0,
        Paint: function() {
            ctx.beginPath();
            ctx.fillStyle = '#999';
            ctx.font = "normal 10pt Calibri";
            ctx.fillText("score: " + this.Score+"   highest: "+ this.HighScore, 10, 15);
        },
        Reset: function() {
            this.Level++;
        }
    };

    function Ball() {
        this.X = 0;
        this.Y = 0;
        this.VelX = 0;
        this.VelY = 0;

        this.Color ='#FF0000';
        this.Radius = 5;

        this.Paint = function() {
            ctx.beginPath();
            ctx.fillStyle = this.Color;
            ctx.arc(this.X, this.Y, this.Radius, 0, Math.PI * 2, false);
            ctx.fill();
            this.Update();
        };
        this.Update = function() {
            this.X += this.VelX;
            this.Y += this.VelY;
            if (this.X-this.Radius/2 <= 0 || this.X+this.Radius/2 >= Width) {
                this.VelX *= -1;
            }
            if (this.Y-this.Radius/2 <= 0 || this.Y+this.Radius/2 >= Height) {
                this.VelY *= -1;
            }
        };
        this.Reset = function() {
            this.X = getRandomInt(0, Width);
            this.Y = getRandomInt(0, Height);
            this.VelX = (!!Math.round(Math.random() * 1) ? 1.5 : -1.5);
            this.VelY = (!!Math.round(Math.random() * 1) ? 1.5 : -1.5);
        };
    };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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
        Balls.forEach(function(ball) {
            ball.Paint();
        });
    };


    function Loop() {
        init = requestAnimFrame(Loop);
        now = Date.now();
        delta = now - then;
        if (delta > interval) {
            Paint();
            then = now - (delta % interval);
        }
    };

    return {
        NewGame: function() {
            var ball = new Ball();
            ball.Reset();
            Balls.push(ball);
            Loop();
        }
    };
})();
Game.NewGame();