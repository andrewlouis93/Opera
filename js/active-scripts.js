/*THE LOOK UP TABLES*/

var hysteretic_points_table = [];
var visco_points_table = [];

function clear_htable(){
	hysteretic_points_table = [];
}
			
function clear_vtable(){
	visco_points_table = [];
}

function showTooltip(x, y, contents) {
		console.log("IN SHOW TOOLTIP");
		$('<div id="tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 5,
        border: '1px solid #fdd',
        padding: '2px',
        'background-color': '#fee',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);
}
	
function AverageObject(obj1,obj2){
	if ( (obj1 == "no-match") || (obj2 == "no-match") ){
		return "Invalid Point Passed";
	}
	else{
		var returnobj = new Object();
		if (sessvars.dampertype == "visco"){
			returnobj.Ra = (obj1.Ra+obj2.Ra)/2;
			returnobj.Rd = (obj1.Rd+obj2.Rd)/2;
			returnobj.Rs = (obj1.Rs+obj2.Rs)/2;
			returnobj.Rv = (obj1.Rv+obj2.Rv)/2;
			returnobj.Tf = (obj1.Tf+obj2.Tf)/2;
			returnobj.Vf = (obj1.Vf+obj2.Vf)/2;
			returnobj.SdTf = (obj1.SdTf+obj2.SdTf)/2;
			returnobj.x = (obj1.x+obj2.x)/2;
			returnobj.alpha = (obj1.alpha+obj2.alpha)/2;
			return returnobj;
		}
		else if (sessvars.dampertype =="hyster"){
			returnobj.Ra = (obj1.Ra+obj2.Ra)/2;
			returnobj.Rd = (obj1.Rd+obj2.Rd)/2;
			returnobj.Rs = (obj1.Rs+obj2.Rs)/2;
			returnobj.Rv = (obj1.Rv+obj2.Rv)/2;
			returnobj.Tf = (obj1.Tf+obj2.Tf)/2;
			returnobj.Vf = (obj1.Vf+obj2.Vf)/2;
			returnobj.SdTf = (obj1.SdTf+obj2.SdTf)/2;
			returnobj.mud = (obj1.mud+obj2.mud)/2;
			returnobj.alpha = (obj1.alpha+obj2.alpha)/2;
			return returnobj;
		}
	}	
}

function lookupTable(table,x,y){
	for (var index = 0; index < table.length; ++index) {
		//table[index]
		var object = table[index];
		if ((object.Rd == x) && (object.Ra==y)){
			//these may appear more than once, but sure always match back to the same params. so multiple matches are ignored.
			console.log(JSON.stringify(object));
			return object;
		}
	}
	
	var message = "no-match";
	return message;
}

/*INTERPOLATION FUNCTION(S)*/

function triangulate(point_x,point_y,mouse_x,mouse_y){
	return Math.pow((point_x-mouse_x),2)+Math.pow((point_y-mouse_y),2);
}
	
function interpolate(plot_var, cursor_x, cursor_y){
	var x = plot_var.getData();
	for (var i = 0; i < x.length; i++){
		if (x[i].data.length == 0){
			x.splice(i,1);
		}
	}
	
	/*Assigning the least and second least variables to some entries within the data series*/
	var	index =  Math.round(Math.random()*(x.length-1));
	var randompoint = x[index].data[0];
	var least = triangulate(randompoint[0],randompoint[1],cursor_x,cursor_y);
	
	index =  Math.round(Math.random()*(x.length-1));
	randompoint = x[index].data[0];
	var secondleast = triangulate(randompoint[0],randompoint[1],cursor_x,cursor_y);
		
	
	var least_point; 
	var secondleast_point;
	
	for (var e = 0; e < x.length; e++){
		var temp_series = x[e].data;
		
		for (var i = 0; i < temp_series.length; i++){
			var temp = triangulate(temp_series[i][0],temp_series[i][1],cursor_x,cursor_y);
			if (temp < least){
				least = temp;
				//console.log('THIS IS POINT' + temp_series[i]);
				least_point = temp_series[i];
			}
			if ((temp < secondleast) && (least < temp)){
					secondleast = temp;
					//console.log('THIS IS ALSO POINT' + temp_series[i]);
					secondleast_point = temp_series[i];
			}
		}	
	}
	var obj = {'least':least_point,'second_least':secondleast_point}
	return obj;
}

/*OPERA COMPUTATION SCRIPTS BELOW*/

function getPoint(x1,y1,x2,y2,x){
    var inter1 = (x - x1)/(x2 - x1);
    inter1 = inter1*(y2 - y1);
    inter1 = y1 + inter1;
    return inter1;    
}

function grabPoint(x){
	
	var returnval;
	var firstpoint;
	var secondpoint;

	if (sessvars.standard == "NBCC"){
		//All straight lines, all values after 2.0 have the same y-value
		if ((x >= 0) && (x <= 0.2)){
			var temp = getPoint(sessvars.NBCCPayload[0][0],sessvars.NBCCPayload[0][1],sessvars.NBCCPayload[1][0],sessvars.NBCCPayload[1][1],x);
			return [x,temp];
		}
		else if ((x >= 0.2) && (x <= 0.5)){
			var temp = getPoint(sessvars.NBCCPayload[1][0],sessvars.NBCCPayload[1][1],sessvars.NBCCPayload[2][0],sessvars.NBCCPayload[2][1],x);
			return [x,temp];
		}
		else if ((x >= 0.5) && (x <= 1)){
			var temp = getPoint(sessvars.NBCCPayload[2][0],sessvars.NBCCPayload[2][1],sessvars.NBCCPayload[3][0],sessvars.NBCCPayload[3][1],x);
			return [x,temp];
		}
		else if ((x >= 1) && (x <= 2)){
			var temp = getPoint(sessvars.NBCCPayload[3][0],sessvars.NBCCPayload[3][1],sessvars.NBCCPayload[4][0],sessvars.NBCCPayload[4][1],x);
			return [x,temp];
		}
		else if ( x > 2 ){
			var temp = sessvars.NBCCPayload[4][1];
			return [x,temp];
		}
	}
	else if (sessvars.standard == "ASCE"){
		//Four points. At 1s until T_L, y is 1/x
		if ((x>=0) && (x<=sessvars.ASCEPayload[1][0])){
			var temp = getPoint(sessvars.ASCEPayload[0][0],sessvars.ASCEPayload[0][1],sessvars.ASCEPayload[1][0],sessvars.ASCEPayload[1][1],x);
			return [x,temp];	
		}
		else if ((x >= sessvars.ASCEPayload[1][0]) && (x <= sessvars.ASCEPayload[2][0])){
			var temp = getPoint(sessvars.ASCEPayload[1][0],sessvars.ASCEPayload[1][1],sessvars.ASCEPayload[2][0],sessvars.ASCEPayload[2][1],x);
			return [x,temp];
		}
		else if ((x >= sessvars.ASCEPayload[2][0]) && (x <= 1)){
			var temp = getPoint(sessvars.ASCEPayload[2][0],sessvars.ASCEPayload[2][1],sessvars.ASCEPayload[3][0],sessvars.ASCEPayload[3][1],x);
			return [x,temp];
		}
		else if (x>1){
			return [x, (sessvars.temp/x)];
		}
	}	
	
	else{
		console.log("Improperly initialized");
	}
}

function calMaxResidual(p,mu1,mu2,DamperType){
	var Rsm;
	if (DamperType == 1){
		if (mu1<=(1+p)/p*mu2){
			if (mu2 == 1){
				Rsm = (1-p)*(1-(1/mu1));
			}
			else {
				1-((1-p)/mu1) - (p/mu2); 
			}
		}
	}
	else if (DamperType == 2){
		if (mu1<=((1+p)/p)){
			Rsm = (1-p)*(1-(1/mu1));
		}
		else {
			Rsm = (1-p)/(p*mu1);
		}
	}
	return Rsm;
}



function calResidualFOen(p,mu1,mu2,g)
{
    /*computes the free-oscillation residual drift for system with post-yield
      stiffness ratio p, primary ductility mu1, secondary ductiliy mu2 after*/

    var cont_flag = 1;
    var pr = p;
	
	var mu_cur;
	var mu_init;
	
    if (mu2 > 1){
        mu_cur = mu1/mu2;
        mu_init = mu_cur;
    }
    else{
        mu_cur = mu1;
        mu_init = mu_cur;
    }

    if (g<1)  {
        mu_crit = (1-p)/p+2*g/Math.sqrt(1-g)*Math.sqrt((1-p)/p);
    }
    else {
        mu_crit = Number.POSITIVE_INFINITY;
    }
	
	var Rsf_bl;
    if (g == 0 && p>=0.5){
        Rsf_bl = 0;
    }
    else{
        if (mu_cur>mu_crit){
                Rsf_bl=(1-p)/mu_cur*((mu_crit*g+1/p-1-Math.sqrt(Math.pow((mu_crit+1-1/p),2)+4*(1/p-1)*(1+g)))/(1+g)+1);
        }
        else{
                Rsf_bl=(1-p)/mu_cur*((mu_cur*g+1/p-1-Math.sqrt(Math.pow((mu_cur+1-1/p),2)+4*(1/p-1)*(1+g)))/(1+g)+1);
        }
    }

   var Rsm = calMaxResidual(p, mu1, mu2, 1);
   
    if (Rsf_bl>Rsm){
        Rsf_bl = Rsm;
    }
	
	var Rsfe;
    if (mu2 >1){
        Rsfe = Math.abs(Rsf_bl*mu_init/mu1+1-1/mu2);
    }
    else{
        Rsfe=Rsf_bl;
    }

    return Rsfe;
}

/*%------------------------------Input---------------------------------------
 %a - stiffness ratio to be defined internally
 %mu_d - damper ductility to be defined internally
 %Tf - user defined period
 %Vf - user defined normalized strength
 %SdTf - spectral displacement ordinate at Tf
 %EQ - earthquake number used to read the spectral ordinates
 %option - simp. average spectral ordinate - 2, numerical integration of
 %spectral ordinate - 1

 %procedure loads function spectralA([T EQ])
 %T = period of interest in sec
 %EQ = EQ number
 %--------------------------------------------------------------------------
 */
function hyst_SPECTRA(a, mu_d, Tf, Vf, SdTf, EQ, option1){

    var mud;
    if (mu_d <1.0)  {
        mud = 1;
    }
    //Removing the isinf call in the following else if condition
    else if (mu_d>=1000000){
    //equations for Rd can't handle very large mud
        mud = 1000000;
    }
    else{
        mud = mu_d;
    }

	//console.log("a is " + a + "\nmu_d is " + mud + "\nTf is " + Tf + "\nVf is " + Vf + "\nSdTf is " + SdTf + "\noption1 is " + option1);
    var converge = 0;
    var tol = 0.01;
    var numb_iter = 0;
    var muf_cur = 1;

	
    while (converge == 0){
        numb_iter = numb_iter + 1;
        //step2: compute Teff
        Teff = Tf*Math.sqrt(a*mud/(1-a+a*(mud/muf_cur))); //console.log("Teff is " + Teff);
        if (Teff>4){
            Teff_flag=1;}
        else{
            Teff_flag=0;}
        Ti = Tf*Math.sqrt(a);//console.log("Ti is " + Ti);
        //step3: compute Xeff
        I1 = 1/a*Math.log((1-a+a*(mud/muf_cur))/Math.pow((mud/muf_cur),a));//console.log("I1 is " + I1);
        theta = 2;
        I2 = mud*(1-1/muf_cur)-(a*Math.pow(mud,2)+(1-a)*Math.pow(muf_cur,2))/(a*mud*muf_cur+(1-a)*Math.pow(muf_cur,2))*Math.log(muf_cur);//console.log("I2 is " + I2);
        Xeff = 2/Math.PI/mud*(I1+I2)*theta;//console.log("Xeff is " + Xeff);

        //Step4: compute DT
        if (option1 == 1) {
            np = 20;
            Spa = 0.5;
            //Spa = AvgSaU(Tf, mud, muf_cur, a, EQ, np)*9.81; ---> GOT TO FIX THIS LINE!
        }
        else{
            /*Entering Sample Values for SaTi, SaTe, SaTf
            SaTi = spectralA([Ti EQ]);
            SaTe = spectralA([Teff EQ]);
            SaTf = spectralA([Tf EQ]);*/
			
            SaTi = (grabPoint(Ti))[1];//console.log("SaTi is " + SaTi);
            SaTe = (grabPoint(Teff))[1];//console.log("SaTe is " + SaTe);
            SaTf = (grabPoint(Tf))[1];//console.log("SaTf is " + SaTf);
			sessvars.SaTf = SaTf;// For the final module.
			
            b1 = 22.2;
            b2 = 8.2;
            fa = 0.5*Math.exp(-(mud-1)/b1);//console.log("fa is " + fa);
            fb = 0.5-0.5*Math.exp(-(mud-1)/b2);//console.log("fb is " + fb);

            fc=1-fa-fb;
            Spa = (fa*SaTi+fb*SaTf+fc*SaTe);//console.log("Spa " + Spa);
        }
    SdTeff = Spa*Math.pow((Teff/2/Math.PI),2)*9.81;//console.log("SdTeff is " + SdTeff);
    DT = SdTeff/SdTf;//console.log("DT is " + DT); //DT --> RDT

    //%step5: computer Da
    Da = Math.exp(-1.35*Math.pow(Xeff,0.5));//console.log("Da is " + Da);//Da --> Rdx

    //%step6: compute Rv
    Rd_trial = DT*Da;//console.log("Rd_trial is " + Rd_trial);

    if (option1 ==1)
    {
        //fprintf('iteration %g: muf = %g\t Ti = %g\t Teff = %g\t fa = %g\t fb = %g\t sati = %g\t satf = %g\t sate = %g\t SaU = %g\t RdT = %g I1 = %g\t I2 = %g\t Xeff = %g\t Rdx = %g\t Rd = %g\t muf = %g\n', numb_iter, muf_cur, Ti, Teff, fa, fb, SaTi, SaTf, SaTe, Spa, DT, I1, I2, Xeff, Da, Rd_trial,Rd_trial/Vf);
    }
    else
    {
    // fprintf('iteration %g: muf = %g\t Ti = %g\t Teff = %g\t SaU = %g\t RdT = %g I1 = %g\t I2 = %g\t Xeff = %g\t Rdx = %g\t Rd = %g\t muf = %g\n', numb_iter, muf_cur, Ti, Teff, Spa, DT, I1, I2, Xeff, Da, Rd_trial,Rd_trial/Vf);
    }

    //%step7: compute muf
    muf_next = Rd_trial/Vf;//console.log("muf_next is " + muf_next);
    if (muf_next < 1){
        muf_next = 1;
    }
    else if (muf_next>mud){
            muf_next = mud;
        }

    //%step8: compute percentage error and convergence
    error = (muf_next - muf_cur)/muf_cur;
    if (error<tol){
        converge = 1;
    }
    else{
        converge = 0;
    }
    //%fprintf('trial %g: muf = %g, Teff = %gs, Xeff = %g, Spa = %g m/s^2, Sda = %g m, DT = %g, Da = %g, Rd = %g\n', numb_iter, muf_cur, Teff, Xeff, Spa, SdTeff, DT, Da, Rd_trial);
    muf_cur = (muf_cur + muf_next)/2;
    }

  Rd = Rd_trial;
  if (muf_cur>mud){
        mu_ratio_flag = 1;}
    else{
        mu_ratio_flag = 0;}

  //%step9: compute Rv/Ra
  //%use actual mu_d to compute Rv
  if (isFinite(mu_d) == false){
        mud=1000000;}
    else {
        mud=mu_d;}
    if (muf_cur<=1 && mud<=1){
        Rv = Rd/a;}
    else if (muf_cur<=1 && mud>1){
    Rv = Rd*(1-a+a*mud)/(a*mud);}
    else{
    Rv = Vf+(1-a)/(a*mud)*Rd;}

   //%step 10 compute Ra accounting for inherent viscous damping
   if (isFinite(mu_d)==false){
        mud=1000000;
   }
    else{
        mud=mu_d;
   }
    if (muf_cur<=1 && mud<=1){
        Ra = Rv*Math.sqrt(1+Math.pow((2*Math.sqrt(a)*0.05),2));
    }
    else{
        Ra = Rv+2*Rd*(0.05)*Math.sqrt((1-a+a*mud/muf_cur)/(a*mud));
    }
    Rs = calResidualFOen(a, mud, muf_cur,0);
	//console.log("Rs is "+Rs);
   //fprintf('Rdp Rvp Rap Rsp = %g %g %g %g\n', Rd, Rv, Ra, Rs);

    var return_container = {"Rv":Rv,"Ra":Ra,"Rd":Rd,"Rs":Rs};
    return return_container;
}

/*
%------------------------------Input---------------------------------------
    %a - stiffness ratio to be defined internally
    %x - damping parameter to be defined internally
    %Tf - user defined period
    %Vf - user defined normalized strength
    %SdTf - spectral displacement ordinate at Tf
    %EQ - earthquake number used to read the spectral ordinates
    %option1 - simp. average spectral ordinate - 2, numerical integration of
%spectral ordinate - 1
    %option 2 - choose 2 to use harmonic estimate
%option 3 - chosse 2 to use velocity effect equation

%procedure loads function spectralA([T EQ])
%T = period of interest in sec
    %EQ = EQ number
    %--------------------------------------------------------------------------
%solve by interation
    %x=x;
%initialized
*/

function visc_SPECTRA(a,x,Tf,Vf,SaTf,EQ,option1,option2,option3){

	sessvars.SaTf = SaTf;
	SdTf = SaTf*Math.pow((Tf/2/Math.PI),2)*9.81;//console.log("SdTf is" + SdTf);
	sessvars.SdTf = SdTf;
    
	var converge = 0;
    var tol = 0.01;
    var numb_iter = 0;

    if (a==1) {
        a = 0.999;
    }

    var k = (1-a)/a;
	//console.log("k is " + k);
    //Step 1: Guess mu_f
    var muf_cur = 1;

    while (!converge)
    {
        numb_iter = numb_iter + 1;

        //Step 2: Compute Teff
        Teff = Tf*Math.sqrt(a/(1-a+a/muf_cur)); //console.log("Teff is "+Teff);
        //Track if Teff > 4
        if (Teff>4)
        {
            Teff_flag = 1;
        }
        else{
            Teff_flag = 0;
        }

        Ti = Tf*Math.sqrt(a); //console.log("Ti is " + Ti);
        //Step 3: Compute Xeff
        I1 = (Math.sqrt(k*muf_cur*(k*muf_cur+1)) - Math.sqrt(k*(k+1)) - Math.log ((Math.sqrt(k*muf_cur+1) + Math.sqrt(k*muf_cur))/(Math.sqrt(k+1) + Math.sqrt(k))))/Math.pow(k,1.5);
        theta = 2;//console.log("I1 is " + I1);
        I2 = ((k+1)/k)*Math.log((k*muf_cur+1)/(k+1))   - Math.log(muf_cur);//console.log("I2 is " + I2);
        Xeff = x*Math.sqrt(a)+1/muf_cur*(x*I1+2/Math.PI*theta*I2);//console.log("Xeff is " + Xeff);

        //Step 4: Compute DT
        if (option1 == 1)
        {
           np = 20;
            Spa = 0.5;
           //Spa = AvgSaU_VE(Tf,muf_cur,x,a, EQ, np)*9.81;
        }
        else{
            SaTe = (grabPoint(Teff))[1];
            SaTi = (grabPoint(Ti))[1];//console.log("SaTi is " + SaTi);
            Spa = ((SaTi+SaTe)/2);//console.log("Spa is "+Spa);
        }

		
        SdTeff = Spa*Math.pow((Teff/2/Math.PI),2)*9.81;//console.log("Teff is "+Teff);console.log("SdTeff is "+SdTeff);
        DT = SdTeff/SdTf; //console.log("R_dt is "+DT);

        //Step 5: Compute Da
        Da = Math.exp(-1.35*Math.pow(Xeff,0.50));// console.log("Da is "+Da);console.log("Da is "+Da);


        //Step 6: Compute Rv
        Rd_trial = DT*Da;// console.log("Rd_trial is "+Rd_trial);

        //Step 7: Compute muf
        muf_next = Rd_trial/Vf;

        if (muf_next<1)
        {
            muf_next = 1;
        }
        error = Math.abs((muf_next - muf_cur)/muf_cur);
        if (error<tol)
        {
            converge = 1;
        }
        else
        {
            converge = 0;
        }

        muf_cur = (muf_cur+muf_next)/2;
    }
    Rd = Rd_trial;

    gamma = (1-a)+a/muf_cur;

    //Step 9: Compute Rv/Ra
    if (option2 ==1){
        x = x+0.05;
        var muf=muf_cur;
        if (muf_cur <= 1)
        {
            Rv = Rd/a;
            Ra = Rv*Math.sqrt(1+4*Math.pow((Xeff+0.05*Math.sqrt(a)),2)); 
        }
        else{
            Rv = Rd*k+Vf;
            Rai = Vf + Rd/a * Math.sqrt(Math.pow((1-a),2) + Math.pow(((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma)))),2));
            Rae = (Rd/a*Math.sqrt(Math.pow((1+(2*Math.sqrt(a)*x)),2)));
            Ra = Math.min(Rae, Rai);
        }
    }
    else{
       x = x+0.05;
       muf = muf_cur;

       if (muf<=1)
       {
           Rv = Rd/a;
       }
       else{
           Rv = Vf+Rd*(1-a)/a;
       }
        if (x==0)
        {
            Ra = Rv;
        }
        else{
            if (muf<=1){
                Ra = Rv*Math.sqrt(1+Math.pow((2*x*Math.sqrt(a)),2));}
            else if (gamma*muf>=2)
            {
            Ra=Vf+ Rd/a*Math.sqrt(Math.pow((1-a),2)+Math.pow(((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma)))),2));}
            else{
				r = 2*a*gamma/(1+gamma);//console.log("r is "+r);
                u1 = 1/Math.sqrt(1+4*r*Math.pow(x,2));//console.log("u1 is "+ u1);
                u2 = 1/Math.sqrt(1+4*r*Math.pow(x,2)/Math.pow((1-a),2));//console.log("u2 is "+ u2);
                uhat = (2/muf)-gamma;//console.log("uhat is "+ uhat);console.log("gamma is "+ gamma);console.log("muf is" + muf);
				
				
                if (u1<=uhat){
                    Ra = Rd*(gamma-1/muf+1/a*Math.sqrt(1+Math.pow((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma))),2)));}
                else if (u2>=uhat){
                Ra=Vf+ Rd/a*Math.sqrt(Math.pow((1-a),2)+Math.pow(((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma)))),2));}
                else{
				
					//console.log("alpha" + a);
					intera = Math.pow(a,2);
					interb = 1- Math.pow(uhat,2);
					interc = Math.sqrt(r*interb/intera);
					
					inter1 = 1/muf; inter2 = (uhat/a); inter3 = 2*x*Math.sqrt(r*interb/intera);//console.log("X IS "+x);
					Ra = Rd*(gamma-inter1+inter2+inter3);//console.log("Ra is "+Ra);
					//Ra = Rd*(gamma-1/muf+1/a*(2/muf-gamma)+2*x*Math.sqrt((1-a+a/muf)/a)*Math.sqrt(2/(1+gamma))*Math.sqrt(1-Math.pow((2/muf-gamma),2)));
					//Ra = Rd*(gamma-1/muf+1/a*(2/muf-gamma)); console.log("1");
				}
            }
        }
    }

    if (option3 == 1){
        //Tcen = PSTcen(Teff, EQ); //compute the mean response period ============>MUST BE FIXED
        Tcen = 0.5;
        R = Tcen/Teff;
        A = 1+(x)/(520*math.pow(R,5)+0.1);
        Ram = Ra*A;
    }
    else if (option3 == 2){
		SaTe = (grabPoint(Teff))[1];//console.log("SaTe op32 is "+ SaTe);
		PGA = ((grabPoint(0))[1])*0.4;//console.log("PGA op32 is "+ PGA);
		R = SaTe/PGA;
		A=1+x/(5.161*R+0.0414);//console.log("A is "+A);
		Ram = Ra*A; //console.log("Ram is "+Ram);
    }
    else{		
		if (sessvars.standard == "NBCC"){
			PGA = sessvars.NBCC_PGA;
		}
		else {
			//If standard was ASCE, simply look up the 0th value of the graph just generated.
			PGA = (grabPoint(0))[1];
		}
        SaTf = SdTf*Math.pow((2*Math.PI/Tf),2)/9.81;
        Ra_har = 0;
        r=(PGA/SaTf)*Math.sqrt(a);
        Ra_imp = 8*x*(PGA/SaTf)*1/(2*r);
        Rav = Ra_har+Ra_imp;
        //fprintf('Rav = %g\t Rah = %g\n', Rav, Ra);
        Ram = Math.max(Rav, Ra);
    }


    g = x*Math.PI*(1/Math.sqrt(1-a)+1)/2;
    Rs = calResidualFOen(1-a, muf_cur, 1,g);

    var return_container = {"Ra":Ra,"Rd":Rd,"Rs":Rs,"Rv":Rv,"SdTf":SdTf};
    return return_container;
}

/*LIST CONTROL PORTION OF SPECTRA.HTML (CALLS AND SETUP FOR LIST.JS) */
		function Tf_rightAction(){
			sessvars.currTf = LocalSafeCount(sessvars.currTf,"add",3);
				if (sessvars.dampertype == "hyster"){
					clear_htable();
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');
				}
				else if (sessvars.dampertype=="visco"){
					clear_vtable();
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');					
				}
					//Marking the labels
					document.getElementById('Tf1_label').innerHTML = sessvars.Tf_index[sessvars.currTf-1].toFixed(2)+"s";
					document.getElementById('Tf2_label').innerHTML = sessvars.Tf_index[sessvars.currTf].toFixed(2)+"s";
		}
		
		function Tf_leftAction(){
				sessvars.currTf = LocalSafeCount(sessvars.currTf,"sub",3);
				if (sessvars.dampertype == "hyster"){
					clear_htable();
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');
				}
				else if (sessvars.dampertype == "visco"){
					clear_vtable();
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');					
				}
					//Marking the labels
					document.getElementById('Tf1_label').innerHTML = sessvars.Tf_index[sessvars.currTf-1].toFixed(2)+"s";
					document.getElementById('Tf2_label').innerHTML = sessvars.Tf_index[sessvars.currTf].toFixed(2)+"s";		
		}
		
		function Vf_rightAction(){
				sessvars.currVf = LocalSafeCount(sessvars.currVf,"add",3);
				if (sessvars.dampertype == "hyster"){
					clear_htable();
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');
				}
				else if (sessvars.dampertype=="visco"){
					clear_vtable();
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');					
				}
					//Marking the labels
					document.getElementById('Vf1_label').innerHTML = ((sessvars.Vf_index[sessvars.currVf-1]*100).toFixed(2))+"%";
					
					document.getElementById('Vf2_label').innerHTML = ((sessvars.Vf_index[sessvars.currVf]*100).toFixed(2))+"%";				
		}
		
		function Vf_leftAction(){
				sessvars.currVf = LocalSafeCount(sessvars.currVf,"sub",3);
				if (sessvars.dampertype == "hyster"){
					clear_htable();
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					hyst_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					hyst_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');
				}
				else if (sessvars.dampertype =="visco"){
					clear_vtable();
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf-1],'#placeholder');
					visc_graph(sessvars.Tf_index[sessvars.currTf-1],sessvars.Vf_index[sessvars.currVf],'#placeholder2');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf-1],'#placeholder3');
					visc_graph(sessvars.Tf_index[sessvars.currTf],sessvars.Vf_index[sessvars.currVf],'#placeholder4');					
				}
				
					//Marking the labels
					document.getElementById('Vf1_label').innerHTML = (sessvars.Vf_index[sessvars.currVf-1]*100).toFixed(2)+"%";
					document.getElementById('Vf2_label').innerHTML = (sessvars.Vf_index[sessvars.currVf]*100).toFixed(2)+"%";	
		}
		


/*GRAPHING AND CONTROL PORTION OF SPECTRA.HTML*/
		sessvars.Tf_index = numeric.linspace(sessvars.Tfmin,sessvars.Tfmax,6);
		sessvars.Vf_index = numeric.linspace(sessvars.Vmin,sessvars.Vmax,6);
		

function LocalSafeCount(val,op,limit){
			if (op == "add"){
				if (val>=limit){
					;
				}
				else{
					val = val + 1;
				}
			}
			if (op == "sub"){
				if (val<=1){
					;
				}
				else{
					val = val - 1;
				}
			}
			
	return val;		
}

panning_h = false;
panning = false;
			function visc_graph(Tf, Vf,placeholder_id)
			{
				var placeholder = $(placeholder_id);
				//Check logic!!!
				var intervals = 5;//for alpha use 4 --> This used to be 20.
				var d1 = [];
				var temp = Math.pow((Tf/(2*Math.PI)),2);
				var SaTf_temp = (grabPoint(Tf)[1]);
				
				
				var x_inter = [0,0.05,0.1,0.2,0.3,0.4];
				//var x_inter = numeric.linspace(0,0.4,intervals);
				var a_inter = [0.5,0.75,0.99];
				printout = a_inter;
				var d0 = [];
				var d1 = [];
				var d2 = [];
				var d3 = [];
				var d4 = [];
				var d5 = [];
				var d6 = [];
				var d7 = [];
				
				var dr0 = [];
				var dr1 = [];
				var dr2 = [];
				var dr3 = [];
				var dr4 = [];
				var dr5 = [];	
				var dr6 = [];				
				
				
				var dict_var = {};
				var dict2_var = {};
				

				
				for (var i = 0; i < a_inter.length; i += 1) {
					//Initializing dictionary
					dict_var[a_inter[i]] = [];
					dict2_var[a_inter[i]] = [];
					for (var j = 0; j < x_inter.length; j+=1){
						var alpha = a_inter[i];
						var x = x_inter[j];
						var temp = visc_SPECTRA(alpha, x, Tf, Vf,SaTf_temp,42,2,2,2);//42 is irrelevant!		
						var Ra = temp["Ra"];
						var Rd = temp["Rd"];
						var Rs = temp["Rs"];
						var Rv = temp["Rv"];
						var SdTf_temp = temp["SdTf"];
						//d1.push([Rd, Ra]);						
						
						var object = {
							Ra: parseFloat(Ra.toFixed(2)),
							Rd: parseFloat(Rd.toFixed(2)),
							Rs: parseFloat(Rs.toFixed(2)),
							Rv: parseFloat(Rv.toFixed(2)),
							Tf: parseFloat(Tf.toFixed(2)),
							Vf: parseFloat(Vf.toFixed(2)),
							SdTf: parseFloat(SdTf_temp.toFixed(2)),
							x: x,
							alpha: alpha
						}
						
						visco_points_table.push(object);
						
						if (Rd > 4){
							alert("Beep, beep: alpha:" + alpha + "\nSaTf: " + SdTf_temp +"\nTf: " + Tf + "\nVf: " + Vf + "\nC: " + x+ "\nRa: "+Ra+ "\nRd: "+Rd);
						}
						
						
						if (j == 0){d0.push([Rd,Ra]);dr0.push([Rd,Rs]);}
						if (j == 1){d1.push([Rd,Ra]);dr1.push([Rd,Rs]);}
						if (j == 2){d2.push([Rd,Ra]);dr2.push([Rd,Rs]);}
						if (j == 3){d3.push([Rd,Ra]);dr3.push([Rd,Rs]);}
						if (j == 4){d4.push([Rd,Ra]);dr4.push([Rd,Rs]);}
						if (j == 5){d5.push([Rd,Ra]);dr5.push([Rd,Rs]);}
						if (j == 6){d6.push([Rd,Ra]);dr6.push([Rd,Rs]);}
						if (j == 7){d7.push([Rd,Ra]);dr7.push([Rd,Rs]);}
						
						dict_var[alpha].push([Rd,Ra]);
						dict2_var[alpha].push([Rd,Rs]);
					}

				}
				
			global_temp = dict_var;
			global_temp2 = dict_var[a_inter[2]];
				//Defined in control script
				//var spectraplot = $.plot("#placeholder", [d1] );
			var plot = $.plot(placeholder, [{data:dict_var[a_inter[2]],label:"x: 0 y: 0",
								color: 'white',
								lines: { show: true, lineWidth:3 },
								points: { show: false },
								},
								{
									data:d0,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d1,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d2,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d3,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d4,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d5,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d6,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr0,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr1,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr2,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr3,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr4,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr5,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dr6,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},/*,
								{
									data:d7,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},*/
								{
									data:dict_var[a_inter[0]],
									lines: { show: true , lineWidth:3},
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[1]],
									lines: { show: true, lineWidth:3 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[2]],
									lines: { show: true, lineWidth:3 },
									color: '#white',
									points: { show: false },								
								},
								{
									data:dict2_var[a_inter[0]],
									lines: { show: true , lineWidth:1},
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict2_var[a_inter[1]],
									lines: { show: true , lineWidth:1},
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict2_var[a_inter[2]],
									lines: { show: true , lineWidth:1},
									color: 'white',
									points: { show: false },								
								},/*,
								{
									data:dict_var[a_inter[3]],
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[4]],
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[5]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[6]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[7]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								}*/
								],
								{
								crosshair:{mode:"xy",color:'white',lineWidth:2},								
								xaxes: [{position:'bottom',min:-0.10,max:1.15,axisLabel:'Rd'}],
								yaxes: [{position:'left',axisLabel:'Ra'}],
								pan:{interactive:true},
								grid:{hoverable:true,color:'white',clickable:true,mouseActiveRadius:10}								
								});			
					$('.xaxisLabel').css('color','white');
					$('.xaxisLabel').css('font-size','1.2em');

					$('.yaxisLabel').css('color','white');
					$('.xaxisLabel').css('font-size','1.2em');
				
				
				 var updateLegendTimeout = null;

				 
				 function updateLegend(x,y){
						var series = (plot.getData())[0];
						var legends = $(placeholder_id+ ".legendLabel");
						series.label ="x: " + (x)+" y: "+ (y);
						plot.setupGrid();
						clearTimeout(updateLegendTimeout);
				 }	
				 
				 

				var previousPoint = null;				 
				placeholder.bind("plothover",  function (event, pos, item) {
						if (item){
							local_x = item.datapoint[0].toFixed(2);
							local_y = item.datapoint[1].toFixed(2);
							//console.log(local_x);console.log(local_y);
							//console.log('This is the data' + plot.getData().data);
							
							if (!updateLegendTimeout){
								updateLegendTimeout = setTimeout(updateLegend(local_x,local_y), 1000);
								updateLegendTimeout = null;
							}
						}
						else{
							var closest_points_container = interpolate(plot,pos.x,pos.y);
							//Now getting the value from these and finding the totals.
							
							var p1 = lookupTable(visco_points_table, closest_points_container.least[0].toFixed(2), closest_points_container.least[1].toFixed(2));
							var p2 = lookupTable(visco_points_table, closest_points_container.second_least[0].toFixed(2), closest_points_container.second_least[1].toFixed(2));							


							
							if ( (p1!="no-match") && (p2!="no-match") ){
								console.log(p1);	
								console.log(p2);
								
									
								sessvars.fuck_all = [[p1.Rd,p1.Ra],[p2.Rd,p2.Ra]];//COME BACK HERE YOU CUNT
								
								
								var interpolated_obj = AverageObject(p1,p2);
								
								sessvars.interpolated_obj = interpolated_obj;
								
								if (!updateLegendTimeout){
									updateLegendTimeout = setTimeout(updateLegend(interpolated_obj.Rd.toFixed(2),interpolated_obj.Ra.toFixed(2)), 1000);
									updateLegendTimeout = null;
								}								
							}
							
							
						}
									
						

							
				});
				// show pan/zoom messages to illustrate events 
				placeholder.bind('plotpan', function (event, plot) {
					var axes = plot.getAxes();
				});
							  
				$("<i class='icon-plus-sign xbutton' style='font-size:20px;right:50px;top:40px'></i>")
					.appendTo(placeholder)
					.click(function (event) {
							event.preventDefault();
							plot.zoom();
					});
										
				$("<i class='icon-minus-sign xbutton' style='font-size:20px;right:20px;top:40px'></i>")
					.appendTo(placeholder)
					.click(function (event) {
							event.preventDefault();
							plot.zoomOut();
					});

				panning = false;				
				$(placeholder_id+' canvas').bind('drag',function(){

				panning = true; 
				});
				
				$(placeholder_id+' canvas').bind('dragend',function(){
					function stopPan(){
						panning = false;
					}
					setTimeout(stopPan, 100);
   			    });  
			}
				
			function hyst_graph(Tf, Vf,placeholder_id)
			{

				var placeholder = $(placeholder_id);
				var mud_intervals = 5;//for alpha use 4 --> This used to be 20.
				//Each of the following is a container for a curve on the spectrum. 
				var d0 = [];
				var d1 = [];
				var d2 = [];
				var d3 = [];
				var d4 = [];
				
				var dr0 = [];
				var dr1 = [];
				var dr2 = [];
				var dr3 = [];
				var dr4 = [];
				
				var temp = Math.pow((Tf/(2*Math.PI)),2);
				var SdTf_temp = (grabPoint(Tf)[1])*(temp)*9.81;
				sessvars.SdTf = SdTf_temp;
				//Changed to scopeless so that I can access in plot. 
				alpha_intervals = numeric.linspace(0.1,0.6,mud_intervals);
				
				var mud_array = [1,2,5,10,20];
				var dick_var = {};
				dick2_var = {};
				
				for (var i = 0; i < mud_intervals; i += 1) {
					var alpha = alpha_intervals[i];
					
					//Initializing dictionary
					dick_var[alpha] = [];
					dick2_var[alpha] = [];
					
					for  (var j = 0; j < mud_array.length; j += 1){
						
						var temp = hyst_SPECTRA(alpha, mud_array[j], Tf, Vf, SdTf_temp, 42, 2);//42 is irrelevant! 4 is SdTf
						var Ra = temp["Ra"];
						var Rd = temp["Rd"];	
						var Rs = temp["Rs"];
						var Rv = temp["Rv"]
						
						var object = {
							Ra: parseFloat(Ra.toFixed(2)),
							Rd: parseFloat(Rd.toFixed(2)),
							Rs: parseFloat(Rs.toFixed(2)),
							Rv: parseFloat(Rv.toFixed(2)),
							Tf: parseFloat(Tf.toFixed(2)),
							Vf: parseFloat(Vf.toFixed(2)),
							SdTf: parseFloat(SdTf_temp.toFixed(2)),
							mud: parseFloat(mud_array[j]),
							alpha: parseFloat(alpha)
						}
						
						hysteretic_points_table.push(object);
						
						if (j == 0){
							d0.push([Rd, Ra]);
							dr0.push([Rd, Rs]);
						}
						else if (j == 1){
							d1.push([Rd, Ra]);
							dr1.push([Rd, Rs]);
						}
						else if (j == 2){
							d2.push([Rd, Ra]);
							dr2.push([Rd, Rs]);
						}
						else if (j == 3){
							d3.push([Rd, Ra]);
							dr3.push([Rd, Rs]);
						}
						else if (j == 4){
							d4.push([Rd, Ra]);
							dr4.push([Rd, Rs]);
						}

						dick_var[alpha].push([Rd,Ra]);
						dick2_var[alpha].push([Rd,Rs]);
					}
				}
				//Defined in control script
				//var spectraplot = $.plot("#placeholder", [d1] );
			
			var plot = $.plot(placeholder,
								[
								{	data:d0,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },
								},
								{
									data:d1,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d2,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d3,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:d4,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},/*
								{
									data:dr0,
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dr1,
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dr2,
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dr3,
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dr4,
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},*/
								{
									data:dick_var[alpha_intervals[0]],
									lines: { show: true, lineWidth:3 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[1]],
									lines: { show: true , lineWidth:3 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[2]],
									lines: { show: true, lineWidth:3 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[3]],
									lineWidth:3,
									lines: { show: true, lineWidth:3 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[4]],
									lineWidth:3,
									lines: { show: true, lineWidth:3 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick2_var[alpha_intervals[0]],
									lines: { show: true, lineWidth:1 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick2_var[alpha_intervals[1]],
									lines: { show: true, lineWidth:1 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick2_var[alpha_intervals[2]],
									lines: { show: true, lineWidth:1 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick2_var[alpha_intervals[3]],
									lines: { show: true, lineWidth:1 },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dick2_var[alpha_intervals[4]],
									lines: { show: true, lineWidth:1 },
									color: 'white',
									points: { show: false },								
								}									
								],
								{
								crosshair:{mode:"xy",color:'white',lineWidth:2},								
								xaxes: [{position:'bottom',min:-0.10,max:1.15,axisLabel:'Rd'}],
								yaxes: [{position:'left',axisLabel:'Ra'}],
								pan:{interactive:true},
								grid:{hoverable:true,color:'white',clickable:true,mouseActiveRadius:10}
								});			
										
					$('.xaxisLabel').css('color','white');
					$('.xaxisLabel').css('font-size','1.2em');

					$('.yaxisLabel').css('color','white');
					$('.xaxisLabel').css('font-size','1.2em');
			
				var legends = $(placeholder_id+ ".legendLabel");
				
				
					
				 var updateLegendTimeout = null;
				 var latestPosition = null;
				 function updateLegend(x,y){
						var series = (plot.getData())[0];
						var legends = $(placeholder_id+ ".legendLabel");
						series.label ="x: " + (x)+" y: "+ (y);
						//console.log("x is" + x);
						plot.setupGrid();
						clearTimeout(updateLegendTimeout);
						
						//console.log("THIS IS THE NEAREST POINT" + plot.findNearbyItem());
				}	
				 

				placeholder.bind("plothover",  function (event, pos, item) {
						if (item){
							local_x = item.datapoint[0].toFixed(2);
							local_y = item.datapoint[1].toFixed(2);
							
							if (!updateLegendTimeout){
								updateLegendTimeout = setTimeout(updateLegend(local_x,local_y), 1000);
								updateLegendTimeout = null;
							}
						}
						else{
							
							var closest_points_container = interpolate(plot,pos.x,pos.y);
							console.log(closest_points_container);
							//Now getting the value from these and finding the totals.
							var p1 = lookupTable(hysteretic_points_table, closest_points_container.least[0].toFixed(2), closest_points_container.least[1].toFixed(2));
							var p2 = lookupTable(hysteretic_points_table, closest_points_container.second_least[0].toFixed(2), closest_points_container.second_least[1].toFixed(2));							

							
							if ( (p1!="no-match") && (p2!="no-match") ){
								console.log(p1);	
								console.log(p2);
								
								var interpolated_obj = AverageObject(p1,p2);
								
								sessvars.interpolated_obj = interpolated_obj;
								
								if (!updateLegendTimeout){
									updateLegendTimeout = setTimeout(updateLegend(interpolated_obj.Rd.toFixed(2),interpolated_obj.Ra.toFixed(2)), 1000);
									updateLegendTimeout = null;
								}								
							}
							
							
						}
				});
							
							// show pan/zoom messages to illustrate events 
							  placeholder.bind('plotpan', function (event, plot) {
								var axes = plot.getAxes();
							  });
							  
							  		$("<i class='icon-plus-sign xbutton' style='font-size:20px;right:50px;top:40px'></i>")
										.appendTo(placeholder)
										.click(function (event) {
											event.preventDefault();
											plot.zoom();
										});
										
									$("<i class='icon-minus-sign xbutton' style='font-size:20px;right:20px;top:40px'></i>")
										.appendTo(placeholder)
										.click(function (event) {
											event.preventDefault();
											plot.zoomOut();
										});

								panning_h = false;
							  $(placeholder_id+' canvas').bind('drag',function(){
								panning_h = true; 
							  });
							  $(placeholder_id+' canvas').bind('dragend',function(){
							  	function stopPan(){
									panning_h = false;
								}
								setTimeout(stopPan, 100);
							 });  
			}
			
				

			$(document).ready(function() {
			
			var options;
			sessvars.interpolated_obj="";
			if (sessvars.dampertype == "hyster"){
				var name_temp = "&mu;"+"d".sub();
				$('#third_param').html(name_temp);
				options = {
					valueNames: [ 'id', 'Rv', 'Ra', 'Rs','third_param', 'Tf', 'Vf' ]
				};
			}
			else if (sessvars.dampertype == "visco"){
				var name_temp = "&epsilon;";
				$('#third_param').html(name_temp);
				options = {
					valueNames: [ 'id', 'Rv', 'Ra', 'Rs','third_param', 'Tf', 'Vf' ]
				};				
			}
			
			// Init list
			var contactList = new List('contacts', options);
			//alert('Fixes made, bitches fucked.');
			
			var editBtn = $('#edit-btn').hide(),
				removeBtns = $('.remove-item-btn'),
				editBtns = $('.edit-item-btn');
			// Sets callbacks to the buttons in the list
			
			function refreshCallbacks() {
				// Needed to add new buttons to jQuery-extended object
				removeBtns = $(removeBtns.selector);
				editBtns = $(editBtns.selector);
				removeBtns.click(function() {
				   var itemId = $(this).closest('tr').find('.id').text();
				   console.log(itemId);
				   contactList.remove('id', itemId);
				});
			}
			refreshCallbacks();
			
			if (typeof sessvars.DesignContainer === 'undefined'){
				sessvars.DesignContainer = [];
			}
			else{
			/*Design Container isn't empty, load them into table*/
			
			
			function loadTable(){
				for (var i = 0; i < sessvars.DesignContainer.length; i++){
						var pointObject = lookupTable(sessvars.table,sessvars.DesignContainer[i][0],sessvars.DesignContainer[i][1]);
						console.log(pointObject);
						contactList.add({id: Math.floor(Math.random()*110000),Rv: (sessvars.DesignContainer[i][0]).toFixed(2),Ra: (sessvars.DesignContainer[i][1]).toFixed(2),Rs: (pointObject.Rs).toFixed(2)});
				}
			}			
			loadTable();
			refreshCallbacks();

			}
				//Info pop-ups		
				var globalDesignCount = 0;
				var validPoint = false; //Not valid if plot of residual graph
				var previousPoint = null;
				var d_char = 'd';
				$("#placeholder,#placeholder2,#placeholder3,#placeholder4").bind("plothover", function (event, pos, item) {
					if (item) {
						if (previousPoint != item.dataIndex) {
							previousPoint = item.dataIndex;
							
							$("#tooltip").remove();
							var x = item.datapoint[0].toFixed(2),
								y = item.datapoint[1].toFixed(2);
								
							//Look-up table calls
							if (sessvars.dampertype == "hyster"){
								var it = lookupTable(hysteretic_points_table,x,y);
								showTooltip(item.pageX, item.pageY,"&alpha; : " + it.alpha.toFixed(2) + " &mu;"+d_char.sub()+": " + it.mud.toFixed(2));
							}
							else if (sessvars.dampertype == "visco"){
								var it = lookupTable(visco_points_table,x,y);
								showTooltip(item.pageX, item.pageY,"&alpha; " + it.alpha.toFixed(2) + " &epsilon;: " + it.x.toFixed(2));
							}
							
						}
					}
					else {
						if(typeof (sessvars.interpolated_obj === 'undefined') || (sessvars.interpolated_obj = "")){
						   ;
						 }					
						else if (sessvars.dampertype == "hyster"){
							$("#tooltip").remove();
							showTooltip(pos.pageX, pos.pageY,"&alpha; " + sessvars.interpolated_obj.alpha.toFixed(2) + " &mu;"+d_char.sub()+": " +  sessvars.interpolated_obj.mud.toFixed(2));
							previousPoint = null;
						}
						else if (sessvars.dampertype =="visco"){
							$("#tooltip").remove();
							showTooltip(pos.pageX, pos.pageY,"&alpha; " + sessvars.interpolated_obj.alpha.toFixed(2) + " &epsilon;: " +  sessvars.interpolated_obj.x.toFixed(2));
							previousPoint = null;						 
						}
						
					}					
				});
				$("#placeholder,#placeholder2,#placeholder3,#placeholder4").bind("plotclick", function (event, pos, item) {
					
					var temp;
					if (sessvars.dampertype =="hyster"){temp = panning_h;}
					else {temp = panning;}
					
					if (!temp){
						globalDesignCount+=1;
						 
						 var pointObject;
						 if (sessvars.dampertype == "hyster"){
							if (item){
								pointObject = lookupTable(hysteretic_points_table, local_x, local_y);
								sessvars.table = hysteretic_points_table;
							}
							else{
								pointObject = sessvars.interpolated_obj;
								hysteretic_points_table.push(pointObject);
								sessvars.table = hysteretic_points_table;
							}						 
						 }
						 else if (sessvars.dampertype == "visco"){
							if (item){
								pointObject = lookupTable(visco_points_table, local_x, local_y);
								sessvars.table = visco_points_table;
							}
							else{
								pointObject = sessvars.interpolated_obj;
								visco_points_table.push(pointObject);
								sessvars.table = visco_points_table;								
							}
						}
						 								
						//The following uses the deduction that no (x,y) pair of the residual pair can be looked up in the table.
						//Arbitary no-match check
						if (pointObject != "no-match"){
							if (sessvars.dampertype == "hyster"){
								contactList.add({id: Math.floor(Math.random()*110000),Rv: pointObject.Rd.toFixed(2),Ra: pointObject.Ra.toFixed(2),Rs: pointObject.Rs.toFixed(2), alpha: pointObject.alpha.toFixed(2),third_param: pointObject.mud.toFixed(2),Tf: pointObject.Tf.toFixed(2),Vf: (pointObject.Vf.toFixed(2))*100+"%"});
							}
							else if (sessvars.dampertype == "visco"){
								contactList.add({id: Math.floor(Math.random()*110000),Rv: pointObject.Rd.toFixed(2),Ra: pointObject.Ra.toFixed(2),Rs: pointObject.Rs.toFixed(2), alpha: pointObject.alpha.toFixed(2),third_param: pointObject.x.toFixed(2),Tf: pointObject.Tf.toFixed(2), Vf: (pointObject.Vf.toFixed(2))*100+"%"});
							}
							
							refreshCallbacks();
							sessvars.DesignContainer.push([pointObject.Rd,pointObject.Ra]);
							sessvars.table.push(pointObject);
							//alert(pointObject);

						}
					}
				});	
			
				sessvars.currTf = 1;
				sessvars.currVf = 1;
				
				
				//Marking the labels
				document.getElementById('Tf1_label').innerHTML = sessvars.Tf_index[0].toFixed(2)+"s";
				document.getElementById('Tf2_label').innerHTML = sessvars.Tf_index[1].toFixed(2)+"s";
				
				document.getElementById('Vf1_label').innerHTML = (sessvars.Vf_index[0]*100).toFixed(2)+"%";
				document.getElementById('Vf2_label').innerHTML = (sessvars.Vf_index[1]*100).toFixed(2)+"%";
				
				if (sessvars.dampertype == "hyster"){
					clear_htable();
					hyst_graph(sessvars.Tf_index[0],sessvars.Vf_index[0],'#placeholder');
					hyst_graph(sessvars.Tf_index[0],sessvars.Vf_index[1],'#placeholder2');
					hyst_graph(sessvars.Tf_index[1],sessvars.Vf_index[0],'#placeholder3');
					hyst_graph(sessvars.Tf_index[1],sessvars.Vf_index[1],'#placeholder4');
				}
				else{
					clear_vtable();
					visc_graph(sessvars.Tf_index[0],sessvars.Vf_index[0],'#placeholder');
					visc_graph(sessvars.Tf_index[0],sessvars.Vf_index[1],'#placeholder2');
					visc_graph(sessvars.Tf_index[1],sessvars.Vf_index[0],'#placeholder3');
					visc_graph(sessvars.Tf_index[1],sessvars.Vf_index[1],'#placeholder4');
				}	
			});