function main() {
    console.log("Test dah muncul belom");
    /**
     * @type {HTMLCanvasElement} canvas
     */
    const canvas = document.querySelector("#myCanvas");

    /**
     * @type {WebGLRenderingContext} gl
     */
    const gl = canvas.getContext("webgl");

    if (!gl) {
        gl = canvas.getContext("experimental-webgl");
    }
    if (!gl) {
        alert("your browser does not support webgl");
    }

    const vertexShaderCode = `
        precision mediump float;
        attribute vec2 vertPosition;
        attribute vec4 vertColor;
        varying vec4 fragColor;
        uniform mat4 u_matrix;
        uniform float dx;
        uniform float dy;
        uniform float dz;

        void main(){
            fragColor = vertColor;
            // mat4 translation = mat4(
            //     1.0, 0.0, 0.0, 0.0,
            //     0.0, 1.0, 0.0, 0.0,
            //     0.0, 0.0, 1.0, 0.0,
            //     dx, dy, dz, 1.0
            // );
            
            // gl_Position =  translation * vec4(vertPosition, 0.0, 2.0);
            gl_Position =  u_matrix * vec4(vertPosition, 0.0, 2.0);
        }
    `;

    const fragmentShaderCode = `
        precision mediump float;
        varying vec4 fragColor;

        void main(){
            gl_FragColor = vec4(fragColor);
        }
    `;
    
    //make shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.shaderSource(fragmentShader, fragmentShaderCode);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(
            "Error! cannot compiling vertex shader",
            gl.getShaderInfoLog(vertexShader)
        );
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(
            "Error! cananot compiling fragment shader",
            gl.getShaderInfoLog(fragmentShader)
        );
        return;
    }

    //make program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(
            "Error! cannot linking program",
            gl.getProgramInfoLog(program)
        );
        return;
    }

    const top1 = [
        -0.4,
        0.8,
        -0.5,
        0.53,
        -0.2,
        0.58, // 1
        -0.4,
        0.8,
        -0.2,
        0.58,
        -0.2,
        0.86, // 2
        -0.2,
        0.86,
        -0.2,
        0.58,
        0,
        0.58, // 3
        -0.2,
        0.86,
        0,
        0.87,
        0,
        0.58, // 4
        0,
        0.87,
        0,
        0.58,
        0.2,
        0.58, // 5
        0,
        0.87,
        0.2,
        0.58,
        0.2,
        0.86, // 6
        0.2,
        0.86,
        0.2,
        0.58,
        0.4,
        0.8, // 7
        0.4,
        0.8,
        0.2,
        0.58,
        0.5,
        0.53, // 8
    ];
    const bottom1 = [
        -0.5,
        0.53,
        -0.4,
        -0.8,
        0.4,
        -0.8, // 1
        -0.5,
        0.53,
        0.4,
        -0.8,
        -0.2,
        0.58, // 2
        -0.2,
        0.58,
        0.4,
        -0.8,
        0,
        0.58, // 3
        0,
        0.58,
        0.4,
        -0.8,
        0.2,
        0.58, // 4
        0.2,
        0.58,
        0.4,
        -0.8,
        0.5,
        0.53, // 5
    ];

    //set mirror for right object
    let top2 = [];
    let bottom2 = [];
    for (let i = 0; i < top1.length; i++) {
        if (i % 2 === 0) {
            top2[i] = top1[i] + 2.0;
        } else {
            top2[i] = top1[i];
        }
    }
    for (let i = 0; i < bottom1.length; i++) {
        if (i % 2 === 0) {
            bottom2[i] = bottom1[i] + 2.0;
        } else {
            bottom2[i] = bottom1[i];
        }
    }
    const vertices = [...top1, ...bottom1, ...top2, ...bottom2];

    //set vert position in vertex shader code
    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const positionAttribLocation = gl.getAttribLocation(
        program,
        "vertPosition"
    );
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    //button event listener
    const btn = document.querySelector("button");
    btn.addEventListener("click", () => {
        changeColor();
    });

    //change color
    let color = [];
    let colorTriangle = false;
    function changeColor() {
        console.log(color);
        color = [];
        if (colorTriangle) {
            colorTriangle = false;
            //colorize per triangle
            for (let i = 0; i < vertices.length / 6; i++) {
                let r = Math.random() / 2 + 0.45;
                let g = Math.random() / 2 + 0.45;
                let b = Math.random() / 2 + 0.45;
                for (let j = 0; j < 3; j++) {
                    color.push(r);
                    color.push(g);
                    color.push(b);
                    color.push(1);
                }
            }
        } else {
            colorTriangle = true;
            //colorized top and bottom part
            for (let i = 0; i < 2; i++) {
                let r = 0.9;
                let g = 0.9;
                let b = 0.9;
                for (let j = 0; j < top1.length / 2; j++) {
                    color.push(r);
                    color.push(g);
                    color.push(b);
                    color.push(1);
                }
                r = 97 / 255;
                g = 90 / 255;
                b = 82 / 255;
                for (let j = 0; j < bottom1.length / 2; j++) {
                    color.push(r);
                    color.push(g);
                    color.push(b);
                    color.push(1);
                }
            }
        }
        //set vert color in vertex shader code
        const colorBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
        const colorAttribLocation = gl.getAttribLocation(program, "vertColor");
        gl.vertexAttribPointer(
            colorAttribLocation,
            4,
            gl.FLOAT,
            gl.FALSE,
            4 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.enableVertexAttribArray(colorAttribLocation);
    }
    changeColor();

    //main render attrib
    const primitive = gl.TRIANGLES;
    const offset = 0;
    const count = 39 * 2;

    //animation attrib
    let speed = 0.0050;
    let dy = 0;

    //main render
    function render() {
        if (dy >= 0.55) {
            speed = -speed;
        }
        if (dy <= -0.6) {
            speed = -speed;
        }
        dy += speed;

        const left = [
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -0.5,
            0.0, 0.0, 1.0,
        ];
        const right = [
            1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0,
            0.0,
            -0.5,
            dy,
            0.0,
            1.0,
        ];

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const u_matrix = gl.getUniformLocation(program, "u_matrix");

        gl.uniformMatrix4fv(u_matrix, false, left);
        gl.drawArrays(primitive, offset, count / 2);

        gl.uniformMatrix4fv(u_matrix, false, right);
        gl.drawArrays(primitive, (top1.length + bottom1.length) / 2, count / 2);

        requestAnimationFrame(render);      
    }
    render();
}
