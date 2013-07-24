
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
				
				var dict_var = {};
				

				
				for (var i = 0; i < a_inter.length; i += 1) {
					//Initializing dictionary
					dict_var[a_inter[i]] = [];
					for (var j = 0; j < x_inter.length; j+=1){
						var alpha = a_inter[i];
						var x = x_inter[j];
						var temp = visc_SPECTRA(alpha, x, Tf, Vf,SaTf_temp,42,2,2,2);//42 is irrelevant!		
						var Ra = temp["Ra"];
						var Rd = temp["Rd"];
						//d1.push([Rd, Ra]);						
						
						if (Rd > 4){
							alert("Beep, beep: alpha:" + alpha + "\nSaTf: " + SdTf_temp +"\nTf: " + Tf + "\nVf: " + Vf + "\nC: " + x+ "\nRa: "+Ra+ "\nRd: "+Rd);
						}
						
						
						if (j == 0){d0.push([Rd,Ra])}
						if (j == 1){d1.push([Rd,Ra])}
						if (j == 2){d2.push([Rd,Ra])}
						if (j == 3){d3.push([Rd,Ra])}
						if (j == 4){d4.push([Rd,Ra])}
						if (j == 5){d5.push([Rd,Ra])}
						if (j == 6){d6.push([Rd,Ra])}
						if (j == 7){d7.push([Rd,Ra])}
						
						dict_var[alpha].push([Rd,Ra]);
					}

				}
				
			global_temp = dict_var;
			global_temp2 = dict_var[a_inter[2]];
				//Defined in control script
				//var spectraplot = $.plot("#placeholder", [d1] );
			var plot = $.plot(placeholder, [{data:dict_var[a_inter[2]],label:"x: 0 y: 0",
								color: 'white',
								lines: { show: true },
								points: { show: false },
								},/*
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
									data:d7,
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},*/
								{
									data:dict_var[a_inter[0]],
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[1]],
									lines: { show: true },
									color: 'white',
									points: { show: false },								
								},
								{
									data:dict_var[a_inter[2]],
									lines: { show: true },
									color: '#white',
									points: { show: false },								
								}/*,
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
								xaxes: [{position:'bottom',axisLabel:'Rd'}],
								yaxes: [{position:'left',axisLabel:'Ra'}],
								pan:{interactive:true},
								grid:{hoverable:true,color:'white',clickable:true,mouseActiveRadius:1000}								
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
				 
				 

				 
				placeholder.bind("plothover",  function (event, pos, item) {
						if (item){
							local_x = item.datapoint[0].toFixed(5);
							local_y = item.datapoint[1].toFixed(5);
							console.log(local_x);console.log(local_y);
							

									if (!updateLegendTimeout){
										updateLegendTimeout = setTimeout(updateLegend(local_x,local_y), 1000);
										updateLegendTimeout = null;
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
				var mud_intervals = 4;//for alpha use 4 --> This used to be 20.
				//Each of the following is a container for a curve on the spectrum. 
				var d0 = [];
				var d1 = [];
				var d2 = [];
				var d3 = [];
				var d4 = [];
				var temp = Math.pow((Tf/(2*Math.PI)),2);
				var SdTf_temp = (grabPoint(Tf)[1])*(temp)*9.81;
				//Changed to scopeless so that I can access in plot. 
				alpha_intervals = numeric.linspace(0.1,0.6,mud_intervals);
				
				var mud_array = [1,2,5,10,20];
				var dick_var = {};
				
				for (var i = 0; i < mud_intervals; i += 1) {
					var alpha = alpha_intervals[i];
					
					//Initializing dictionary
					dick_var[alpha] = [];
					
					for  (var j = 0; j < mud_array.length; j += 1){
						
						var temp = hyst_SPECTRA(alpha, mud_array[j], Tf, Vf, SdTf_temp, 42, 2);//42 is irrelevant! 4 is SdTf
						var Ra = temp["Ra"];
						var Rd = temp["Rd"];	
						
						if (j == 0){
							d0.push([Rd, Ra]);
						}
						else if (j == 1){
							d1.push([Rd, Ra]);
						}
						else if (j == 2){
							d2.push([Rd, Ra]);
						}
						else if (j == 3){
							d3.push([Rd, Ra]);
						}
						else if (j == 4){
							d4.push([Rd, Ra]);
						}

						dick_var[alpha].push([Rd,Ra]);
					}
				}
				//Defined in control script
				//var spectraplot = $.plot("#placeholder", [d1] );
			
			var plot = $.plot(placeholder,
								[
								{	data:d0,
									label:"x: 0 y: 0",
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
									data:dick_var[alpha_intervals[0]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[1]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[2]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								},
								{
									data:dick_var[alpha_intervals[3]],
									lines: { show: true },
									color: '#edc240',
									points: { show: false },								
								}								
								],
								{
								crosshair:{mode:"xy",color:'white',lineWidth:2},								
								xaxes: [{position:'bottom',axisLabel:'Rd'}],
								yaxes: [{position:'left',axisLabel:'Ra'}],
								pan:{interactive:true},
								grid:{hoverable:true,color:'white',clickable:true,mouseActiveRadius:1000}
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
						console.log("x is" + x);
						plot.setupGrid();
						clearTimeout(updateLegendTimeout);
				}	
				 

				placeholder.bind("plothover",  function (event, pos, item) {
						if (item){
							local_x = item.datapoint[0].toFixed(2);
							local_y = item.datapoint[1].toFixed(2);
							console.log(local_x);console.log(local_y);
							

									if (!updateLegendTimeout){
										updateLegendTimeout = setTimeout(updateLegend(local_x,local_y), 1000);
										updateLegendTimeout = null;
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

				//Info pop-ups		
				var globalDesignCount = 0;
				sessvars.DesignContainer = [];
				$("#placeholder,#placeholder2,#placeholder3,#placeholder4").bind("plotclick", function (event, pos, item) {
					
					var temp;
					if (sessvars.dampertype =="hyster"){temp = panning_h;}
					else {temp = panning;}
					
					if (!temp){
						globalDesignCount+=1;
						toastr.info(local_x + ", " + local_y,"Design #"+globalDesignCount,{timeOut:0});
						sessvars.DesignContainer.push([local_x,local_y]);
					}
				});	
			
				sessvars.currTf = 1;
				sessvars.currVf = 1;
				
				
				//Marking the labels
				document.getElementById('Tf1_label').innerHTML = sessvars.Tf_index[0].toFixed(2);
				document.getElementById('Tf2_label').innerHTML = sessvars.Tf_index[1].toFixed(2);
				
				document.getElementById('Vf1_label').innerHTML = sessvars.Vf_index[0].toFixed(2);
				document.getElementById('Vf2_label').innerHTML = sessvars.Vf_index[0].toFixed(2);
				
				if (sessvars.dampertype == "hyster"){
					hyst_graph(sessvars.Tf_index[0],sessvars.Vf_index[0],'#placeholder');
					hyst_graph(sessvars.Tf_index[0],sessvars.Vf_index[1],'#placeholder2');
					hyst_graph(sessvars.Tf_index[1],sessvars.Vf_index[0],'#placeholder3');
					hyst_graph(sessvars.Tf_index[1],sessvars.Vf_index[1],'#placeholder4');
				}
				else{
					visc_graph(sessvars.Tf_index[0],sessvars.Vf_index[0],'#placeholder');
					visc_graph(sessvars.Tf_index[0],sessvars.Vf_index[1],'#placeholder2');
					visc_graph(sessvars.Tf_index[1],sessvars.Vf_index[0],'#placeholder3');
					visc_graph(sessvars.Tf_index[1],sessvars.Vf_index[1],'#placeholder4');
				}	
			});
