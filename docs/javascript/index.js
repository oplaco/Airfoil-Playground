let canvas = document.getElementById("canvas")
let canvas_width = canvas.width*0.95
let canvas_height = canvas.height*0.95
let camber = document.getElementById("camber")
let l_camber= document.getElementById("l-camber")
let naca_p=document.getElementById("NACA-p")
let t = document.getElementById("t")
let alpha = document.getElementById("alpha")
let Q = document.getElementById("Q")
//We need to declare the context of the canvas
let ctx = canvas.getContext("2d")

ctx.translate(0.025*canvas_width,350) //Translates de (0,0) point of the canvas so the leading edge of the airfoil starts at the left of the screen

function printXAxis(){
    ctx.beginPath();
    ctx.moveTo(-0.025*canvas_width,0);
    ctx.lineTo(1.025*canvas_width,0);
    ctx.strokeStyle="purple"
    ctx.stroke();
}

var res = 500 //X coordinate array with customizable resolution. Span betweens 0-1 (chord lenght)

//Linear spacing vector for the x coordinates (in the future add cosine spacing)
var x_coord =[]
for(let i=0;i<res;i++){
    x_coord[i]=i/res
}

//Function that builds a symmetrical NACA 00xx airfoil. t is the maximum thickness as a fraction of the chord
function symmetrical(t){
    let y_coord = []
    for (let i=0;i<res;i++){
        let x = x_coord[i]
        let y = 5*t*(0.2969*Math.sqrt(x)-0.1260*x-0.3516*x**2+0.2843*x**3-0.1015*x**4)
        y_coord.push(y)
    }
    return y_coord
}

//Function that builds a cambered 4 Digit NACA mpxx airfoil.
function four_digit_cambered(m,p,t){
    let y_camber = []
    let y
    for (let i=0;i<x_coord.length;i++){
        let x = x_coord[i]
        if(0<=x & x<=p){
            y = (m/(p**2))*(2*p*x-x**2)
        } else if(p<x & x<=1){
            y = (m/(1-p)**2)*(1-2*p+2*p*x-x**2)
        }
        y_camber.push(y)
    }
    printInCanvas(y_camber.map(element=>-1*element),"blue")
    let y_camber_dx = []
    let y_upper = []
    let y_lower = []
    let theta = []
    for (let i=0;i<x_coord.length;i++){
        let x = x_coord[i]
        if(0<=x & x<=p){
            y_camber.push((2*m/(p**2))*(p-x)) 
        } else if(p<x & x<=1){
            y_camber.push((2*m/(1-p)**2)*(p-x))
        }
        theta[i]=Math.atan(y_camber[i])
        y_upper[i]=y_camber[i]+symmetrical(t)[i]*Math.cos(theta[i])
        y_lower[i]=y_camber[i]-symmetrical(t)[i]*Math.cos(theta[i])
    }
    printInCanvas(y_upper.map(element=>-1*element),"red")
    printInCanvas(y_lower.map(element=>-1*element),"red")
    //Print line that joins the end point of both upper and lower side of the airfoil.
    ctx.beginPath();
    ctx.moveTo(x_coord[res-1]*canvas_width,y_upper[res-1]*canvas_height);
    ctx.lineTo(x_coord[res-1]*canvas_width,y_lower[res-1]*canvas_height);
    ctx.strokeStyle="red"
    ctx.stroke();

    printChord(y_upper,y_lower)
    naca_p.innerHTML="NACA "+Math.floor(m*100)+Math.floor(p*10)+Math.floor(t*100)
}

////Function that builds a cambered 5 Digit NACA mpxx airfoil.
function five_digit_cambered(L,P,Q,t){
    let r,k1,k3 //m1,m2 slope of the linear equation y = y1 + m * (x-x1)
    let y_camber = [],y_camber_dx = [],y_upper = [], y_lower = [],theta = []
    let symmetrical_case = symmetrical(t)
    if(Q===0){//Normal/Standard camber line
        if(0.05<=P & P<0.1){
            r = linear_interpolation(P,0.05,0.1,0.058,0.126)
            k1 = linear_interpolation(P,0.05,0.1,361.4,51.640)
        }else if(0.1<=P & P<0.15){
            r = linear_interpolation(P,0.1,0.15,0.126,0.2025)
            k1 = linear_interpolation(P,0.1,0.15,51.640,15.957)
        }else if(0.15<=P & P<0.2){
            r = linear_interpolation(P,0.15,0.2,0.2025,0.29)
            k1 = linear_interpolation(P,0.15,0.2,15.957,6.643)
        }else if(0.2<=P & P<=0.25){
            r = linear_interpolation(P,0.2,0.25,0.29,0.391)
            k1 = linear_interpolation(P,0.2,0.25,6.643,3.230)
        }
        for (let i=0;i<x_coord.length;i++){
            let x = x_coord[i]
            if(0<=x & x<=r){
                y_camber.push(k1/6*(x**3-3*r*x**2+(3-r)*x*r**2))
                y_camber_dx.push(k1/6*(3*x**2-6*r*x+(3-r)*r**2))
            } else if(r<x & x<=1){
                y_camber.push((k1*r**3)/6*(1-x))
                y_camber_dx.push(((-k1*r**3)/6))
            }
            theta[i]=Math.atan(y_camber_dx[i])
            y_upper[i]=y_camber[i]+symmetrical_case[i]*Math.cos(theta[i])
            y_lower[i]=y_camber[i]-symmetrical_case[i]*Math.cos(theta[i])
        }
    }else if(Q===1){//Refex camber line
        if(0.05<=P & P<0.1){
            r=0.13
            k1=51.99
            k3=0.000764
        }else if(0.1<=P & P<0.15){
            r = linear_interpolation(P,0.1,0.15,0.13,0.2170)
            k1 = linear_interpolation(P,0.1,0.15,51.99,15.793)
            k3 = linear_interpolation(P,0.1,0.15,0.000764,0.00677)
            console.log("colla1")
        }else if(0.15<=P & P<0.2){
            r = linear_interpolation(P,0.15,0.2,0.2170,0.3180)
            k1 = linear_interpolation(P,0.15,0.2,15.793,6.520)
            k3 = linear_interpolation(P,0.15,0.2,0.00677,0.0303)
            console.log("colla2")
        }else if(0.2<=P & P<=0.25){
            r = linear_interpolation(P,0.2,0.25,0.3180,0.4410)
            k1 = linear_interpolation(P,0.2,0.25,6.520,3.191)
            k3 = linear_interpolation(P,0.2,0.25,0.0303,0.1355)
            console.log("colla3")
        }
        for (let i=0;i<x_coord.length;i++){
            let x = x_coord[i]
            if(0<=x & x<=r){
                console.log(r)
                y_camber.push(k1/6*((x-r)**3-k3*x*(1-r)**3-x*r**3+r**3))
                y_camber_dx.push(k1/6*(3*(x-r)**2-k3*(1-r)**3-r**3))
            } else if(r<x & x<=1){
                y_camber.push(k1/6*(k3*(x-r)**3-k3*x*(1-r)**3-x*r**3+r**3))
                y_camber_dx.push(k1/6*(k3*3*(x-r)**2-k3*(1-r)**3-r**3))
            }
            theta[i]=Math.atan(y_camber_dx[i])
            y_upper[i]=y_camber[i]+symmetrical(t)[i]*Math.cos(theta[i])
            y_lower[i]=y_camber[i]-symmetrical(t)[i]*Math.cos(theta[i])
        }
    }
    printInCanvas(y_camber.map(element=>-1*element),"blue")
    printInCanvas(y_upper.map(element=>-1*element),"red")
    printInCanvas(y_lower.map(element=>-1*element),"red")
    naca_p.innerHTML="NACA 2"+Math.floor(P*20)+Math.floor(Q)+Math.floor(t*100)
}

function linear_interpolation(x,x1,x2,y1,y2){
    let m=(y2-y1)/(x2-x1)
    return y=y1+m*(x-x1)
}

//Prints pixels in the canvas with coordinates (x_coord[i],y_coord[y]). The x_coord[] list is always the same, the chord spanning between [0,1]
function printInCanvas(y_coord,color){
    for(let i=0;i<x_coord.length;i++){
        ctx.fillRect(x_coord[i]*canvas_width,y_coord[i]*canvas_height,1,1)
    }
    ctx.beginPath();
    for(let i=0;i<x_coord.length;i++){
        ctx.moveTo(x_coord[i]*canvas_width,y_coord[i]*canvas_height);
        ctx.lineTo(x_coord[i+1]*canvas_width,y_coord[i+1]*canvas_height);
        ctx.strokeStyle=color
    }
    ctx.stroke();
}

//Prints the chord of the airfoil. The start point is (0,0) and the endpoint is the middle point between the end point of the lower and upper side.
function printChord(y_coord1,y_coord2){
    ctx.beginPath();
    ctx.moveTo(x_coord[0]*canvas_width,y_coord1[0]*canvas_height);
    ctx.lineTo(x_coord[res-1]*canvas_width,(y_coord1[res-1]+y_coord2[res-1])/2*canvas_height);
    ctx.strokeStyle="black"
    ctx.stroke();
}

  function loadSymmetricalAirfoil(){
    clearCanvas()
    printXAxis()
    transformation(alpha.value,true)
    printInCanvas(symmetrical(t.value/100),"red")//Print lower airfoil surface
    printInCanvas(symmetrical(t.value/100).map(element=>-1*element),"red")//Print upper airfoil surface

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(1*canvas_width,0*canvas_height);
    ctx.strokeStyle="black"
    ctx.stroke();
    //Print line that joins the end point of both upper and lower side of the airfoil.
    ctx.beginPath();
    ctx.moveTo(x_coord[res-1]*canvas_width,symmetrical(t.value/100)[res-1]*canvas_height);
    ctx.lineTo(x_coord[res-1]*canvas_width,-symmetrical(t.value/100)[res-1]*canvas_height);
    ctx.strokeStyle="red"
    ctx.stroke();
    transformation(alpha.value,false)
    naca_p.innerHTML="NACA 00"+Math.floor(t.value)
  }

  function load_four_digit_cambered(){
    clearCanvas()
    printXAxis()
    transformation(alpha.value,true)
    four_digit_cambered(camber.value/100,l_camber.value/100,t.value/100)
    transformation(alpha.value,false)
  }

  function load_five_digit_cambered(){
    clearCanvas()
    printXAxis()
    transformation(alpha.value,true)
    five_digit_cambered(0,l_camber.value/100,Math.round(Q.value),t.value/100)//If Q.value is not rounded it might be 0.999999999 instead of 1 so it doesn´t go into de for loop
    transformation(alpha.value,false) 
}

  function transformation(angle_deg,init){
    let angle_rad=angle_deg*Math.PI/180
    if(init===true){
        ctx.rotate(angle_rad)//The rotation will only affect drawings made AFTER the rotation is done.
        ctx.translate(0,-canvas_width*Math.tan(angle_rad))
    }else if(init===false){
        ctx.translate(0,canvas_width*Math.tan(angle_rad))
        ctx.rotate(-angle_rad)
    }
  }

function clearCanvas(){
    ctx.clearRect(-canvas.width,-canvas.height,2*canvas.width,2*canvas.height) //Note that i have to take into account the previous transformation on the y axis
    naca_p.innerHTML=""
    //ctx.rotate(alpha.value*Math.PI/180)
}

//To stop form refreshing page on submit (avoid default behavior)
var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);
