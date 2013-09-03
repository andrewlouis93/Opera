var standardFlag = "NBCC";
		var locationFlag = "";
		var provinceFlag = "";
		
		var graphCall;
		
		sessvars.NBCCPayload;
		sessvars.ASCEPayload;
		sessvars.standard = "NBCC";
		function standardSelect(option)
		{
			if (option == 1)
				{
					standardFlag = "ASCE";
					//toggleAmerican();
					
					var Canadian = document.getElementById('location_lists');
					Canadian.style.display = 'none';
					
					var American = document.getElementById('text-inputs');
					American.style.display = 'block';
					
					//Session flag
					sessvars.standard = "ASCE";
				}
			if (option == 2)
				{

					standardFlag = "NBCC";
					//toggleCanadian();
					
					var American = document.getElementById('text-inputs');
						American.style.display = 'none';
						
					var Canadian = document.getElementById('location_lists');
						Canadian.style.display = 'block';
						
					//Session flag
					sessvars.standard = "NBCC";
				}
		}
				
		//Location picker
		function selectLocation(string){
			locationFlag = string;
		}
		
		function DropDown(el) {
				this.dd = el;
				this.placeholder = this.dd.children('span');
				this.opts = this.dd.find('ul.dropdown > li');
				this.val = '';
				this.index = -1;
				this.initEvents();
			}
			DropDown.prototype = {
				initEvents : function() {
					var obj = this;

					obj.dd.on('click', function(event){
						$(this).toggleClass('active');
						return false;
					});

					obj.opts.on('click',function(){
						var opt = $(this);
						obj.val = opt.text();
						obj.index = opt.index();
						obj.placeholder.text(obj.val);
					});
				},
				getValue : function() {
					return this.val;
				},
				getIndex : function() {
					return this.index;
				}
			}

	$(function() {
	
	
		
   
		function NBCCGraph(PGA, one, two, three, four, F_a, F_r){
	
				one = one*F_a;
				three = three*F_r;
				var d2 = [[0, one], [0.2, one], [0.5, two], [1.0, three],[2.0, four],[2.5,four]];
				//Loading onto Session Payload
				
				sessvars.NBCCPayload = d2;
				
				//Following two lines for visco spectra!
				var PGA = [[0,PGA]];
				sessvars.NBCC_PGA = PGA;
				
			
				plot =  $.plot("#placeholder", [{data:d2, label:"x: 0 y: 0",
										lines: { show: true },
										points: { show: false },
										},
										{data:PGA,label:"&nbsp;PGA:&nbsp;&nbsp;"+PGA[0][1],
										 points: { show: true },
										 
										}],
										{	
											crosshair:{mode:"x",color:'white',lineWidth:2},
											xaxes: [{position:'bottom',axisLabel:'T(s)'}],
											yaxes: [{position:'left',axisLabel:'Proper Acceleration (g)'}],
											grid:{hoverable:true,clickable:true,color:'white'}
	
										});
				  $('.xaxisLabel').css('color','white');
				  $('.xaxisLabel').css('font-size','1.2em');

					$('.yaxisLabel').css('color','white');
					$('.xaxisLabel').css('font-size','1.2em');

				 var legends = $("#placeholder .legendLabel");
					legends.each(function () {
						// fix the widths so they don't jump around
						$(this).css('width', $(this).width());
					});					
				
				
				 var updateLegendTimeout = null;
				 var latestPosition = null;
				 function updateLegend(){
						var pos = latestPosition;
						
						var axes = plot.getAxes();
						if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
							pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
							return;
						//pos.x is going to be the x variable.
						var y = grabPoint(pos.x)[1];
						var series = (plot.getData())[0];
						legends.eq(0).text(series.label ="x: " + (pos.x).toFixed(2)+" y: "+ y.toFixed(2));
				 }
				
				$("#placeholder").bind("plothover",  function (event, pos, item) {
						latestPosition = pos;
							if (!updateLegendTimeout){
								updateLegendTimeout = setTimeout(updateLegend, 50);
								updateLegendTimeout = null;
							}
				});
		}
		
		//Fa and Fr are inputs in the form!
		function ASCEGraph(S_s, S_1, T_0, T_L, F_a, F_r){
				var S_DS = S_s*F_a;
				var S_D1 = S_1*F_r;
				sessvars.temp = S_D1;
				var PGA = 0.4*S_D1;
				var T_S = S_D1/S_DS;
				var d2 = [[0, PGA], [T_0, S_DS], [T_S, S_DS], [1.0, S_D1]];
				
				sessvars.ASCEPayload = d2;
				sessvars.Tlval = T_L;
				
				//The 1/T portion of the graph
				for (var i = 1.0; i < T_L; i += 0.1) {
					d2.push([i, (sessvars.temp/i)]);
				}

				// A null signifies separate line segments
				plot = $.plot("#placeholder", [{data:d2,label:"x: 0 y: 0",
										lines: { show: true },
										points: { show: false },
										}],
										{
											crosshair:{mode:"x",color:'white',lineWidth:2},
											xaxes: [{position:'bottom',axisLabel:'T(s)'}],
											yaxes: [{position:'left',axisLabel:'Proper Acceleration (g)'}],
											grid:{hoverable:true,color:'white',clickable:true}
										});
										
				$('.xaxisLabel').css('color','white');
				$('.xaxisLabel').css('font-size','1.2em');

				$('.yaxisLabel').css('color','white');
				$('.xaxisLabel').css('font-size','1.2em');

				var legends = $("#placeholder .legendLabel");
					legends.each(function () {
						// fix the widths so they don't jump around
						$(this).css('width', $(this).width());
					});					
				
				
				 var updateLegendTimeout = null;
				 var latestPosition = null;
				 function updateLegend(){
						var pos = latestPosition;
						
						var axes = plot.getAxes();
						if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
							pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
							return;
						//pos.x is going to be the x variable.
						var y = grabPoint(pos.x)[1];
						var series = (plot.getData())[0];
						legends.eq(0).text(series.label ="x: " + (pos.x).toFixed(2)+" y: "+ y.toFixed(2));
				 }
				
				$("#placeholder").bind("plothover",  function (event, pos, item) {
						latestPosition = pos;
							if (!updateLegendTimeout){
								updateLegendTimeout = setTimeout(updateLegend, 50);
								updateLegendTimeout = null;
							}
				});
				}
				
		// Call on page load
		$(document).ready(function() {

		NBCCGraph(10,20,18,15,10,7,5,1,1);
			//ASCEGraph(10,20,18,0.2,2,4,1);

		});
		

		/*Dropdown list stuff*/
		var dd = new DropDown( $('#dd') );
		var ff = new DropDown( $('#ff') );
		var hh = new DropDown( $('#hh') );
		var oo = new DropDown( $('#oo') );
		var BC = new DropDown( $('#BritishColumbia') );
		var SK = new DropDown( $('#Sasketchewan') );
		
		$(document).click(function() {
			// all dropdowns
			$('.wrapper-dropdown-3').removeClass('active');
			
		});
		
		//Script for hiding the file dialog under the div. 
		$("#logo").css('opacity','0');
		$("#gg").click(function(){
			$("#logo").trigger('click');
			return false;
		});

			//The function(){//do stuff} is an event listener! http://stackoverflow.com/questions/12627443/jquery-click-vs-onclick
			$('#generate_pos').click(function(){
													
													if (standardFlag == "ASCE")
														{
															if (document.getElementById('Ss_param').value === ""
																	|| document.getElementById('S1_param').value === ""
																	|| document.getElementById('T0_param').value === ""
																	|| document.getElementById('TL_param').value === "" )
																{
																	alert("Please fill out all the required fields before generating your design spectrum");
																}
															
														else if (document.getElementById('Ss_param').value < document.getElementById('S1_param').value)
															{
																alert("S1 must be less than Ss!");
															}
														else
															{
																ASCEGraph(parseFloat(document.getElementById('Ss_param').value),
																			parseFloat(document.getElementById('S1_param').value),
																			parseFloat(document.getElementById('T0_param').value),
																			parseFloat(document.getElementById('TL_param').value),
																			parseFloat(document.getElementById('Fa_param').value),
																			parseFloat(document.getElementById('Fr_param').value))
															}
																
														}
													else if (standardFlag == "NBCC")
														{
															if (locationFlag === "")
															{
																alert("Please enter province and location information before generating your design spectrum");
															}
															else{
																NBCCGraph(NBCCDatabase[locationFlag][0],NBCCDatabase[locationFlag][1],NBCCDatabase[locationFlag][2],NBCCDatabase[locationFlag][3],NBCCDatabase[locationFlag][4],1,1);
															}
														}
													}); 
													
		$('#navigator').click(function(){
				if (standardFlag == "ASCE")
				{
					if (document.getElementById('Ss_param').value === ""
						|| document.getElementById('S1_param').value === ""
						|| document.getElementById('T0_param').value === ""
						|| document.getElementById('TL_param').value === "" )
						{
							alert("You must finish up this form before carrying on to the next page!");
							document.location.href='#';
							//Direct page using JQuery
						}
					else
						{
							document.location.href='damperdesign.html';
						}
				}
				else if (standardFlag =="NBCC")
				{
					if (locationFlag === "")
						{
							alert("You must finish up this form before carrying on to the next page!");
							document.location.href='#';

							//Direct page using JQuery
						}
					else
						{
							document.location.href='damperdesign.html';
						}
				}
		});
	});