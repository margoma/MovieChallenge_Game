 function headerDirective(){
	return{
		restrict:'A',
		templateUrl:'views/header.html'
	}
};
function bodyGameDirective(){
	return{
		restrict:'A',
		templateUrl:'views/bodygame.html'
	}
};

function modalDirective() {
    return {
      	templateUrl: 'views/modal.html',
     	 restrict: 'E',
      	transclude: true,
      	replace:true,
      	scope:true,
      	link: function postLink(scope, element, attrs) {
        	scope.title = attrs.title;

        	scope.$watch(attrs.visible, function(value){
          		if(value == true)
            		$(element).modal('show');
          		else
            		$(element).modal('hide');
        	});

        	$(element).on('shown.bs.modal', function(){
          		scope.$apply(function(){
            		scope.$parent[attrs.visible] = true;
          		});
        	});

        	$(element).on('hidden.bs.modal', function(){
        		scope.$apply(function(){
            		scope.$parent[attrs.visible] = false;
          		});
          		console.log(attrs.title)
          		if(attrs.title=="Game Over!"){
          			window.location.reload();
          		}
       		});
    	}
    }	
};
	(function(){
	var dir=angular.module('myApp.directives',[])
	dir.directive("ngMyheader",headerDirective);
	dir.directive("ngBodygame",bodyGameDirective);
	dir.directive("modal",modalDirective);
})();