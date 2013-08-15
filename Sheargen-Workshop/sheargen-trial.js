//n -> number of storeys

function sheargen(Tf,Vf,alpha, mu,Rd,Rv,n,SdTf){
	// index1,2,3,4 = Tf, Vf, alpha, mu
	// basic parameters
	var BadDistrFlag = 0; //flag indicating whether frame has good stiffness distr.
	var AltStiffFlag = 0;
	
	/*
	var Tf = 0.5*index1;
	var Vf = 0.1*index2;
	*/
	
	var alpha;
	if (sessvars.damperType == "hyster"){
			//alpha = 0.2*index3; //for hysteretic use 0.2, 0.4 and 0.6 //Shouldn' this be an input parameter?
		}
	else{
		//alpha = 0.25+0.25*index3; //for VE use 0.5, 0.75 and 1.0
		if (alpha == 1){
				VoverKd = 0;
			}
		else{
				VoverKd = Number.POSITIVE_INFINITY;
			}
	}

	//mu = 2*index4;
	/*
	var mu =10*index4;
	var xi = 0.1*index4;
	*/
	var xi = 0.1*mu; //THIS IS TEMPORARY, TO COAX OUTPUT. 
	var muf = Rd/Vf;
	var mus = Rv/(Vf^2/Rd+(Rv-Vf)/mu);
	if (mus <= 1){
		mus = 1;
	}
	if (alpha == 1){
		alpha = 0.999999; //so we can use same distribution formula for viscous
	}

	var m = [];
	var phi_f_dummy = [];
	var phi_f = [];
	var phi_d = [];
	var dphi_f = [];
	var dphi_d = [];
	var dphi_f_dummy = [];
	var Ti = Tf*Math.sqrt(alpha);
	//dynamic properties
	for (i = 0; i<=n; i+=1){
		//S-Type (Benchmark)
		m[i] = 100000;
		phi_f_dummy[i] = i/n;
		phi_f[i] = i/n; //Linear Mode
		
		//L-Type (Frames)
		var konst = 1;
		var dphio = 1/(konst+(konst+1)/2+n-2);
		
		if (i != 1 && i!=2){
			dphi_f[i] = dphio;
			phi_f[i] = phi_f[i-1] + dphi_f[i];
		}
		else if (i==2){
			dphi_f[i] = (konst+1)/2*dphio;
			phi_f[i] = phi_f[i-1] + dphi_f[i];
		}
		else{
			dphi_f[i] = konst*dphio;
			phi_f[i] = dphi_f[i];
		}
		//MATLAB BELOW 
		phi_d[i] = i/n; //design mode shape
		if (i==1){
				dphi_f[i] = phi_f[i];
				dphi_d[i] = phi_d[i];
				dphi_f_dummy[i] = phi_f_dummy[i];
			}
		else{
				dphi_f[i] = phi_f[i]-phi_f[i-1];
				dphi_d[i] = phi_d[i]-phi_d[i-1];
				dphi_f_dummy[i] = phi_f_dummy[i] - phi_f_dummy[i-1];
			}
		
	}

	var sum_mphi_f = [];
	var sum_mphi_d = [];
	var sum_mphi_f_dummy = [];


	//Take off the initializations???

	for (i = 0; i<=n; i+=1){
		var j = n - i+1;
		if (j==n){
				sum_mphi_f[j] = m[j]*phi_f[j];
				sum_mphi_d[j] = m[j]*phi_d[j];
				sum_mphi_f_dummy[j] = m[j]*phi_f_dummy[j];
			}
		else{
			sum_mphi_f[j] = sum_mphi_f[j+1]+m[j]*phi_f[j];
			sum_mphi_d[j] = sum_mphi_d[j+1]+m[j]*phi_d[j];
			sum_mphi_f_dummy[j] = sum_mphi_f_dummy[j+1]+m[j]*phi_f_dummy[j];
		}
	}

	var sum_mphisq_f = 0;
	var sum_mphisq_d = 0;
	var sum_mphisq_f_dummy = 0;

	for (i=0; i<=n;i+=1){
		if (isNaN(Math.pow(phi_f[i],2))) {
			;
		}
		else if (isNaN(Math.pow(phi_f_dummy[i],2))){
			;
		}
		else{
			sum_mphisq_f = sum_mphisq_f+m[i]*Math.pow(phi_f[i],2);		
			sum_mphisq_d = sum_mphisq_d+m[i]*Math.pow(phi_d[i],2);
			sum_mphisq_f_dummy = sum_mphisq_f_dummy+m[i]*Math.pow(phi_f_dummy[i],2);
		}
	}

	var G1_f = sum_mphi_f[1]/sum_mphisq_f;
	var G1_d = sum_mphi_d[1]/sum_mphisq_d;
	var G1_f_dummy = sum_mphi_f_dummy[1]/sum_mphisq_f_dummy;
	var RegIndex = G1_f/G1_f_dummy;
	var M1_f = sum_mphi_f[1]*G1_f;
	var M1_d = sum_mphi_d[1]*G1_d;
	var M1_f_dummy = sum_mphi_f_dummy[1]*G1_f_dummy;
	var GR_f = 1-G1_f;
	var GR_d = 1-G1_d;
	var GR_f_dummy = 1-G1_f_dummy;



	var phiR_f = [];
	var phiR_d = [];
	var phiR_f_dummy = [];
	var dphiR_f = [];
	var dphiR_d = [];
	var dphiR_f_dummy = [];

	for (i=0; i<=n;i+=1){
		phiR_f[i] = 1/GR_f - G1_f/GR_f*phi_f[i];
		phiR_d[i] = 1/GR_d - G1_d/GR_d*phi_d[i];
		phiR_f_dummy[i] = 1/GR_f_dummy - G1_f_dummy/GR_f_dummy*phi_f_dummy[i];
		if (i==1){
			dphiR_f[i]= phiR_f[i];
			dphiR_d[i] = phiR_d[i];
			dphiR_f_dummy[i] = phiR_f_dummy[i];
		}
		else{
			dphiR_f[i] = phiR_f[i]-phiR_f[i-1];
			dphiR_d[i] = phiR_d[i]-phiR_d[i-1];
			dphiR_f_dummy[i] = phiR_f_dummy[i]-phiR_f_dummy[i-1];
		}
	}

	var sum_mphi_f = [];
	var sum_mphi_d = [];

	var sum_mphi_f_dummy = [];
	var dphi_f_dummy = [];


	var dphi_f = [];
	var y_frame = [];
	var y_frame_dummy = [];
	var k_frame = [];
	var k_damper = [];
	var k_frame_dummy = [];
	var k_damper_dummy = [];
	var BadDistrFlag;

	var y_damper = [];
	var Sd = [];

	//Calculate base and damped frame stiffness/strength
	for (i=0; i<=n;i+=1){
	   //stiffnesses
		k_frame[i] = Math.pow((2*Math.PI/Tf),2)*sum_mphi_f[i]/dphi_f[i];
		k_damper[i] = Math.pow((2*Math.PI/Ti),2)*sum_mphi_d[i]/dphi_d[i]-k_frame[i];
		k_frame_dummy[i] = Math.pow((2*Math.PI/Tf),2)*sum_mphi_f_dummy[i]/dphi_f_dummy[i];
		k_damper_dummy[i] = Math.pow((2*Math.PI/Ti),2)*sum_mphi_d[i]/dphi_d[i]-k_frame_dummy[i];
		if (k_damper[i] <=0){
			k_damper[i] = 0;
			BadDistrFlag = 1;
		}
		
		//strengths
		if(i==1){
			//strength of bare frame cal. using first mode
			y_frame[i]=Vf*Sd*Math.pow((2*Math.PI/Tf),2)*M1_f;
			y_frame_dummy[i] = Vf*Sd*Math.pow((2*Math.PI/Tf),2)*M1_f_dummy;
		}
		else{
			y_frame[i]=(y_frame[1]/k_frame[1])*k_frame[i]; //y_frame[i] proportional to k_frame[i]
			y_frame_dummy[i]=(y_frame_dummy[1]/k_frame_dummy[1])*k_frame_dummy[i];
		}
		
		
		if (sessvars.damperType == "hyster"){ 
		  //storey_delta = Rd(index1, index2, index3, index4)*Sd(index1)*G1_d*dphi_d(i)+hm*abs(GR_d*SdR(index1)*dphiR_d(i)); --> What's going on here...
		  //y_damper(i) = (storey_delta)*k_damper_dummy(i)/mu + y_frame_dummy(i) - y_frame(i);
			if (k_damper[i] <= 0){
				console.log('Error: damper stiffness negative! Modify structure.\n');
				y_damper[i] = 0;
				BadDistrFlag = 1;
			}
			if (y_damper[i]<0){
				console.log('Error: damper strength negative! Modify structure.\n');
				y_damper[i] = 0;
				BadDistrFlag = 2;
			}
			
			if (hm == 1){
				//check whether strength is greater than 80// of bottom
				if (i>1){
					if (y_damper[i] <0.8*y_damper[i-1]){
						y_damper[i] = 0.8*y_damper[i-1];
					}
				}
			}
			else
				//VE dampers
				y_damper[i] = Number.POSITIVE_INFINITY;
			}
	}
	//Creating the arrays for next section: 
	var K_frame = [];var K_damper = [];
	var V_frame = [];var V_damper = [];
	
	/*
	for(var i=0; i<=4; i++) {
		// create new nested arrays
		K_frame[i] = [];
		K_damper[i] = [];
		V_frame[i] = [];
		V_damper[i] = [];
		for(var j=0; j<=4; j++) {
			// populate nested arrays
			K_frame[i][j] = j;
			K_damper[i][j] = j;
			V_frame[i][j] = j;
			V_damper[i][j] = j;    
		}
	}
	*/
	
	/*
	//CONSTRUCT STIFFNESS AND YIELD VECTOR
	for (i=0; i<=n;i+=1){
		K_frame[i] = k_frame[i];
		K_damper[i] = k_damper[i];            
		V_frame[index1][index2][index3][index4][i] = y_frame[i];
		V_damper[index1][index2][index3][index4][i] = y_damper[i];
	}*/

	/*
	var M = [];
	for(var i=0; i<2; i++) {
		// create new nested arrays
		M[i] = [];
		for(var j=0; j<2; j++) {
			// populate nested arrays
			M[i][j] = j;
		}
	}

	//mass matrix
	for (var row=1; row<=n;row+=1){
	   for (var col=row; col<=n;col+=1){
			if (col == row){
				M[row][col] = m[row];
			}
			else{
				M[row][col] = 0;
				M[col][row] = 0;
			}
		}
	}*/

	var rayleigh; //WHERE DOES THE INPUT FOR THIS VARIABLE COME FROM
	//INPUT VISCOUS DAMPING
	if (sessvars.damperType == "hyster"){ //it was 0.
			rayleigh = 1;
		}
	else{
			rayleigh = 0;
	}

	//damping
	var xi1;
	var high_mode;
	var xim;
	var sum_dphisq_f_kd;
	var sum_dphisq_f;

	if (rayleigh == 1){
			//rayleigh damp in percentage critical
			xi1 = 0.05;
			high_mode = parseInt(n*2/3)+1; //All you wanted to do was cast to type int yes?
			xim = 0.05;
			//df_count = 1;
			//df(1) = 1;
		}
	else{
		////5// inherent damping
		xi1 = 0.05;
		high_mode = parseInt(n*2/3)+1;
		xim = 0.05;
		//INPUT VISCOUS CONSTANT (kNs/mm)
		//calculate Kd(i)*dphi^2
		sum_dphisq_f_kd = 0;
		sum_dphisq_f = 0;
		
		for (var i=1; i<=n; i++){
			sum_dphisq_f_kd = sum_dphisq_f_kd + k_damper[i]*Math.pow(dphi_f[i],2);
			sum_dphisq_f = sum_dphisq_f + Math.pow(dphi_f[i],2);
		}
		
		beta = 2*xi*sum_mphisq_f*(2*Math.pi/Tf)/sum_dphisq_f_kd;
		console.log('beta for VE dampers = '+sum_mphisq_f);
		var dc = [];
		for (var i=1; i<=n; i++){
			if (alpha != 1){
					dc[i] = beta*k_damper[i]; //Ns/m
				}
			else{
					dc[i] = 2*xi*sum_mphisq_f*(2*pi/Tf)/sum_dphisq_f;
			}
		}
		//convert to SI units
		//dc = dc*1000000;
		//damping factors
		//df_count = 1;
	}
}