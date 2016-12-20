module.exports = function main($http, $cookies, $window, Auth, $firebaseArray, $firebaseObject, $timeout, $interval) {  
    return {
      scope: true,
      controller: function($scope, $element, $attrs) {
        var preferencesRef = firebase.database().ref('users/'+$scope.firebaseUser.uid+'/preferences');

        $scope.backgroundImage;
        var backgroundImageRef = firebase.database().ref('users/'+$scope.firebaseUser.uid+'/preferences/backgroundImage');
        var backgroundImage = $firebaseObject(backgroundImageRef);
        backgroundImage.$watch(function() {
          if(backgroundImage.$value && backgroundImage.$value !== 'undefined') {
            jQuery($element).find('.main-wrapper').css('background-image', 'url('+backgroundImage.$value+')');
          } else {
            jQuery($element).find('.main-wrapper').removeAttr( 'style' );
          }
        });

        $scope.showDashboard;
        var showDashboardRef = firebase.database().ref('users/'+$scope.firebaseUser.uid+'/preferences/showDashboard');
        var showDashboard = $firebaseObject(showDashboardRef);
        showDashboard.$watch(function() {
          $scope.showDashboard = showDashboard;
        });

        var opacity;
        var brightnessRef = firebase.database().ref('users/'+$scope.firebaseUser.uid+'/preferences/brightness');
        var brightness = $firebaseObject(brightnessRef);
        brightness.$watch(function() {
          opacity = Number(brightness.$value) * .01;
          jQuery('.brightness').remove();
          jQuery('head').append('<style class="brightness">main {opacity: '+opacity+';}</style>');

        });

        var ref = firebase.database().ref('users').child($scope.firebaseUser.uid).child("notes");
        $scope.notes = $firebaseArray(ref);

        position();
        $scope.inspectorOpen = false;
        
        jQuery($window).on('resize', function() {
          position();
        })

        function position() {
          var windowHeight = jQuery($element).find('.main').parent().height();
          var mainHeight = jQuery($element).find('.main').height();
          var mainWidth = jQuery($element).find('.main').width();
          var marginTop = (windowHeight - mainHeight) / 2;
          var widgetNumber = jQuery($element[0].querySelector('.main')).find('>div').length;
          
          jQuery($element[0].querySelector('.main')).css('marginTop', marginTop);
          jQuery($element[0].querySelector('.main')).find('>div').css('width', mainWidth/widgetNumber)
        }

        $scope.toggleInspector = function() {
          $scope.inspectorOpen = !$scope.inspectorOpen;
        }

        $scope.openInspector = function() {
          $scope.inspectorOpen = true;
        }
      },
      templateUrl: './components/main/main.template.html'
    }
};