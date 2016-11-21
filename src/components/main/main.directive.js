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

        var ref = firebase.database().ref('users').child($scope.firebaseUser.uid).child("notes");
        $scope.notes = $firebaseArray(ref);

        $scope.recognizedText;
        artyom.redirectRecognizedTextOutput(function(recognized,isFinal){
          $scope.recognizedText = recognized || isFinal;
          $timeout(function() {
            $scope.recognizedText = null;
          }, 5000)
        });

        var commands = [
          {
            smart: true,
            indexes:["add a note *"],
            action: function(i, x) {
              artyom.say("Adding your note. "+ x, {onEnd:function(){artyom.clearGarbageCollection()}});
              $scope.notes.$add({text: x});
            }
          },
          {
            indexes:["hide the dashboard"],
            action: function(i) {
              artyom.say("Hiding the dashboard.", {onEnd:function(){artyom.clearGarbageCollection()}});
              preferencesRef.update({showDashboard:false});
            }
          },
          {
            indexes:["show the dashboard."],
            action: function(i) {
              artyom.say("Showing the dashboard.", {onEnd:function(){artyom.clearGarbageCollection()}});
              preferencesRef.update({showDashboard:true});
            }
          },
          {
            smart: true,
            indexes:["show an image of *"],
            action: function(i, x) {
              artyom.say("Showing an image of "+ x, {onEnd:function(){artyom.clearGarbageCollection()}});
              searchImage(x);
            }
          },
          {
            indexes:["show a random image"],
            action: function(i) {
              artyom.say("Showing a random image", {onEnd:function(){artyom.clearGarbageCollection()}});
              randomImage();
            }
          },
          {
            smart: false,
            indexes:["hello view", "i love you", "hello review"],
            action: function(i) {
              $scope.firebaseUser.getToken().then(function(token) {
                $http.get('/api/weather', { headers: {'x-access-token': token} })
                .success(function(response) {
                  if (!response.response.error) {
                    var greeting;
                    var d = new Date();
                    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                    var hh = d.getHours();
                    var m = d.getMinutes();
                    var dd = "AM";
                    var h = hh;

                    if (hh > 5 && hh < 12) {
                      greeting = 'Good morning! ';
                    } else if (hh > 11 && hh < 18) {
                      greeting = 'Good afternoon! ';
                    } else {
                      greeting = 'Good evening! ';
                    }

                    if (h >= 12) {
                        h = hh-12;
                        dd = "PM";
                    }
                    if (h == 0) {
                        h = 12;
                    }
                    m = m<10?"0"+m:m;
                    artyom.say(greeting+'It is '+days[d.getDay()]+', '+months[d.getMonth()]+' '+d.getDate()+' '+h+':'+m+' '+dd+'. The current temperature is '+response.current_observation.temp_f+' degrees. The upcoming weather forecast is '+response.forecast.txt_forecast.forecastday[0].fcttext, {onEnd:function(){artyom.clearGarbageCollection()}});
                  }
                });
              });
            }
          }
        ]

        artyom.fatality();
        artyom.addCommands(commands);
        $timeout(function(){
          artyom.initialize({
            lang:"en-GB",
            debug:false,
            listen:true,
            speed:0.9,
            continuous:true
          });
        },2000);

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

        function searchImage(categories) {
          $scope.firebaseUser.getToken().then(function(token) {
            $http.get('/api/unsplash?type=search&categories='+categories, { headers: {'x-access-token': token} })
            .success(function(response) {
              preferencesRef.update({backgroundImage:response});
            });
          });
        }

        function randomImage() {
          $scope.firebaseUser.getToken().then(function(token) {
            $http.get('/api/unsplash?type=random', { headers: {'x-access-token': token} })
            .success(function(response) {
              preferencesRef.update({backgroundImage:response});
            });
          });
        }

      },
      templateUrl: './components/main/main.template.html'
    }
};