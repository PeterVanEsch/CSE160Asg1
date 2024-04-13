class Star{
    constructor(){
        this.type = 'star';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 4; // Number of points on the star
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = this.size / 200.0;
        
        let angleStep = 360 / (2 * this.segments); // Each segment consists of two points for the star
        let innerAngleStep = 360 / this.segments; // Angle step for the inner points

        // Iterate over each segment of the star
        for (var angle = 0; angle < 360; angle += angleStep) {
            let centerPoint = [xy[0], xy[1]];
            let outerAngle1 = angle;
            let outerAngle2 = angle + angleStep;
            let innerAngle = angle + (angleStep / 2);
            
            // Calculate the outer vertices
            let outerVec1 = [Math.cos(outerAngle1 * Math.PI / 180) * d, Math.sin(outerAngle1 * Math.PI / 180) * d];
            let outerVec2 = [Math.cos(outerAngle2 * Math.PI / 180) * d, Math.sin(outerAngle2 * Math.PI / 180) * d];
            
            // Calculate the inner vertex
            let innerVec = [Math.cos(innerAngle * Math.PI / 180) * (d / 2), Math.sin(innerAngle * Math.PI / 180) * (d / 2)];
            
            // Calculate the points
            let outerPoint1 = [centerPoint[0] + outerVec1[0], centerPoint[1] + outerVec1[1]];
            let outerPoint2 = [centerPoint[0] + outerVec2[0], centerPoint[1] + outerVec2[1]];
            let innerPoint = [centerPoint[0] + innerVec[0], centerPoint[1] + innerVec[1]];

            // Draw the triangles to form the star
            drawTriangles([xy[0], xy[1], outerPoint1[0], outerPoint1[1], innerPoint[0], innerPoint[1]]);
            drawTriangles([xy[0], xy[1], innerPoint[0], innerPoint[1], outerPoint2[0], outerPoint2[1]]);
        }
    }
}

function drawTriangles(vertices) {

    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
      //console.log('Failed to get the storage location of a_Position');
      //return -1;
    //}
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
}