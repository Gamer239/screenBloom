function screenBloom() {	
	startBloom();
	stopBloom();
	callBloomColor();
	callHelloColor();
	callColorSettings();
	sliderUpdate();
	editSettings();	
	selectBulbs();
	toggleDynamicBri();
	ipHelp();
	clickRegister();
}

// If ScreenBloom running, add CSS classes to visual indicators
function runningCheck() {
	$.getJSON($SCRIPT_ROOT + '/get-settings', {
		}, function(data) {
        	if (data['running-state'] === '1') {
        		console.log('Running!');
        		$('#start').addClass('button-selected');
				var color = randomColor();
				$('#running').css('color', color);
				$('#on-status').empty();
				$('#on-status').append('ScreenBloom is running');
        	} else {
        		$('#start').removeClass('button-selected');
				$('#running').css('color', 'black');
				$('#on-status').empty();
				$('#on-status').append('ScreenBloom is not running');
        	}
	    });
	    return false
}

// Hit Python route and add 'running' CSS indicators when Start button clicked
function startBloom(state) {
	var clicked = false;
	$('#start').on('click', function() {
		console.log('Clicked Start!');
		if (clicked) { 
			console.log('Nothing!');
		} else {
			clicked = true;
			$.getJSON($SCRIPT_ROOT + '/start', function(data) {
	        	console.log(data);    
		    });
		    $(this).addClass('button-selected');
			var color = randomColor();
			$('#running').css('color', color);
			$('#on-status').empty();
			$('#on-status').append('ScreenBloom is running');
		}
	    return false
	});

	$('#stop').on('click', function() {
		clicked = false;
		$('#start').removeClass('button-selected');
		$('#running').css('color', 'black');
		$('#on-status').empty();
		$('#on-status').append('ScreenBloom is not running');
	});
}

// Hit Python route when Stop button clicked
function stopBloom() {
	$('#stop').on('click', function() {
		console.log('Clicked Stop!');
		$.getJSON($SCRIPT_ROOT + '/stop', function(data) {
        	console.log(data);    
	    });
	    return false
	});
}

// Apply random color to ScreenBloom logos
function callBloomColor() {
	bloomColor();
	setInterval(bloomColor, 4000);
}

function bloomColor() {
	var color = randomColor();
	$('.bloom').css({'color': color});
}

// Function to color letters of giant 'HELLO' greeting
function callHelloColor() {
	helloColor();
	setInterval(helloColor, 4000);
}

function helloColor() {
	var elements = ['#h', '#e', '#l-1', '#l-2', '#o', '#exclaim'];	
	for (i = 0; i < elements.length; i++) {
		var color = randomColor();
		$(elements[i]).css({'color': color}, 2000);
	}
	var color = randomColor();
}

// Functions to color the settings titles
function callColorSettings() {
	colorSettings();
	setInterval(colorSettings, 4000);
}

function colorSettings() {
	var elements = [
		'#saturation-title', 
		'#brightness-title', 
		'#transition-title', 
		'#bulb-select-title', 
		'#bulb-select-expanded-title', 
		'#dynamic-brightness-title'
		];
	for (i = 0; i < elements.length; i++) {
		var color =randomColor();
		$(elements[i]).css({'color': color}, 2000);
	}
}

// Colors the loading spinner
function colorLoading() {
	var color =randomColor();
	$('#loading').css({'color': color}, 2000);
	$('.result-type > h1').css({'color': color}, 2000);
}

// Updates setting slider to currently selected value
function sliderUpdate() {
	var sliders = ['#sat', '#bri', '#transition', '#dynamic-bri'];
	for (i = 0; i < sliders.length; i++) {
		$(sliders[i] + '-slider').on('input', function() {
			var id = $(this).attr('id');
			var value = $(this).val();
			var outputId = ('#' + id + '-output');
			console.log(outputId);
			$(outputId).html(value);
		});
	}
}

// Fade in 'Edit Settings' window
function editSettings() {
	$('#edit-settings-icon').on('click', function() {
		$('#edit-settings-wrapper').fadeIn('fast');
		$('#edit-settings').fadeIn('fast');

		$('#edit-settings-close').on('click', function() {
			$('#edit-settings-wrapper').fadeOut('fast');
		});
	});
}

// Update 'selected_bulbs' value in config when icons clicked
function selectBulbs() {
	var clicked = false;	
	$('.bulb-select-icon').on('click', function() {
		var id = $(this).attr('id');
		if (clicked) {
			clicked = false;			
			$('[id=' + id + ']').removeClass('bulb-select-selected');
			$('[id=' + id + '] .bulb-select-input').val('0');
		} else {
			clicked = true;
			$('[id=' + id + ']').addClass('bulb-select-selected');
			$('[id=' + id + '] .bulb-select-input').val('1');
		}		
	});
}

// Update hidden input with correct value when dynamic brightness button clicked
function toggleDynamicBri() {	
	var clicked = false;
	$('#dynamic-bri-button').on('click', function() {		
		if (clicked) {
			$('#dynamic-bri-input').val('0');
			dynamicBriButton(false);
			clicked = false;			
		} else {			
			$('#dynamic-bri-input').val('1');
			dynamicBriButton(true);
			clicked = true;
		}
	});
}

// Grab values from sliders, send to a Python route
function updateConfig() {
	$('#apply').on('click', function() {
		var sat = $('#sat-slider').val();
		var bri = $('#bri-slider').val();
		var transition = $('#transition-slider').val();
		var bulbs = [];
		for (i = 1; i <= window.lightsNumber; i ++) {
			var id = '#light-' + i;
			var value = $(id).children().last().val();
			bulbs.push(value);
		}
		var bulbsString = bulbs.toString();		
		var dynamicBri = $('#dynamic-bri-input').val();
		var minBri = $('#dynamic-bri-slider').val()

		$('#notification').fadeIn(400);
		$('#edit-settings').fadeOut(400, function() {
	    	$('#edit-settings-wrapper').fadeOut(1500, function() {
    			$('#notification').fadeOut(1500);
    		});
	    });
		$.getJSON($SCRIPT_ROOT + '/update-config', {
			sat: sat,
			bri: bri,
			transition: transition,
			bulbs: bulbsString,
			dynamicBri: dynamicBri,
			minBri: minBri
		}, function(data) {
        	updateFront();        	
	    });
	    return false    
	});
}

// Updates settings on main page to their current value
function updateFront() {
	$.getJSON($SCRIPT_ROOT + '/get-settings', {
		}, function(data) {
        	elements = ['bulbs-value', 'sat-value', 'bri-value', 'trans-value'];        	
        	for (i = 0; i < elements.length; i++) {
        		elementId = '#' + elements[i];
        		$(elementId).empty();
        		$(elementId).append(data[elements[i]]);
        	}
        	bulbIcon(data['bulbs-value'], data['all-bulbs']);
        	console.log(data['dynamic-brightness']);
        	console.log(typeof(data['dynamic-brightness']));
        	dynamicBriButton(data['dynamic-brightness']);
        	$('#dynamic-bri-value').empty();
        	if (data['dynamic-brightness']) {
        		var text = 'On';
        	} else {
        		var text = 'Off';
        	}
        	$('#dynamic-bri-value').append(text);
	    });
	    return false
}

// Apply correct classes to selected lights icons
function bulbIcon(selected, all) {
	for (i = 0; i < all.length; i++) {
		if (selected[i]) {
			var element = '#bulb-' + all[i];
			$(element).removeClass('bulb-inactive');
		}
		else {
			var element = '#bulb-' + all[i];
			$(element).addClass('bulb-inactive');
		}
	}
}

// Apply correct class to dynamic brightness button
function dynamicBriButton(running) {
	$('#dynamic-bri-state').empty();
	if (running) {
		$('#dynamic-bri-button').addClass('dynamic-bri-on');
		var text = 'On';
		$('#dynamic-bri-state').append(text);
	} else {
		$('#dynamic-bri-button').removeClass('dynamic-bri-on');
		var text = 'Off';
		$('#dynamic-bri-state').append(text);
	}
}

// Show button to expand bulb select if there are a lot of lights
function bulbExpand(lights) {
	if (lights > 5) {
		$('#more-bulbs').css('display', 'block');
		$('#more-bulbs').on('click', function() {
			$('#bulb-select-expanded').fadeIn('fast');
		});
		$('#bulb-select-expanded-close').on('click', function() {
			$('#bulb-select-expanded').fadeOut('fast');
		});
	} else {
		$('#more-bulbs').css('display', 'none');
	}
}

// Display a tooltip with information on where to find Bridge IP
function ipHelp() {
	$('#ip-info').on('click', function() {
		$('#ip-tooltip').fadeIn('fast');
	});

	$('#ip-tooltip-close').on('click', function() {
		$('#ip-tooltip').fadeOut('fast');
	});
}

// Handles AJAX call to register new username and displays error/success message
function clickRegister() {
	$('#register').on('click', function() {				
		$('.result-wrapper').empty();
		var loadingIcon = '<i id="loading" class="fa fa-spinner fa-spin"></i>';
		var script = '<script type="text/javascript">colorLoading();</script>'
		$('.result-wrapper').append(loadingIcon);
		$('.result-wrapper').append(script);

		var username = $('#username').val();
		var hue_ip = $('#hue-ip').val();
		if (username.length < 10) {
			$('.validation').fadeIn('fast', function() {
				setTimeout(function() { $('.validation').fadeOut('fast'); }, 2000);
			});
		} else {
			$('.result-wrapper').fadeIn('fast');
			$.getJSON($SCRIPT_ROOT + '/register', {
				username: username,
				hue_ip: hue_ip
			}, function(data) {
				if (data['success'] === true) {
					console.log(data);
					var html = '<div class="result-type"><h1 class="raleway animate">Success!</h1><span>ScreenBloom was registered with your Hue Bridge.</span><span>Click the link below to continue!</span><a class="animate" href="/">Continue</a>';
					var script = '<script type="text/javascript">colorLoading();</script>'
					$('.result-wrapper').append(html);
					$('.result-wrapper').append(script);
				} else if (data['error_type'] === '101') {
					console.log('Link button not pressed');
					var html = '<div class="result-type"><h1 class="raleway animate">Whoops!</h1><span>Looks like the Bridge\'s link button wasn\'t pressed first.</span><div id="try-again" class="animate">Try Again</div>';
					var script = '<script type="text/javascript">colorLoading();</script>'
					$('.result-wrapper').append(html);
					$('.result-wrapper').append(script);
					$('#try-again').on('click', function() {
						$('.result-wrapper').fadeOut('fast');						
					});
				} else if (data['error_type'] === 'Invalid URL') {
					console.log('LocalHost Error, try again...');
					var html = '<div class="result-type"><h1 class="raleway animate">Whoops!</h1><span>Looks like there was an error with the network, please try again.</span><div id="try-again" class="animate">Try Again</div>';
					var script = '<script type="text/javascript">colorLoading();</script>'
					$('.result-wrapper').append(html);
					$('.result-wrapper').append(script);
					$('#try-again').on('click', function() {
						$('.result-wrapper').fadeOut('fast');						
					});
				} else if (data['error_type'] === 'No SSDP') {
					console.log('Error in SSDP response');
					window.location.href = '/manual';
				} else if (data['error_type'] === 'Invalid IP') {
					console.log('Error with provided Hue IP');
					var html = '<div class="result-type"><h1 class="raleway animate">Whoops!</h1><span>Looks like there was an error with the provided IP address, please try again.</span><div id="try-again" class="animate">Try Again</div>';
					var script = '<script type="text/javascript">colorLoading();</script>'
					$('.result-wrapper').append(html);
					$('.result-wrapper').append(script);
					$('#try-again').on('click', function() {
						$('.result-wrapper').fadeOut('fast');						
					});
				}
			});
		}
	});
}