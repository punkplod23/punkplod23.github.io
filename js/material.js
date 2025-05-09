class Material{
	constructor(gl, vs, fs){
		this.gl = gl;
		
		let vsShader = this.getShader(vs, gl.VERTEX_SHADER);
		let fsShader = this.getShader(fs, gl.FRAGMENT_SHADER);
		
		if(vsShader && fsShader){
			this.program = gl.createProgram();
			gl.attachShader(this.program, vsShader);
			gl.attachShader(this.program, fsShader);
			gl.linkProgram(this.program);
			
			if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)){
				console.error("Cannot load shader \n"+gl.getProgramInfoLog(this.program));
				return null;
			}
			
			gl.detachShader(this.program, vsShader);
			gl.detachShader(this.program, fsShader);
			gl.deleteShader(vsShader);
			gl.deleteShader(fsShader);
			
			gl.useProgram(null);
		}
	}
	
	getShader(script, type){
		let gl = this.gl;
		var output = gl.createShader(type);
		gl.shaderSource(output, script);
		gl.compileShader(output);
		
		if(!gl.getShaderParameter(output, gl.COMPILE_STATUS)){
			console.error("Shader error: \n:" + gl.getShaderInfoLog(output));
			return null;
		}
		
		return output;
	}
}

class Sprite{
	constructor(gl, img_url, vs, fs, opts={}){
		this.gl = gl;
		this.isLoaded = false;
		this.material = new Material(gl,vs,fs);
		
		this.size = new Point(100,100);
     

		if("width" in opts){
			this.size.x = opts.width * 1;
		}
		if("height" in opts){
			this.size.y = opts.height * 1;
		}
        if("upscale" in opts){
            this.size.x *= opts.upscale;
            this.size.y *= opts.upscale;
		}
       

		this.image = new Image();
		this.image.src = img_url;
		this.image.sprite = this;
		this.image.onload = function(){
			this.sprite.setup();
		}
		
		
	}
	static createRectArray(x=0, y=0, w=1, h=1){
		return new Float32Array([
			x, y,
			x+w, y,
			x, y+h,
			x, y+h,
			x+w, y,
			x+w, y+h
		]);
	}
	setup(){
		let gl = this.gl;
		
		gl.useProgram(this.material.program);
		this.gl_tex = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
		this.uv_x = this.size.x / this.image.width;
		this.uv_y = this.size.y / this.image.height;
		
		this.tex_buff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
		gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(0,0,this.uv_x, this.uv_y), gl.STATIC_DRAW);
		
		
		this.geo_buff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
		gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(0,0,this.size.x, this.size.y), gl.STATIC_DRAW);
		
		this.aPositionLoc = gl.getAttribLocation(this.material.program, "a_position");
		this.aTexcoordLoc = gl.getAttribLocation(this.material.program, "a_texCoord");
		this.uImageLoc = gl.getUniformLocation(this.material.program, "u_image");
		
		this.uFrameLoc = gl.getUniformLocation(this.material.program, "u_frame");
		this.uWorldLoc = gl.getUniformLocation(this.material.program, "u_world");
		this.uObjectLoc = gl.getUniformLocation(this.material.program, "u_object");
		
		gl.useProgram(null);
		this.isLoaded = true;
		
	}
	render(position, frames){
		if(this.isLoaded){
			let gl = this.gl;
			
			let frame_x = Math.floor(frames.x) * this.uv_x;
			let frame_y = Math.floor(frames.y) * this.uv_y;
			
			let oMat = new M3x3().transition(position.x, position.y);
			
			gl.useProgram(this.material.program);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
			gl.uniform1i(this.uImageLoc, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
			gl.enableVertexAttribArray(this.aTexcoordLoc);
			gl.vertexAttribPointer(this.aTexcoordLoc,2,gl.FLOAT,false,0,0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
			gl.enableVertexAttribArray(this.aPositionLoc);
			gl.vertexAttribPointer(this.aPositionLoc,2,gl.FLOAT,false,0,0);
			
			gl.uniform2f(this.uFrameLoc, frame_x, frame_y);
			gl.uniformMatrix3fv(this.uWorldLoc, false, window.game.worldSpaceMatrix.getFloatArray());
			gl.uniformMatrix3fv(this.uObjectLoc, false, oMat.getFloatArray());
			
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
			
			gl.useProgram(null);
		}
	}
}