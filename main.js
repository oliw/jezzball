var Game = (function() {
    var Width = 500;
    var Height = 500;
    var canvas = document.getElementById("game");
    canvas.width = Width;
    canvas.height = Height;
    canvas.setAttribute('tabindex', 1);
    var ctx = canvas.getContext("2d");
    var fps = 60;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;

    var Balls = [];
    var Walls = [];
    var Level = 1;

    var Score = (function() {
        var score = 0;
        return {
            Paint: function() {
                ctx.beginPath();
                ctx.fillStyle = '#999';
                ctx.font = "normal 10pt Calibri";
                ctx.fillText("level: "+Level+" score: " + this.score.toFixed(2)*100+ "%", 10, 15);            
            },
            Reset: function() {
                this.score = 0;
            },
            Update: function() {
                this.score = Map.AreaCovered();
            },
            Get: function() {
                return this.score;
            }
        };
    })();

    var Map = (function() {
        var map;

        var background_canvas = document.createElement('canvas');
        background_canvas.width = Width;
        background_canvas.height = Height;
        var background_canvas_ctx = background_canvas.getContext("2d");
        var openColor = '#E5E5E5';
        var closedColor = '#666666';

        var UpdateBackground = function() {
            background_canvas_ctx.clearRect ( 0 , 0 , background_canvas.width, background_canvas.height );
            for (var i = 0; i < map.length;i++) {
                var y = i / Width;
                var x = i % Width;
                background_canvas_ctx.beginPath();
                background_canvas_ctx.fillStyle = map[i] ? openColor : closedColor;
                background_canvas_ctx.fillRect(x,y,1,1);
            }
        };

        var Close = function(x1, y1, width, height) {
                for (var x = x1; x < x1+width; x++) {
                    for (var y = y1; y < y1+height; y++) {
                        map[y*Width+x] = 0;
                    }
                }
                UpdateBackground();
                Score.Update();              
        };

        var IsClosed = function(x,y) {
            return map[y*Width+x] == 0;
        };

        var CloseConvexSpaces = function() {
            var corners = [];
            for (var x = 0; x < Width; x++) {
                for (var y = 0; y < Height; y++) {
                    if (map[y*Width+x] == 0) {
                        continue;
                    } else {
                        if ((x == 0 || (x > 0 && map[y*Width+(x-1)] == 0)) && (y == 0 || (y > 0 && map[(y-1)*Width+x] == 0))) {
                            corners.push([x,y]);
                        }
                    }
                }
            }

            validCorners = [];
            
            corners.forEach(function(corner) {
                var x = corner[0];
                var y = corner[1];
                var curr_x = x;
                var curr_y = y;
                var isValid = true;
                // Check all widths are the same
                var width = -1;
                while (map[curr_y*Width+curr_x] == 1 && curr_y < Height) {
                    var curr_width = 0;
                    while (map[curr_y*Width+curr_x] == 1 && curr_x < Width) {
                        curr_width++;
                        curr_x++;
                    }
                    if (width == -1) {
                        width = curr_width; 
                    } else if (width != curr_width) {
                        // Not a closed space
                        isValid = false;
                        break;
                    }
                    curr_x = x;
                    curr_y++;
                }
                curr_x = x;
                curr_y = y;
                var height = -1;
                while (map[curr_y*Width+curr_x] == 1 && curr_x < Width) {
                    var curr_height = 0;
                    while (map[curr_y*Width+curr_x] == 1 && curr_y < Height) {
                        curr_height++;
                        curr_y++;
                    }
                    if (height == -1) {
                        height = curr_height; 
                    } else if (height != curr_height) {
                        // Not a closed space
                        isValid = false;
                        break;
                    }
                    curr_y = y;
                    curr_x++;
                }
                // Check top layer
                if (isValid && y > 0) {
                    for (var curr_x = x; curr_x < x+width; curr_x++) {
                        if (map[(y-1)*Width+curr_x] == 1) {
                            isValid = false;
                            break;
                        }
                    }
                }
                // Check left layer
                if (isValid && x > 0) {
                    for (var curr_y = y; curr_y < y+height; curr_y++) {
                        if (map[curr_y*Width+x-1] == 1) {
                            isValid = false;
                            break;
                        }
                    }
                }               
                if (isValid) {
                    validCorners.push([corner[0],corner[1],width,height]);
                }
            });

            validCorners.forEach(function(corner) {
                var containsBall = false;
                Balls.forEach(function(ball) {
                    if (ball.X >= corner[0] && ball.X < corner[0]+corner[2] && ball.Y >= corner[1] && ball.Y < corner[1]+corner[3]) {
                        containsBall = true;
                    }
                });
                if (!(containsBall)) {
                    Close(corner[0], corner[1], corner[2], corner[3]);
                }
            });
        }

        return {
             Reset: function() {
                 map = new Uint8Array(Width*Height);
                 for (var i = 0; i < map.length; i++) {
                     map[i] = 1;
                 }
                 UpdateBackground();
             },
             Paint : function() {
                ctx.drawImage(background_canvas, 0, 0);
             },
             IsClosed: function(x,y) {
                x = Math.round(x);
                y = Math.round(y);
                return map[y*Width+x] === 0;
             },
             AreaCovered: function() {
                var amountOpen = 0;
                for (var i = 0; i < map.length; i++) {
                     amountOpen += map[i];
                }
                return (map.length-amountOpen)/map.length;
             },
             Seal: function(startX, startY, endX, endY) {
                var x = Math.min(startX, endX);
                var y = Math.min(startY, endY);
                var width = 1+ Math.abs(endX-startX);
                var height = 1 + Math.abs(endY-startY);
                width = width == 1 ? 3 : width;
                height = height == 1 ? 3 : height;
                Close(x, y, width, height);
                CloseConvexSpaces();
             }
        };
    })();

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
            if (this.X-this.Radius/2 <= 0 || this.X+this.Radius/2 >= Width || Map.IsClosed(this.X-this.Radius/2, this.Y) || Map.IsClosed(this.X+this.Radius/2, this.Y)) {
                this.VelX *= -1;
            }
            if (this.Y-this.Radius/2 <= 0 || this.Y+this.Radius/2 >= Height || Map.IsClosed(this.X, this.Y-this.Radius/2) || Map.IsClosed(this.X,this.Y+this.Radius/2)) {
                this.VelY *= -1;
            }
        };
        this.Reset = function() {
            this.X = getRandomInt(0, Width);
            this.Y = getRandomInt(0, Height);
            this.VelX = (!!Math.round(Math.random() * 1) ? 3 : -3);
            this.VelY = (!!Math.round(Math.random() * 1) ? 3 : -3);
        };
    };

    function Block(x,y,width,height) {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
        this.Color = '#666666';

        this.Paint = function() {
            ctx.beginPath();
            ctx.fillStyle = this.Color;
            ctx.fillRect(this.X,this.Y,this.Width,this.Height);
        };
    }

    function Wall(startX, startY, direction) {
        this.StartX = startX;
        this.StartY = startY;
        this.Direction = direction;
        this.EndX = startX;
        this.EndY = startY;
        this.State = null; // 'moving' or 'done'
        this.Vel = 1;
        this.Thickness = 3;
        this.Color = '#0000FF';

        this.Paint = function() {
            ctx.beginPath();
            ctx.strokeStyle = this.Color;
            ctx.moveTo(this.StartX, this.StartY);
            ctx.lineTo(this.EndX, this.EndY);
            ctx.lineWidth = this.Thickness;
            ctx.stroke();
            this.Update();
        };
        this.Update = function() {
            if (this.EndX == -1 || this.EndX == Width || this.EndY == -1 || this.EndY == Height || Map.IsClosed(this.EndX, this.EndY)) {
                if (this.EndX == Width) {
                    Map.Seal(this.StartX, this.StartY, this.EndX-1, this.EndY);
                } else if (this.EndX == -1) {
                    Map.Seal(this.StartX, this.StartY, this.EndX+1, this.EndY);
                } else if (this.EndY == Width) {
                    Map.Seal(this.StartX, this.StartY, this.EndX, this.EndY-1);
                } else {
                    Map.Seal(this.StartX, this.StartY, this.EndX, this.EndY+1);
                }
                remove(Walls, this);
                return;
            }
            switch(this.Direction) {
                case 'north':
                    this.EndY -= this.Vel;
                    break;
                case 'east':
                    this.EndX += this.Vel;
                    break;
                case 'south':
                    this.EndY += this.Vel;
                    break;
                case 'west':
                    this.EndX -= this.Vel;
                    break;
                default:
                    break;
            }
        };
    }

    function onMouseClick(event) {
        var x = event.x - canvas.getBoundingClientRect().left;
        var y = event.y - canvas.getBoundingClientRect().top;
        if (!(Map.IsClosed(x,y))) {
            Walls.push(new Wall(x, y, event.which ==1 ? 'east': 'north'));
            Walls.push(new Wall(x, y, event.which ==1 ? 'west': 'south'));
        }
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function remove(array, element) {
        for (var i = array.length; i--; i < 0) {
            if (array[i] == element) {
                array.splice(i, 1);
                return;
            }
        }
    }

    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, FPS);
        };
    })();
    window.cancelRequestAnimFrame = (function() {
        return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
    })();

    canvas.addEventListener("mousedown", onMouseClick , false);
    canvas.oncontextmenu = function() {return false};

    function Paint() {
        ctx.beginPath();
        Map.Paint();
        Score.Paint();
        Walls.forEach(function(wall) {
            wall.Paint();
        });
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
            Balls.forEach(function(ball) {
                Walls.forEach(function(wall) {
                    // If ball hits a wall then game over

                });
            });
            if (Score.Get() > 0.5) {
                console.log('Level complete!');
                LoadLevel(++Level);
            } 
            then = now - (delta % interval);
        }
    };

    function LoadLevel(lvl) {
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
        Score.Reset();
        Balls = [];
        Walls = [];
        for (var i = 0; i < lvl; i++) {
            var ball = new Ball();
            ball.Reset();
            Balls.push(ball);
        }
        Map.Reset();
    };

    function GameOver() {
        alert('Game Over!');
    }

    return {
        NewGame: function() {
            LoadLevel(Level);
            Loop();
        }
    };
})();
Game.NewGame();