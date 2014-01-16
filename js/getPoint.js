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
	
		//16th January 2013 - Trying to extrapolate straight from the ASCEPayload
		//If x is between 0 and 1 we do linear interpolation.
		if ((x>0)&&(x<1)){
			var zeropoint = sessvars.ASCEPayload[0];
			var onepoint = sessvars.ASCEPayload[1];
			
			var interpolated_y = getPoint(zeropoint[0],zeropoint[1],onepoint[0],onepoint[1],x);
			return [x,interpolated_y];
		}
		else{
			//Look-up from ASCEPayload:
			var my_x = x.toFixed(1);
			
			//Looking for the point from the points used to plot graph.
			for (var i = 0; i < sessvars.ASCEPayload.length; i++){
				if (my_x == sessvars.ASCEPayload[i][0].toFixed(1)){
					return [x, sessvars.ASCEPayload[i][1]];
				}
			}
		}
	}
	else{
		console.log("Improperly initialized");
	}
}

