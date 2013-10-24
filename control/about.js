var currentCount = 1;
		
		function safeCount(op){
			if (op == "add"){
				if (currentCount>=3){
					;
				}
				else{
					currentCount = currentCount+1;
				}
			}
			if (op == "sub"){
				if (currentCount<=1){
					;
				}
				else{
					currentCount = currentCount-1;
				}
			}
		}
		
		function divSelector(count){
			 if (count == 1){
                        $('#first-about-text').fadeIn(1000);
                        $('#second-about-text').hide();
                        $('#third-about-text').hide();
                    }else if (count == 2){
                        $('#first-about-text').hide();
                        $('#second-about-text').fadeIn(1000);
                        $('#third-about-text').hide();
                    }else if (count == 3){
                        $('#first-about-text').hide();
                        $('#second-about-text').hide();
                        $('#third-about-text').fadeIn(1000);
						}
			else{
				console.log("Count is nothing.");
			}
		}
		
		
		//Navigating: pass in "fwd" or "rev"
		function move(direction){    
			if (direction == "fwd"){
				safeCount("add");
				divSelector(currentCount);
			}
			else if (direction =="rev"){
				safeCount("sub");
				divSelector(currentCount);
			}
			else{
				;
			}
		}