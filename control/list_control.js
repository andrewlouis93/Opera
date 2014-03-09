		
	function checkStoreyInputs(){
			if ((document.getElementById('storey_count').value) && (document.getElementById('storey_height').value)){
				return true;
			}
			else{
				return false;
			}
	}
	
	function startListControl() {
		sessvars.phi_f = [];
		sessvars.di = [];
		sessvars.masses = [];
	
		var options = {valueNames: [ 'id', 'Rv', 'Ra', 'Rs','Rd','alpha','last_param' ]};		
		
		// Init list
		var contactList2 = new List('contacts2', options);
			
		var editBtn = $('#edit-btn').hide(),
			removeBtns = $('.remove-item-btn'),
			editBtns = $('.edit-item-btn');
		
		// Sets callbacks to the buttons in the list
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
		
		function refreshCallbacks() {
			// Needed to add new buttons to jQuery-extended object
			removeBtns = $(removeBtns.selector);
			editBtns = $(editBtns.selector);
			removeBtns.click(function() {
			   var itemId = $(this).closest('tr').find('.id').text();
			   contactList2.remove('id', itemId);
			});
		}
			
		function loadTable(){
			alert("caller is " + arguments.callee.caller.name);
			for (var i = 0; i < sessvars.DesignContainer.length; i++){
					var pointObject = lookupTable(sessvars.table,sessvars.DesignContainer[i][0],sessvars.DesignContainer[i][1]);
					
					if (sessvars.dampertype == "hyster"){
						contactList2.add({id: Math.floor(Math.random()*110000),Rv: (sessvars.DesignContainer[i][0]).toFixed(2),Ra: (sessvars.DesignContainer[i][1]).toFixed(2),Rs: (pointObject.Rs).toFixed(2), Rd: (pointObject.Rd).toFixed(2), alpha: (pointObject.alpha).toFixed(2), last_param:(pointObject.mud).toFixed(2)});
					}
					else if (sessvars.dampertype == "visco"){
						contactList2.add({id: Math.floor(Math.random()*110000),Rv: (sessvars.DesignContainer[i][0]).toFixed(2),Ra: (sessvars.DesignContainer[i][1]).toFixed(2),Rs: (pointObject.Rs).toFixed(2), Rd: (pointObject.Rd).toFixed(2), alpha: (pointObject.alpha).toFixed(2), last_param:(pointObject.x).toFixed(2)});					
					}
			}
		}
		contactList2.remove('id',1); 
		refreshCallbacks();
		loadTable();	
		
		//Table symbol
		if (sessvars.dampertype == "hyster"){
			$("#last_param").html("&mu;"+"d".sub())		
		}
		else if (sessvars.dampertype == "visco"){
			$("#last_param").html("&epsilon;")	
		}
		
		//Control shit
		$(".list tr").click(function(){
			$(this).addClass("selected").siblings().removeClass("selected");
			 var x = parseFloat($(this).find('.Rv').html());
			 var y = parseFloat($(this).find('.Ra').html());
			 
			sessvars.pointObject = lookupTable(sessvars.table,x,y);
		});
		$('#navigator').click(function(){
			if (sessvars.pointObject && checkStoreyInputs()){
				$(".alert").fadeOut();
				sessvars.storey_count = parseFloat(document.getElementById('storey_count').value);
				sessvars.storey_height = parseFloat(document.getElementById('storey_height').value);
				console.log('Proceed');
				window.location.href = "buildingparams.html";
			}
			else{
				$(".alert").fadeIn();
				$(".alert").fadeOut(10000);
			}
		});
	}