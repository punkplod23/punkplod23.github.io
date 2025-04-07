//Dedicated to William Rodney Lee, you loved this game

function loop(){

    if (!window.lastUpdate || Date.now() - window.lastUpdate >= 50) {
        window.lastUpdate = Date.now();
        window.game.update();
    }
	

	requestAnimationFrame(loop);

}

class Game{
    
	constructor(){
		this.canvasElm = document.createElement("canvas");
		this.canvasElm.width = 800;
		this.canvasElm.height = 600;
		
		this.worldSpaceMatrix = new M3x3();
		
		this.gl = this.canvasElm.getContext("webgl2");
		this.gl.clearColor(0.4,0.6,1.0,1.0);
		
		document.body.appendChild(this.canvasElm);
		
		let vs = document.getElementById("vs_01").innerHTML;
		let fs = document.getElementById("fs_01").innerHTML;
		
        this.sprite = new Sprite(this.gl, "17.png", vs, fs, {width:window.innerWidth*22, height:window.innerHeight*22,upscale:100});
		this.sprite1 = new Sprite(this.gl, "heli.png", vs, fs, {width:88, height:95.5});
        this.sprite2 = new Sprite(this.gl, "heli.png", vs, fs, {width:88, height:97});
        this.sprite3 = new Sprite(this.gl, "heli.png", vs, fs, {width:80, height:90.5});
            
        this.spriteX1itter = 0;
        this.spriteY1itter = 0;
        this.rotarItter = 0;

        this.spritePos = new Point();
		this.sprite1Pos = new Point();
		this.sprite2Pos = new Point();
		this.sprite3Pos = new Point();

        this.spriteFrame = new Point();
		this.sprite1Frame = new Point();
		this.sprite2Frame = new Point();
        this.sprite3Frame = new Point();
	}
	
	resize(x,y){
		this.canvasElm.width = x;
		this.canvasElm.height = y;
		
		let wRatio = x / (y/240);
		this.worldSpaceMatrix = new M3x3().transition(-1, 1).scale(1.7/wRatio,-1.7/240);
	}
	
	update(){
		this.gl.viewport(0,0, this.canvasElm.width, this.canvasElm.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		this.sprite1Frame.x = this.spriteX1itter;
        this.sprite2Frame.x = this.spriteX1itter;
       

        this.sprite1Frame.y = this.spriteY1itter;

        if(this.spriteX1itter >= 12){
            this.spriteX1itter = 0;
            if(this.spriteY1itter >= 16){
                this.spriteY1itter = 0;
            }else{    
                this.spriteY1itter = this.spriteY1itter;
            }
        }else{
            
            this.spriteX1itter = this.spriteX1itter+1;
        }
        this.sprite3Frame.x = this.rotarItter;
        if( this.rotarItter >= 6){

            this.rotarItter = 0;
        }else{
            this.rotarItter = this.rotarItter+1;
     
        }
       


        //this.sprite1Frame.y = this.sprite1itter;
        
		
		this.sprite2Frame.y = 12;
        this.sprite3Frame.y = 17;
		
		this.sprite2Pos.x = 0;                      
        this.sprite2Pos.y = 100; 
        this.sprite3Pos.x = 3.6;
        this.sprite3Pos.y = 1.5; 
        this.sprite.render(this.spritePos, this.spriteFrame);
		this.sprite1.render(this.sprite1Pos, this.sprite1Frame);
		this.sprite2.render(this.sprite2Pos, this.sprite2Frame);
		this.sprite3.render(this.sprite3Pos, this.sprite3Frame);
       
		this.gl.flush();
	}
}