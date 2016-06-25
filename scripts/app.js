
function showTrailer(selectedMovie, service){
	var id= selectedMovie.id;
	var source;
	for (var i=0; i<selectedMovie.youtube.length; i++) {
		if(selectedMovie.youtube[i].type==="Trailer"){
			source= selectedMovie.youtube[i].source;
			console.log(source)
			break;
		}
	}
	if(!source){
		source= selectedMovie.youtube[0].source;
	}
	var imageDiv=angular.element(document.getElementById("imageClick"));
	imageDiv.removeClass("hidden");
	service.youtubePlayer(source);
	var iframe= angular.element(document.getElementById('player'));
	var videoDiv=angular.element(document.getElementById("trailer"));
	var titles=angular.element(document.getElementById('titlesList'));
	iframe[0].setAttribute("data-id", id);
	videoDiv.addClass("hidden");
	titles.removeClass("hidden")
};
function shuffleArray(arrayFilms){
	for(var j, x, i = arrayFilms.length; i; j = parseInt(Math.random() * i), x = arrayFilms[--i], arrayFilms[i] = arrayFilms[j], arrayFilms[j] = x);
		 	//dar orden aleatorio a los elementos del array arrayFilms
	return arrayFilms;
};

(function(){
	var app= angular.module("myApp", ["myApp.services", "myApp.directives",'ngRoute']);
	app.config(function($routeProvider) {
        $routeProvider
            // route for the home page
            .when('/', {
                templateUrl : 'views/home.html',
                controller: 'IndexController'
            })

            // route for the game page
            .when('/game', {
                templateUrl : 'views/guess.html',
                controller: 'IndexController'
            })
    });
	app.controller("IndexController", ['$scope' ,'ApiRequestService', function ($scope, ApiRequestService){ 
		$(window).load(function() {
     		$('#loading').hide();
  		});
		$scope.showModal = false;
		var toggleModal = function(message, title){
        	$scope.showModal = !$scope.showModal;
        	$scope.message=message;
        	$scope.modalTitle=title;
    	};
    	$scope.searchBy="genre";
    	$scope.counter=1;
		$scope.coins=0;
		ApiRequestService.addGenres().then(function(data){//cuando obtengas los valores de la getGenres, me los guardas en $scope.genres
			$scope.genres= data;
		});
		$scope.reload= function(){
			window.location.reload();
		}
		$scope.showFilmByGenre= function(selectGenre){
			var hintButton=angular.element(document.getElementById('btnHint'));
			var hintText=angular.element(document.getElementById('infoHint'));
			var imageEnd=angular.element(document.getElementById('imageEnd'));
			imageEnd.addClass("hidden");
			$scope.tagline="";
			hintText.addClass("hidden");
			hintButton.attr("disabled", "disabled");
			ApiRequestService.addFilmsByGenre(selectGenre).then(function(result){
				ApiRequestService.getSelectedMovie(result).then(function(selectedMovie){
				var threeFilms=ApiRequestService.getThreeFilms(result);
				$scope.threeFilms=shuffleArray(threeFilms);
				showTrailer(selectedMovie, ApiRequestService);
				});	
			});
		};
		$scope.showFilmByActor=function(actor){
			var hintButton=angular.element(document.getElementById('btnHint'));
			var hintText=angular.element(document.getElementById('infoHint'));
			var imageEnd=angular.element(document.getElementById('imageEnd'));
			var contentModal=angular.element(document.getElementsByClassName('modal-content'));
			imageEnd.addClass("hidden");
			$scope.tagline="";
			hintText.addClass("hidden");
			hintButton.attr("disabled", "disabled");
			ApiRequestService.getByActor(actor).then(function(data){
				if(!data){
					contentModal.addClass("modalFail");
					contentModal.removeClass("modalCorrect");
					toggleModal(actor +" not found, try with another", "Ups!");
				}else{
					$scope.threeFilms=data;
					ApiRequestService.getSelectedMovie($scope.threeFilms).then(function(data){
	 					showTrailer(data, ApiRequestService);
	 				});
				}
			});
		}
		$scope.playVideo=function(){
			var player = ApiRequestService.getPlayer();
			player.playVideo();
			var image=angular.element(document.getElementById('imageClick'));
			var thevid=angular.element(document.getElementById('trailer')); 
			setTimeout(function(){
			thevid.toggleClass("hidden"); 
			image.toggleClass("hidden");
			},1000);
		}
		$scope.showHint= function(){
			var hintText=angular.element(document.getElementById('infoHint'));
			var imageEnd=angular.element(document.getElementById('imageEnd'));
			var titles=angular.element(document.getElementById('titlesList'));
			var thevid=angular.element(document.getElementById('trailer'));
			var correctFilm= angular.element(document.getElementsByTagName("iframe")).attr("data-id");
			var button=angular.element(document.getElementById(correctFilm));
			var contentModal=angular.element(document.getElementsByClassName('modal-content'));
			if($scope.coins>0){
				$scope.coins--;
			}
			if ($scope.counter>0){
				$scope.counter--;
				var filmId= angular.element(document.getElementsByTagName("iframe")).attr("data-id")
				ApiRequestService.getFilmInfo(filmId).then(function(data){
					$scope.tagline=data
				});
				hintText.removeClass("hidden");
			}else{
				contentModal.addClass("modalFail");
				contentModal.removeClass("modalCorrect");
				toggleModal("Sorry, not more life", "Game Over!");
				button.addClass("correctButton");
				console.log("game over")

			}
		}
		$scope.checkAnswer= function(filmId, title){
			var player = ApiRequestService.getPlayer();
			var imageEnd=angular.element(document.getElementById('imageEnd'));
			var titles=angular.element(document.getElementById('titlesList'));
			var thevid=angular.element(document.getElementById('trailer'));
			var correctFilm= angular.element(document.getElementsByTagName("iframe")).attr("data-id");
			var button=angular.element(document.getElementById(correctFilm));
			var hintText=angular.element(document.getElementById('infoHint'));
			var hintButton=angular.element(document.getElementById('btnHint'));
			var contentModal=angular.element(document.getElementsByClassName('modal-content'));
			player.pauseVideo();
			setTimeout(function(){
				if(filmId==correctFilm){
					console.log("correct")
					$scope.coins++;
					contentModal.addClass("modalCorrect");
					contentModal.removeClass("modalFail");
					toggleModal("Correct, the film is " + title, "Yujuuu!");
					$scope.$apply();
					if($scope.counter<3){
						$scope.counter++;
						//para k se actualice la variable scope (counter en este caso)
						//player.seekTo( player.getDuration(), true );//put state ENDED
					};
					hintText.addClass("hidden");
					hintButton.attr("disabled", "disabled");
					thevid.addClass("hidden"); 
					titles.addClass("hidden");
					imageEnd.addClass("hidden");
				}else{
					if($scope.counter>0){
						if($scope.coins>0){
							$scope.coins--;
						};
						contentModal.addClass("modalFail");
						contentModal.removeClass("modalCorrect");
						toggleModal("Sorry," + title + " is not the correct film", "Ups!");
						$scope.counter--;
						$scope.$apply();
						var titlesList=angular.element(document.getElementById("titlesList"));
						var buttons=angular.element(titlesList[0].getElementsByTagName("button"))
						buttons.attr("disabled", "disabled");
						button.addClass("correctButton");
					}else{
						contentModal.addClass("modalFail");
						contentModal.removeClass("modalCorrect");
						toggleModal("Sorry," + title + " is not the correct film", "Game Over!");
						$scope.$apply();
						button.addClass("correctButton");
					}
				}
			},100);
		}

	}]);


})();


