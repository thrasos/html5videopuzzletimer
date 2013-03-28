/****************************************************
 * Tragic code for tragic music, yay cyprus :-(
 *                                                  *
 *                       *
 ****************************************************
/                                                  */
var cyprus = cyprus || {};

/****************************** 
 * Parts.                     *
 *                            *
 ******************************
/                            */
cyprus.parts = (function() {
	/****************************** 
	 * Public.                    *
	 ******************************
	/                            */
	var public = {};
	
	/****************************** 
	 * Globals.                   *
	 ******************************
	/                            */
	var screen;
	var videoInterval;
	var locked = 0;
	var arrCanvases = [];
	var arrContainers = [];
	var thouArtVictorious = false;
	
	/****************************** 
	 * Constants.                 *
	 ******************************
	/                            */
	var PUZZLE_WIDTH = 600;
	var PUZZLE_HEIGHT = 300;
	var CELL_WIDTH = 100;
	var CELL_HEIGHT = 100;
	var NUMBER_OF_CELLS = ((PUZZLE_WIDTH / CELL_WIDTH) * (PUZZLE_HEIGHT / CELL_HEIGHT));
	
	/****************************************************
	 * init:void                                        *
	 *                                                  *
	 * Let's get this party started!                    *
	 ****************************************************
	/                                                  */
	public.init = function() {
		screen = document.getElementById('screen');
		
		_redirectNonSupported();
		_trackLoadingProgress();
		_initPieces();
		_initMuteButton();
		_initReplayButton();
		
		videoInterval = setInterval(_translateVideoToPieces, 33);
		
		// fail check
		screen.addEventListener('ended', function() {
			if(!thouArtVictorious) _fail();
			else $('#replay-btn').fadeIn('fast');
		}, false);
	}
	
	/****************************************************
	 * _download:void                                   *
	 *                                                  *
	 * If you are reading this, you are cheating.       *
	 * However, you'll still have to solve a puzzle.    *
	 * Ha-ha.                                           *
	 ****************************************************
	/                                                  */
	var _download = function(e) {
		if($(e.currentTarget).length == 0) return;
		
		
		window.location.href = 'data/prize/olive_branch_2555px.png.zip' ;
	}
	
	/****************************************************
	 * _redirectNonSupported:void                       *
	 *                                                  *
	 * Can you do it? Or, more to the point, can your   *
	 * browser do it.                                   *
	 ****************************************************
	/                                                  */
	var _redirectNonSupported = function() {
		 var supported = true;
		 
		 if(!Modernizr.canvas || !Modernizr.video || !Modernizr.audio) supported = false;
		 if($.browser.msie || $.browser.opera) supported = false;
		 if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i)) supported = false;
		 if(navigator.userAgent.toLowerCase().match(/android/i)) supported = false;
		 if(navigator.userAgent.toLowerCase().match(/windows ce/i)) supported = false;
		 if(navigator.userAgent.toLowerCase().match(/blackberry/i)) supported = false;
		 if(navigator.userAgent.toLowerCase().match(/palm/i)) supported = false;
		 
		 if(!supported) window.location.href = 'alternate.html';
	}
	
	/****************************************************
	 * _trackLoadingProgress:void                       *
	 *                                                  *
	 * Update the loading progess indicator.            *
	 ****************************************************
	/                                                  */
	var _trackLoadingProgress = function() {
		screen.addEventListener('loadeddata', function() {
			$('#status').stop().animate({'top':'0px'}, 1000, 'easeInOutExpo');
		}, false);
		
		screen.addEventListener('canplaythrough', function() {
			$('#status').stop().animate({'top':'-75px'}, 1000, 'easeInOutExpo', function() {
				setTimeout(_go, 1000);
			});
		}, false);
		
		if(screen.readyState == 4) _go();
		
		function _go() {
			$('#status').stop().animate({'top':'-150px'}, 1000, 'easeInOutExpo', function() {
				$('#indicator').attr('src', 'data/images/arrow.gif');
				
				$('#loader').css('cursor', 'pointer').click(function() {
					$('#loading').animate({'width':'1px'}, 1000, 'easeOutExpo', function() {
						$(this).hide();
						screen.play();
					});
				});
			});
		}
	}
	
	/****************************************************
	 * _initPieces:void                                 *
	 *                                                  *
	 * Build and position the puzzle pieces.            *
	 ****************************************************
	/                                                  */
	var _initPieces = function() {
		for(var i = 0; i < NUMBER_OF_CELLS; i++) {
			
			// add canvasas
			arrCanvases[i] = document.createElement('canvas');
			with(arrCanvases[i]) {
				id = 'cell-' + i;
				width = CELL_WIDTH;
				height = CELL_HEIGHT;
			}
			document.getElementById('main').appendChild(arrCanvases[i]);
			
			// derive position and rotation
			var rotation = Math.ceil(Math.random() * 90) - 45;
			var randomPoint = _getRandomPoint(i, $('#puzzle').offset().left, $('#puzzle').offset().top, ($('#puzzle').outerWidth() + $('#puzzle').offset().left), ($('#puzzle').outerHeight() + $('#puzzle').offset().top), $(window).width(), $(window).height());
			
			// style 'em out
			$('#cell-' + i).css({
				'position':'absolute',
				'top':randomPoint.y + 'px',
				'left':randomPoint.x + 'px',
				'-moz-transform':'rotate(' + rotation + 'deg)',
				'-webkit-transform':'rotate(' + rotation + 'deg)'
			});
			
			// drag
			$('#cell-' + i).draggable();
			
			// add containers
			arrContainers[i] = document.createElement('div');
			with(arrContainers[i]) {
				id = 'container-' + i;
			}
			document.getElementById('puzzle').appendChild(arrContainers[i]);
			
			// style 'em out
			$('#container-' + i).css({
				'width':CELL_WIDTH + 'px',
				'height':CELL_HEIGHT + 'px',
				'float':'left'
			});
			
			// drop
			$('#container-' + i).droppable({
				accept:'#cell-' + i,
				drop:function(event, ui) {
					ui.draggable.css({
						'position':'static',
						'-moz-transform':'rotate(0deg)',
						'-webkit-transform':'rotate(0deg)'
					}).draggable('option', 'disabled', 'true');
					$(this).css({
						'width':CELL_WIDTH + 'px',
						'height':CELL_HEIGHT + 'px',
						'border':'none'
					}).append(ui.draggable).droppable('option', 'disabled', 'true');
					
					locked++;
					if(locked == NUMBER_OF_CELLS) _ftw();
				}
			});
		}
	}
	
	/****************************************************
	 * _initMuteButton:void                             *
	 *                                                  *
	 * Initialize the mute button.                      *
	 ****************************************************
	/                                                  */
	var _initMuteButton = function() {
		$('#mute-btn').click(function() {
			if(screen.muted) {
				screen.muted = false;
				$(this).css('background-position', '0px 0px');
			} else {
				screen.muted = true;
				$(this).css('background-position', '0px -40px');
			}
		});
	}
	
	/****************************************************
	 * _initReplayButton:void                           *
	 *                                                  *
	 * Initialize the replay button.                    *
	 ****************************************************
	/                                                  */
	var _initReplayButton = function() {
		$('#replay-btn').click(function() {
			$(this).fadeOut('fast');
			screen.currentTime = 0;
			if(screen.paused) screen.play();
		});
	}
	
	/****************************************************
	 * _translateVideoToPieces:void                     *
	 *                                                  *
	 * Draw the video on to each of the canvases.       *
	 ****************************************************
	/                                                  */
	var _translateVideoToPieces = function() {
		if(screen.readyState >= 3) {
			var ctx = new Array();
			var row = 0;
			var col = 0;
			
			for(var j = 0; j < NUMBER_OF_CELLS; j++) {
				if(j != 0 && (j % Math.floor(PUZZLE_WIDTH / CELL_WIDTH) == 0)) {
					row++;
					col = 0;
				}
				
				ctx[j] = arrCanvases[j].getContext('2d');
				ctx[j].clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
				ctx[j].drawImage(screen, (col * CELL_WIDTH), (row * CELL_HEIGHT), CELL_WIDTH, CELL_HEIGHT, 0, 0, CELL_WIDTH, CELL_HEIGHT);
				
				col++;
			}
			
			_updateTime();
		}
	}
	
	/****************************************************
	 * _updateTime:void                                 *
	 *                                                  *
	 * The final countdown.                             *
	 ****************************************************
	/                                                  */
	var _updateTime = function() {
		if(screen.duration == 'NaN') return;
		
		var t = screen.duration - screen.currentTime;
		var m = Math.floor(t / 60);
		var s = (Math.floor(t)) % 60 < 10 ? '0' + (Math.floor(t)) % 60 : (Math.floor(t)) % 60;
		
		$('#countdown').text('0' + m + ':' + s);
	}
	
	/****************************************************
	 * _getRandomPoint:Object                           *
	 *                                                  *
	 * Get a random point outside the puzzle but inside *
	 * the browser. Good thing I paid attention in      *
	 * algerbra class.                                  *
	 *                                                  *
	 * i:Number - index                                 *
	 * Px:Number - inner restricted rectangle x         *
	 * Py:Number - inner restricted rectangle y         *
	 * Pw:Number - inner restricted rectangle width     *
	 * Ph:Number - inner restricted rectangle height    *
	 * Bw:Number - initial browser width                *
	 * Bh:Number - initial browser height               *
	 ****************************************************
	/                                                  */
	var _getRandomPoint = function(i, Px, Py, Pw, Ph, Bw, Bh) {
		var coin = Math.round(Math.random());
		var p = {};
		
		if(coin == 0) {
			p.x = (i % 2 == 0) ? (Px - CELL_WIDTH) : Pw;
			p.y = Math.ceil(Py + (Math.random() * (Ph - Py)));
		} else {
			p.y = (i % 2 == 0) ? (Py - CELL_HEIGHT) : Ph;
			p.x = Math.ceil(Px + (Math.random() * (Pw - Px)));
		}
		
		switch(p.x) {
			case (Px - CELL_WIDTH):
				p.x = p.x - Math.ceil(Math.random() * (Px - (CELL_WIDTH + 15)));
				break;
			case Pw:
				p.x = p.x + Math.ceil(Math.random() * (Bw - (CELL_WIDTH + 15) - p.x));
				break;
		}
		
		switch(p.y) {
			case (Py - CELL_HEIGHT):
				p.y = p.y - Math.ceil(Math.random() * (Py - (CELL_HEIGHT + 15)));
				break;
			case Ph:
				p.y = p.y + Math.ceil(Math.random() * ((Bh - (CELL_HEIGHT + 15)) - p.y));
				break;
		}
		
		return p;
	}
	
	/****************************************************
	 * _fail:void                                       *
	 *                                                  *
	 *poulo                                  *
	 ****************************************************
	/                                                  */
	var _fail = function() {
		for(var i = 0; i < NUMBER_OF_CELLS; i++) $('#cell-' + i).draggable('destroy');
		$('#fail').animate({'left':'0px'}, 750, 'swing');
	}
	
	/****************************************************
	 * _ftw:void                                        *
	 *                                                  *
	 * You win, one to nothing.                         *
	 ****************************************************
	/                                                  */
	var _ftw = function() {
		thouArtVictorious = true;
		$('#download').click(_download);
		$('#win').animate({'left':'0px'}, 750, 'swing');
	}
	
	return public;
})();
$(document).ready(cyprus.parts.init);