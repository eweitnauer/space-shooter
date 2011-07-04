
function draw_logo_at(ctx,x,y,width){
    ctx.translate(x,y);
    
    var W,H,U,ctx;
    
    // draw a specific line
    function line(x1,y1,x2,y2){
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.closePath();
        ctx.stroke();
    }
    // vertcial line
    function vline(x,y1,y2){ line(x,y1,x,y2); }
    
    // angle to radiant
    function toRad(angle){ return angle * Math.PI / 180.0; }
    
    // draw an arc (always centered at 3.5U* 3.5U
    function arc(r,a,b){
        ctx.moveTo(3.5*U,3.5*U);
        ctx.beginPath();
        ctx.arc(3.5*U,3.5*U,r,toRad(a),toRad(b),false);
        ctx.stroke();
    }

    W = width;              // width of the whole logo
    H = width*21.0/22.0;    // height of the whole logo
    U = W/11;               // stoke-width - unit

    ctx.clearRect(0,0,W,H);   // white background
    ctx.strokeStyle = "rgb(128,128,128)";
    ctx.lineWidth = U;

    vline(10.5*U,0,U);       // i-dot
    vline(10.5*U,2*U,H);     // i

    // P
    ctx.beginPath();
    ctx.moveTo(3.5*U,H);  // start lower left
    ctx.lineTo(3.5*U,H);  // line upwards
    ctx.arc(3.5*U,3.5*U,3*U,toRad(270),toRad(70.53),false);  // gray arc of the Phi
    ctx.stroke();            

    // h
    ctx.beginPath();
    ctx.moveTo(8.5*U,H);        // start lower right
    ctx.lineTo(8.5*U,2*U);      // move up
    ctx.arc(3.5*U,3.5*U,5*U,toRad(0),toRad(70.53),false);        // gray arc of the h
    ctx.moveTo(5.5*U,7.737*U);  // prepare left vertical  
    ctx.lineTo(5.5*U,H);        // left short vertical line
    ctx.stroke();
    
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

function draw_logo(width){
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = width*21.0/20.0;
    
    draw_logo_at(ctx,0,0,width);
}
