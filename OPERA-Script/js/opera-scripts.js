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
			var temp = getPoint(sessvars.NBCCPayload[1][0],sessvars.NBCCPayload[1][1],sessvars.NBCCPayload[2][0],sessvars.NBCCPayload[2][1],x);
			return [x,temp];
		}
		else if ((x >= sessvars.ASCEPayload[2][0]) && (x <= 1)){
			var temp = getPoint(sessvars.NBCCPayload[2][0],sessvars.NBCCPayload[2][1],sessvars.NBCCPayload[3][0],sessvars.NBCCPayload[3][1],x);
			return [x,temp];
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

    cont_flag = 1;
    pr = p;
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

    Rsm = calMaxResidual(p, mu1, mu2, 1);
    if (Rsf_bl>Rsm){
        Rsf_bl = Rsm;
    }

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
function hyst_SPECTRA(a, mu_d, Tf, Vf, SdTf, EQ, option1)
{
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

    var converge = 0;
    var tol = 0.01;
    var numb_iter = 0;
    var muf_cur = 1;

    while (!converge){
        numb_iter = numb_iter + 1;
        //step2: compute Teff
        Teff = Tf*Math.sqrt(a*mud/(1-a+a*(mud/muf_cur)));
        if (Teff>4){
            Teff_flag=1;}
        else{
            Teff_flag=0;}
        Ti = Tf*Math.sqrt(a);
        //step3: compute Xeff
        I1 = 1/a*Math.log((1-a+a*(mud/muf_cur))/(Math.pow((mud/muf_cur),a)));
        theta = 2;
        I2 = mud*(1-1/muf_cur)-(a*Math.pow(mud,2)+(1-a)*Math.pow(muf_cur,2))/(a*mud*muf_cur+(1-a)*Math.pow(muf_cur,2))*Math.log(muf_cur);
        Xeff = 2/Math.PI/mud*(I1+I2)*theta;

        //Step4: compute DT
        if (option1 == 1) {
            np = 20;
            Spa = 0.5;
            //Spa = AvgSaU(Tf, mud, muf_cur, a, EQ, np)*9.81; ---> GOT TO FIX THIS LINE!
        }
        else{
			SaTi = grabPoint(Ti)[1];
            SaTe = grabPoint(Teff)[1];
            SaTf = grabPoint(Tf)[1];

            alp=1;
            b1 = 22.2;
            b2 = 8.2;
            fa = 0.5*Math.exp(-(Math.pow((mud-1),(alp/b1))));
            fb = 0.5-0.5*Math.exp(-(Math.pow((mud-1),alp/b2)));

            fc=1-fa-fb;
            Spa = (fa*SaTi+fb*SaTf+fc*SaTe)*9.81;
        }
    SdTeff = Spa*Math.pow((Teff/2/Math.PI),2);
    DT = SdTeff/SdTf;

    //%step5: computer Da
    Da = Math.exp(-1.35*Math.pow(Xeff,0.5));

    //%step6: compute Rv
    Rd_trial = DT*Da;

    if (option1 ==1)
    {
        //fprintf('iteration %g: muf = %g\t Ti = %g\t Teff = %g\t fa = %g\t fb = %g\t sati = %g\t satf = %g\t sate = %g\t SaU = %g\t RdT = %g I1 = %g\t I2 = %g\t Xeff = %g\t Rdx = %g\t Rd = %g\t muf = %g\n', numb_iter, muf_cur, Ti, Teff, fa, fb, SaTi, SaTf, SaTe, Spa, DT, I1, I2, Xeff, Da, Rd_trial,Rd_trial/Vf);
    }
    else
    {
    // fprintf('iteration %g: muf = %g\t Ti = %g\t Teff = %g\t SaU = %g\t RdT = %g I1 = %g\t I2 = %g\t Xeff = %g\t Rdx = %g\t Rd = %g\t muf = %g\n', numb_iter, muf_cur, Ti, Teff, Spa, DT, I1, I2, Xeff, Da, Rd_trial,Rd_trial/Vf);
    }

    //%step7: compute muf
    muf_next = Rd_trial/Vf;
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
   //fprintf('Rdp Rvp Rap Rsp = %g %g %g %g\n', Rd, Rv, Ra, Rs);

    var return_container = {"Rv":Rv,"Ra":Ra,"Rd":Rd};
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

function visc_SPECTRA(a,x,Tf,Vf,SdTf,EQ,option1,option2,option3){
    var converge = 0;
    var tol = 0.01;
    var numb_iter = 0;

    if (a==1) {
        a = 0.999;
    }

    var k = (1-a)/a;

    //Step 1: Guess mu_f
    var muf_cur = 1;

    while (!converge)
    {
        numb_iter = numb_iter + 1;

        //Step 2: Compute Teff
        Teff = Tf*Math.sqrt(a/(1-a+a/muf_cur));
        //Track if Teff > 4
        if (Teff>4)
        {
            Teff_flag = 1;
        }
        else{
            Teff_flag = 0;
        }

        Ti = Tf*Math.sqrt(a);
        //Step 3: Compute Xeff
        I1 = (Math.sqrt(k*muf_cur*(k*muf_cur+1)) - Math.sqrt(k*(k+1)) - Math.log ((Math.sqrt(k*muf_cur+1) + Math.sqrt(k*muf_cur))/(Math.sqrt(k+1) + Math.sqrt(k))))/Math.pow(k,1.5);
        theta = 2;
        I2 = ((k+1)/k)*Math.log((k*muf_cur+1)/(k+1))   - Math.log(muf_cur);
        Xeff = x*Math.sqrt(a)+1/muf_cur*(x*I1+2/Math.PI*theta*I2);

        //Step 4: Compute DT
        if (option1 == 1)
        {
           np = 20;
            Spa = 0.5;
           //Spa = AvgSaU_VE(Tf,muf_cur,x,a, EQ, np)*9.81;
        }
        else{
            SaTe = 1;
            Sati = 2;
            Spa = 3;
        }

        SdTeff = Spa*Math.pow((Teff/2/Math.PI),2);
        DT = SdTeff/SdTf;

        //Step 5: Compute Da
        Da = Math.exp(-1.35*Math.pow(Xeff,0.50));


        //Step 6: Compute Rv
        Rd_trial = DT*Da;

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
            Rae = (Rd/a*Math.sqrt(Math.pow(1+(2*Math.sqrt(a)*x)),2));
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
                u1 = 1/Math.sqrt(1+Math.pow((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma))),2));
                u2 = 1/Math.sqrt(1+Math.pow((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma))/(1-a)),2));
                uhat = 2/muf-gamma;
                if (u1<=uhat){
                    Ra = Rd*(gamma-1/muf+1/a*Math.sqrt(1+Math.pow((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma))),2)));}
                else if (u2>=uhat){
                Ra=Vf+ Rd/a*Math.sqrt(Math.pow((1-a),2)+Math.pow(((2*x*Math.sqrt(a)*Math.sqrt(1-a+a/muf)*Math.sqrt(2/(1+gamma)))),2));}
                else{
                Ra = Rd*(gamma-1/muf+1/a*(2/muf-gamma)+2*x*Math.sqrt((1-a+a/muf)/a)*Math.sqrt(2/(1+gamma))*Math.sqrt(1-Math.pow((2/muf-gamma),2)));}
            }
        }
    }

    if (option3 == 1){
        //Tcen = PSTcen(Teff, EQ); //compute the mean response period ============>MUST BE FIXED
        Tcen = 0.5;
        R = Tcen/Teff;
        A = 1+(x)/(520*Math.pow(R,5)+0.1);
        Ram = Ra*A;
    }
    else if (option3 == 2){
        //Not considering this option
    }
    else{
        PGA = grabPoint(0)[1]; 
        SaTf = SdTf*Math.pow((2*pi/Tf),2)/9.81;
        Ra_har = 0;
        r=(PGA/SaTf)*Math.sqrt(a);
        Ra_imp = 8*x*(PGA/SaTf)*1/(2*r);
        Rav = Ra_har+Ra_imp;
        //fprintf('Rav = %g\t Rah = %g\n', Rav, Ra);
        Ram = Math.max(Rav, Ra);
    }


    g = x*Math.PI*(1/Math.sqrt(1-a)+1)/2;
    Rs = calResidualFOen(1-a, muf_cur, 1,g);

    var return_container = {"Ra":Ra,"Rd":Rd};
    return return_container;
}
