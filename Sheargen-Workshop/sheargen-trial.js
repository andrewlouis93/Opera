
function activateSheargen(){
//sessvars.n -> number of storeys
//sessvars.Tf -> Tf
//sessvars.Vf -> Vf
//sessvars.phi_f -> [ ] user's slider input.
//pointObject that contains the rest of the point parameters. 
sessvars.damperType = "hyster"
sessvars.Tf = 1.72;
var constant = Math.pow((2*Math.PI/sessvars.Tf),2);
sessvars.Vf = 0.49;
sessvars.x = 0.23; //Greek E (pronouned C)
sessvars.alpha = 0.2;
sessvars.mu_d = 10;
sessvars.Rd = 0.545;
sessvars.Rv = 0.731;
sessvars.storeys = 3;
sessvars.SdTf = 0.25;
sessvars.SaTf = (0.25/9.81)*Math.pow((2*Math.PI/sessvars.Tf),2);
sessvars.phi_f = [0.28,0.68,1];
sessvars.storey_height = 4.31; //THESE MIGHT NEED TO BE ENTERED INDIVIDUALLY. YA BISH.
sessvars.masses = [295617,295617,159735];

//Adding a sum method to the array:
Array.prototype.sum = function(){
    var sum = 0;
    this.map(function(item){
        sum += item;
    });
    return sum;
}

var storey_heights = [];
for (var id = 0; id < sessvars.storeys; id++){
	storey_heights.push(sessvars.storey_height);
}

//Delete the following assingments soon. Debugging.
storey_heights[0] = 4.42;
storey_heights[1] = 4.30;
storey_heights[2] = 4.30;

var H = [];
//Calculating the H values(height from ground) using the inter storey height:
for (var i = 0; i < sessvars.storeys; i++){
   H.push( storey_heights.slice(0,i+1).sum() );
}
console.log(H);

//Summation will run from i to n where n is the number of storeys.
function calculateDeltaPhi_F(i){
	var index = i - 1;
	if (i == 1){
		return sessvars.phi_f[index];
	}
	else if (i > 1){
		return sessvars.phi_f[index] - sessvars.phi_f[index-1];
	}
	else{
		console.log('Bad input.');
	}
}

function calculateK_8_1(){

	var theta_list = [];
	//Calculate theta i
	for (var j = 0; j < sessvars.storeys; j++){
		theta_list[j] = sessvars.phi_f[j]/sessvars.storey_height;
	}
	
	
	
	var delta_theta_list = [];
	//Calculating delta theta
	for (var k = 0; k < sessvars.storeys; k++){
		if (k == 0){
			delta_theta_list[k] = theta_list[0];
		}
		else{
			delta_theta_list[k] = theta_list[k] - theta_list[k-1];
		}
	}


	//Assumes that i is the storey number - 1.
	function calculateAverageDeltaTheta(i){
		var sum = 0;
		var count = 0;
		var average;
		
		if (sessvars.storeys > 3){
			for (var iter = 0; iter < sessvars.storeys; iter++){
				//console.log("i is"+i+"and iter is: " + iter+ "delta_theta_list[iter] is" + delta_theta_list[iter]);

				if (iter == i){
					count+=1;
				}
				else if (iter-1 == i){
					if (i >= 0){
						count+=1;
					}
					else{;}
				}
				else if (iter+1 == i){
					count+=1;
				}
				else{
					//console.log("You will not see this when the number next to it is 1. " + iter);
					sum += delta_theta_list[iter];
				}
			}
			//Now that we have our sum, the average is calculated.
			average = sum/(sessvars.storeys - count);
		}
		else{
			sum = delta_theta_list.sum();
			average = sum/delta_theta_list.length;

		}
			
		if (isNaN(average)){
			return 0.1; //0 blows things up.
		}
		
		return average;
	}
	
	//Actually plugging the formula
	k_intermediates = [];
	for (var d = 0; d < sessvars.storeys; d++){
		var result = (delta_theta_list[d])/(calculateAverageDeltaTheta(d));
		k_intermediates.push(result);
	}
	
	var largest = Math.max.apply(Math, k_intermediates);
	return largest;
}

function variable_summation_at_index(arr1,arr2,i){
	if (arr1.length == arr2.length){
		var array_one = arr1.slice(i,arr1.length);
		var array_two = arr2.slice(i,arr2.length);
		
		var summation = 0;
		for(var i=0; i< array_one.length; i++) {
				summation += array_one[i]*array_two[i];
		}
		
		return summation;
	}
	else{
		return "mismatched array dimension";
	}
}

function calculateKf(flag){
	if (flag == "irregular"){
		var Kf_frame = [];
		for (var i = 0; i < sessvars.storeys; i++){
			var sol = constant*((variable_summation_at_index(sessvars.phi_f,H,i))/storey_heights[i]);
			Kf_frame.push(sol);
		}
		return Kf_frame;
	}
	else if (flag == "regular"){
		var Kf_frame = [];
		for (var i = 0; i < sessvars.storeys; i++){
			var sol = constant*((variable_summation_at_index(sessvars.phi_f,sessvars.masses,i))/calculateDeltaPhi_F(i+1));
			Kf_frame.push(sol);
		}
		return Kf_frame;
	}
}

function calculateVf(flag,Kf_frame){
	if (flag == "regular"){
		//The following only works for the first iteration, gamma_f
		var temp = sessvars.phi_f.slice(0,sessvars.phi_f.length);
		
		for (var i = 0; i < temp.length; i++){
			temp[i] = Math.pow(temp[i],2);
		}
		
		gamma_f = (variable_summation_at_index(sessvars.masses,sessvars.phi_f,0))/(variable_summation_at_index(sessvars.masses,temp,0));
		
		var Vf_list = [];
		
		var Vf_1 = gamma_f * (variable_summation_at_index(sessvars.masses,sessvars.phi_f,0)) * sessvars.SaTf * sessvars.Vf;
		Vf_list.push(Vf_1);
		
		
		var local_constant = (Vf_1/Kf_frame[0]);
		for (var i = 1; i < sessvars.storeys; i++){
			Vf_list.push(local_constant*Kf_frame[i]);
		}
		
		return Vf_list;
	}
	else if (flag == "irregular"){
		//The following only works for the first iteration, gamma_r
		var temp = sessvars.H.slice(0,H.length);

		for (var i = 0; i < temp.length; i++){
			temp[i] = Math.pow(temp[i],2);
		}
		
		gamma_r = (variable_summation_at_index(sessvars.masses,H,0))/(variable_summation_at_index(sessvars.masses,temp,0));
		
		var Vf_list = [];
		
		var Vf_1 = gamma_r * (variable_summation_at_index(sessvars.masses,H,0)) * sessvars.SaTf * sessvars.Vf;
		Vf_list.push(Vf_1);
	
		var local_constant = (Vf_1/Kf_frame[0]); //K-Frame would be different. 
		for (var i = 1; i < sessvars.storeys; i++){
			Vf_list.push(local_constant*Kf_frame[i]);
		}
		
		return Vf_list;
	}
}

function calculateInterStoreyDisplacement(gamma_d,delta_di){
	var interstorey_disp = [];
	for (var i = 0; i < sessvars.storeys; i++){
		var temp = gamma_d*sessvars.SdTf*sessvars.Rd*delta_di[i];
		interstorey_disp.push(temp);
	}
	return interstorey_disp;
}

function calculateFloorAcceleration(gamma_d, delta_di){
	var acceleration = [];
	for (var i = 0; i < sessvars.storeys; i++){
		var temp = gamma_d*sessvars.SaTf*sessvars.Ra*delta_di[i];
		acceleration.push(temp);
	}
	return acceleration;
}

function calculateKd_hyster(Ti,di,delta_di,Kf_frame,flag){
	var Kd = [];
	if (flag == "regular")
		{
			for (var i = 0; i < sessvars.storeys; i++)
			{
				var temp = ((Math.pow((2*Math.PI/Ti),2)*variable_summation_at_index(sessvars.masses,di,i))/delta_di[i]) - Kf_frame[i];
				Kd.push(temp);
			}
		return Kd;
	}
	else if (flag == "irregular")
	{
		//Eq'n S14-25
		for (var i = 0; i < sessvars.storeys; i++)
		{
			var temp = (Math.pow((2*Math.PI/Ti),2)*variable_summation_at_index(sessvars.masses,di,i)/delta_di[i]) - Kf_frame[i];
			Kd.push(temp);
		}
		return Kd;
	}
	
}

function calculateKd_visco(Ti,di,delta_di,Kf_frame){
	var Kd = [];
	for (var i = 0; i < sessvars.storeys; i++){
		var temp = (Math.pow((2*Math.PI/Ti),2)*variable_summation_at_index(sessvars.masses,di,0)/delta_di[i]) - Kf_frame[i];
	}
	return Kd; 
}

function calculateVd_i(interstoreydisp,Kd,Vf_strength,flag){
	var Vd = [];
	if (flag == "regular")
	{
		for (var i = 0; i < sessvars.storeys; i++)
		{
			var temp = interstoreydisp[i]*(Kd[i]/sessvars.mu_d);
			Vd.push(temp);
		} 
		return Vd;
	}
	else if (flag == "irregular")
	{
		//You need regular Vf strength to calculate S14-24
		var reg_temp = calculateVf("regular",Kf_frame); //Check this, and the delta i under predictions. --> This must be entered in by the user! If irregular.
		//reg_temp is Vf,i
		for (var i = 0; i < sessvars.storeys; i++)
		{
			var temp = interstoreydisp[i]*(Kd[i]/sessvars.mu_d) + Vf_strength[i] - reg_temp[i];
			Vd.push(temp);
		}
		return Vd;
	}
}

function calculateLateralViscousCoefficient(Kd,delta_di){
	var Cd = [];
	
	//Squaring elements of phi_f
	var temp_phi_f = sessvars.phi_f.slice(0);
	for (var j = 0; j < temp_phi_f.length; j++){
		temp_phi_f[i] = Math.pow(temp_phi_f[i],2);
	}
	//Squaring elements of delta_di
	var temp_delta_di = delta_di.slice(0);
	for (var k = 0; k < temp_delta_di; k++){
		temp_delta_di[i] = Math.pow(temp_delta_di[i],2);
	}
	
	for (var i = 0; i < sessvars.storeys; i++){
		var temp = (2*sessvars.x*variable_summation_at_index(sessvars.masses,temp_phi_f,0)*Kd[i])/variable_summation_at_index(Kd,temp_phi_f,i);
		Cd.push(temp);
	}
	return Cd;
}

sheargen(); //Call to sheargen. 

function sheargen(){ //arguments: Tf,Vf,alpha, mu,Rd,Rv,n,SdTf
	console.log("SHEARGENNNNED");
	var flag = "regular";
	//Regularity Check
	if (calculateK_8_1() > 1.3){
		flag = "irregular";
	}
	//Calculating Kf_frame
	var Kf_frame = calculateKf(flag);
	//Calculating Vf --> Pass in Kf_frame!
	var Vf_strength = calculateVf(flag,Kf_frame);
	//S14 - 19
	var di = [];
	for (var i = 0; i < sessvars.storeys; i++){
		di.push(H[i]/H[sessvars.storeys-1]);
	}
	
	//Calculating delta_di
	var delta_di = [];
	for (var j = 0; i < sessvars.storeys; j++){
		if (j == 0){
			delta_di.push(di[0]); //delta d @ 0 = d @ 0
		}
		else{
			delta_di.push(di[j] - di[j-1]);
		}
	}
	//Creating another copy of di that has its values squared.
	var temp = di.slice(0);
	for (var k = 0; k < di.length; k++){
		temp[k] = Math.pow(temp[k],2);
	}
	var gamma_d = variable_summation_at_index(sessvars.masses,di,0)/variable_summation_at_index(sessvars.masses,temp,0);
		
	//Calcualte inter storey displacement
	var interstoreydisp = calculateInterStoreyDisplacement(gamma_d,delta_di);
	
	//Calculate the first fmode floor acceleration
	var acceleration = calculateFloorAcceleration(gamma_d, delta_di);
	
	if (sessvars.damperType == "hyster"){
		//HYSTERETIC CALCULATIONS
		//Calculating stiffness given by Kd
		var Ti = sessvars.Tf*Math.sqrt(sessvars.alpha);
		var Kd = calculateKd_hyster(Ti,di,delta_di,Kf_frame,flag); //Toggles depending on flag.
		
		//Eq`n S14-23
		var Vd_i = calculateVd_i(interstoreydisp,Kd,Vf_strength,flag); //Toggles depending on flag.
	}
	else if (sessvars.damperType == "visco"){
		//VISCO CALCULATIONS
		//14-26
		var Ti = sessvars.Tf*Math.sqrt(sessvars.alpha);
		var Kd = calculateKd_visco(Ti,di,delta_di,Kf_frame);
		
		
		//14-27 Cd
		if (sessvars.alpha != 1){
			var Ci = calculateLateralViscousCoefficient(Kd,delta_di);
		}
		else{
			console.log('alpha is 1, cannot do 14-27!');
		}
	}
	
	//Predictions
	//var delta_i = calculateDeltaI();
	
	
}
}