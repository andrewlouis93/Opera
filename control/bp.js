function getIndexFromID(string,slider){
				var temp;
				var object = new Object();
				if (slider == "target"){
					object.mode = "target";
					temp = string.slice(13);
					temp = parseFloat(temp);
					//console.log('target index ' + temp + ' target mode ' + object.mode);
				}
				else if (slider == "my-slider"){
					object.mode = "spec";
					temp = string.slice(9);
					temp = parseFloat(temp);
				}
				
				object.index = temp;
				
				return object;
			}
			
			//CREATE FUNCTION FOR LAST 0 LEVEL THAT WILL EXECUTE AT THE END OF EVERY FOR LOOP.
			function createSlider(slider_id,dragbutton_id,i){
				new Dragdealer(slider_id,{horizontal: true,x:i,animationCallback: function(x, y){
					
					
					console.log(sessvars.phi_f);
					var temp = slider_id.slice(0);
					temp = temp.slice(0,9);
					//Doesn't actually getIndexFromID alone.
					if (temp != 'my-slider'){
						//must be target slider, grab the target-slider string.
						temp = slider_id.slice(0);
						temp = temp.slice(0,6);
						console.log('THIS SHOULD BE EQUAL TO "TARGET" ' + temp);
					}
					
					//console.log('temp is '+temp);
					var obj = getIndexFromID(slider_id,temp);
					console.log("Object index " + obj.index + "Object mode" + obj.mode );
					if (obj.mode == 'spec'){
						sessvars.phi_f[obj.index] = parseFloat(x.toFixed(2));
					}
					else if (obj.mode == 'target'){
						sessvars.di[obj.index] = parseFloat(x.toFixed(2));
					}
					
					document.getElementById(dragbutton_id).innerHTML = x.toFixed(2);
				}
				});
			}
			
			function createDivs_specs(){
				var linspace = numeric.linspace(0,1,sessvars.storey_count+1).reverse();
				for (var count=0; count < parseFloat(sessvars.storey_count); count++){
					var string=	"<br><div id='my-slider"+count+"' class='dragdealer'><div class='red-bar handle'><span id='drag-button"+count+"'>drag me</span></div></div>"	/*<br><div id='my-slider"+count+"' class='dragdealer'><div class='red-bar handle'><span id='drag-button"+count+"'>drag me</span></div></div>";*/
					$("#bldg_specs").append(string);
					
					var slider_id ="my-slider"+count;
					var drag_button_id = "drag-button"+count;
					createSlider(slider_id,drag_button_id,linspace[count]);
				}
				
				/*var temp = "<div class='test'><span><br><div id='target-sliderx' class='dragdealer'><div class='red-bar handle'><span id='target-drag-buttonx'>0</span></div></div></div>"
				//createSlider('target-sliderx','target-drag-buttonx',0);
				$("#bldg_specs").append(temp);
				*/
			}
			
			function createDivs_target(){
				var linspace = numeric.linspace(0,1,sessvars.storey_count+1).reverse();/**/		
				for (var count=0; count < parseFloat(sessvars.storey_count); count++){
					var string=	"<div class='test'><span><br><div id='target-slider"+count+"' class='dragdealer'><div class='red-bar handle'><span id='target-drag-button"+count+"'>drag me</span></div></div><input id='floor"+count+"'class='floor_mass' type='number' step='any' placeholder='mass'></div>";
					$("#bldg_target").append(string);
					
					var slider_id ="target-slider"+count;
					var drag_button_id = "target-drag-button"+count;
					createSlider(slider_id,drag_button_id,linspace[count]);
				}
				/*var temp = "<div class='test'><span><br><div id='target-sliderx' class='dragdealer'><div class='red-bar handle'><span id='target-drag-buttonx'>0</span></div></div></div>"
				//createSlider('target-sliderx','target-drag-buttonx',0);
				$("#bldg_target").append(temp);
				*/
			}
			
			/*<input class='floor_mass' type='number' step='any' placeholder='mass'><span>*/
			function startBP(){
			
				var pageLoad = false;

				if (sessvars.dampertype == "hyster"){
					$(".Cd").hide();
					if ($(".Vd").is(":visible") == false){
						$(".Vd").show();
					}
				}
				
				if (sessvars.dampertype == "visco"){
					$(".Vd").hide();
					if ($(".Cd").is(":visible") == false){
						$(".Cd").show();
					}
				}

				createDivs_specs();
				createDivs_target();
				
				
				//activateSheargen();
				
				var options = {
					valueNames: [ 'id', 'Kf', 'Vf','Kd','Vd','Cdi' ]
				};
				
				// Init list
				var contactList3 = new List('contacts3', options);
				//alert('Fixes made, bitches fucked.');
					
				var editBtn = $('#edit-btn').hide(),
					removeBtns = $('.remove-item-btn'),
					editBtns = $('.edit-item-btn');

				function refreshCallbacks() {
					// Needed to add new buttons to jQuery-extended object
					removeBtns = $(removeBtns.selector);
					editBtns = $(editBtns.selector);
					removeBtns.click(function() {
					   var itemId = $(this).closest('tr').find('.id').text();
					   contactList3.remove('id', itemId);
					});
				}
					
				function loadTable(){
					
					//Clears list. Since it keeps updating. 
					contactList3.clear();
					
					if ((sessvars.Kf_frame != null) && (sessvars.Vf_strength != null)){
						for (var i = 0; i < sessvars.storey_count; i++){
								if (isNaN(sessvars.Kf_frame[i])== false && isNaN(sessvars.Vf_strength[i]) == false){
									
									//Here is where the magic happens.
									if (sessvars.dampertype == "hyster"){
										contactList3.add({id: Math.floor(Math.random()*110000),Kf: sessvars.Kf_frame[i].toFixed(2),Vf: sessvars.Vf_strength[i].toFixed(2),Kd:sessvars.Kd[i].toFixed(2),Vd:sessvars.Vd[i].toFixed(2)});
									}
									else if (sessvars.dampertype == "visco"){
										contactList3.add({id: Math.floor(Math.random()*110000),Kf: sessvars.Kf_frame[i].toFixed(2),Vf: sessvars.Vf_strength[i].toFixed(2),Kd:sessvars.Kd[i].toFixed(2),Cd:sessvars.Ci[i].toFixed(2)});
									}
								}
						}
					}
				}

				function timeoutFunction(){
					for (var element = 0; element < sessvars.storey_count; element++){
						var value = document.getElementById("floor"+element).value;
						//Inputting into mass matrix.
						if (value != ""){
							sessvars.masses[element] = parseFloat(value);
						}
					}
					
					if (sessvars.masses.length > 0){
						activateSheargen();
					}
					loadTable();
				}
	
				$( "#go" ).click(timeoutFunction);
				//setInterval(function(){timeoutFunction()},1000);
				contactList3.remove('id',1); 
				refreshCallbacks();
				loadTable();	
				//Control shit
				
				var allow = false;

				window.onbeforeunload = function() {
					console.log(allow + 'in refreshwindowfunction');
					if (allow = false){
						return "Refreshing this page will clear session stored data, and the user may have to start this Opera session from the beginning. Are you still willing to proceed?";
					}
				};
			}