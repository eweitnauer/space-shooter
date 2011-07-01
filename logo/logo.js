var W,H,U,ctx;

// draw a specific line
function line(x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.closePath();
    ctx.stroke()
}
// vertcial line
function vline(x,y1,y2){ line(x,y1,x,y2); }

// horizontal line
function hline(x1,x2,y){ line(x1,y,x2,y); }

// angle to radiant
function toRad(angle){ return angle * Math.PI / 180.0; }

// draw an arc (always centered at 3.5U* 3.5U
function arc(r,a,b){
    ctx.moveTo(3.5*U,3.5*U);
    ctx.beginPath();
    ctx.arc(3.5*U,3.5*U,r,toRad(a),toRad(b),false);
    ctx.stroke();
}

function draw_logo(width){
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    W = width;              // width of the whole logo
    H = width*21.0/22.0;    // height of the whole logo
    U = W/11;               // stoke-width - unit

    canvas.width = W;       // in this example the canvas size is
    canvas.height = H;      // automatically adapted

    ctx.clearRect(0,0,W,H);   // white background
    ctx.strokeStyle = "rgb(128,128,128)";
    ctx.lineWidth = U;

    vline(3.5*U,U/2,H);      // vertical line of the Phi
    vline(5.5*U,7.737*U,H);  // short vertical line of h
    vline(8.5*U,2*U,H);      // long vertical line of h
    vline(10.5*U,0,U);       // i-dot
    vline(10.5*U,2*U,H);     // i

    arc(3*U,270,70.53);      // gray arc of the Phi
    hline(3*U,3.6*U, U/2);   // fill upper left corner of Phi (HACK) 

    arc(5*U,0,70,35);        // gray arc of the h

    // dark red arcs left of the Phi
    ctx.strokeStyle = "rgb(195,0,0)";
    var phi = (1+Math.sqrt(5))/2; // the golden section
    var da=42.42;      // first segment length (lower left)          
    var a= 109.47;     // first offset
    for (i=0;i<5;i++){
        arc(3*U,a,a+da);
        a += da+8;     // 8 degree space
        da = da/phi;   // segment length is decreased by phi
    }
    
}
