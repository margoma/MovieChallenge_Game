
var app= angular.module("myApp.services", []);
	app.service('ApiRequestService',function($q){
		var genres;	
		var threeFilms=[];
		var threeFilmsId=[];
		var trailerFilm;
		var player;
		function error(response) {
			var deferred = $q.defer();
    		deferred.reject(response);
    	};	
		var addGenres = function(){
			var deferred = $q.defer();//promesa para hacer la request sincrona.
			theMovieDb.genres.getList({}, // get para obtener los géneros
			function (response) {
				var resp=JSON.parse(response);
    			genres=resp.genres;
    			/*for (var i = genres.length - 1; i >= 0; i--) {
    				if(genres[i].name==="Documentary"){
    					genres.splice(i, 1);
    				}
    			}*/
   				deferred.resolve(genres)
			},error);
			return deferred.promise;
		};
		var addFilmsByGenre= function(genreId){
			threeFilms=[];
			threeFilmsId=[];
			var deferred = $q.defer();
			theMovieDb.genres.getMovies({"id":genreId},
			 function (response) {
			 	var resp=JSON.parse(response).results;
			 	deferred.resolve(resp);
			 },error)
			 return deferred.promise;
		};
		var getSelectedMovie=function(filmsArray){
			var deferred = $q.defer();
			var randomElement=Math.floor((Math.random()* filmsArray.length) + 0);
		 	var filmId=filmsArray[randomElement].id;
		 	theMovieDb.movies.getTrailers({"id":filmId}, function (response) {
			 	var resp=JSON.parse(response);
			 		if(resp.youtube[0]!==undefined){
			 		trailerFilm=filmsArray[randomElement]
			 		threeFilmsId.push(filmsArray[randomElement].id);
			 		deferred.resolve(resp);
			 	}
			 	else{
			 		console.log(filmsArray)
			 		console.log("no trailer" + resp.id);
			 		filmsArray.splice(randomElement, 1);
			 		deferred.resolve(getSelectedMovie(filmsArray));//si no hay trailer quitame esa peli del array y vuelve a ejecutar la funcion addTrailer
			 	}
			 	
			 },error)
			 return deferred.promise;
		}
		var getFilmInfo= function(filmId){
			var deferred = $q.defer();
			theMovieDb.movies.getById({"id":filmId}, function (response) {
			 	var resp=JSON.parse(response)
			 	deferred.resolve(resp.tagline);
			 	}, error);
			return deferred.promise;
		}
		var getThreeFilms= function(filmsArray){
			threeFilms.push(trailerFilm);
			var i = 0;
			while(threeFilms.length<3 && i <100){
				var randomFilm=Math.floor(Math.random()* filmsArray.length);
		 		if(threeFilmsId.indexOf(filmsArray[randomFilm].id)===-1 ){
		 			threeFilms.push(filmsArray[randomFilm]);
		 			threeFilmsId.push(filmsArray[randomFilm].id)
		 		}
		 		++i;
		 	}
		 	
		 	return threeFilms;
		};
		var getByActor=function(actorName){
			var deferred = $q.defer();
			theMovieDb.search.getPerson({"query":actorName}, function(response){
				var resp=JSON.parse(response);
				if(!resp.results[0]){
					deferred.resolve(undefined)
				}else{
					var actorFilms=resp.results[0].known_for;
					deferred.resolve(actorFilms)
				}
			}, error)
			return deferred.promise;
		};
		var youtubePlayer=function(source){
			if (player){
 				player.destroy();
			};
		 	player = new YT.Player("player", {
	    		height: '480',
	    		width: '854',
	    		playerVars: {start:20, end:30, modestbranding:1, autohide:0, showinfo:0, controls:0},
	    		videoId: source,
	    		events: {
	        		'onReady': function(event){

	        		},
	        		'onStateChange': function(event){
	        			if (event.data == YT.PlayerState.ENDED) {
	        				var imageEnd=angular.element(document.getElementById('imageEnd'));
	        				var iframe=angular.element(document.getElementById('player'));
	        				var hintButton=angular.element(document.getElementById('btnHint'));
	        				imageEnd.removeClass("hidden");
	        				iframe.addClass("hidden");
	        				hintButton.removeAttr("disabled");
	        			}
	    			}
	    		}
			})	
		};
		var getPlayer=function(){
			return player;
		}
		return {
			addGenres:addGenres,
			addFilmsByGenre:addFilmsByGenre,
			getSelectedMovie:getSelectedMovie,
			getFilmInfo:getFilmInfo,
			getThreeFilms:getThreeFilms,
			getByActor:getByActor,
			youtubePlayer:youtubePlayer,
			getPlayer:getPlayer
		}
	});
 	