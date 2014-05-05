
(function () {

    angular.module('app', ['SharedDataService'])
        .factory('deserialiseSharedPropertiesService', function() {
                return function(serialisedSharedProperties){
                    var returnVal = [];
                    _.each(serialisedSharedProperties.split(','), function (property) {
                        returnVal.push(property);
                    })
                    return returnVal;
                }
        })
    	.controller('parentSuperheroCtrl', function ($scope, SharedDataService, deserialiseSharedPropertiesService) {
            $scope.init = function(serialisedSharedProperties){
                var availableProperties = deserialiseSharedPropertiesService(serialisedSharedProperties)
                $scope.superheroSharedDataAccessor = SharedDataService.globalNamespace("superhero", availableProperties);
                $scope.superheroSharedData = $scope.superheroSharedDataAccessor.getData();
                $scope.superheroSharedData.name = "Walter White";
                $scope.superheroSharedData.power = "Making the blue stuff";
                $scope.superheroSharedData.weakness = "Vanity";
            }
    	})
        .controller('childSuperheroCtrl', function ($scope, SharedDataService, deserialiseSharedPropertiesService) {
             $scope.init = function(serialisedSharedProperties){
                var availableProperties = deserialiseSharedPropertiesService(serialisedSharedProperties)
                $scope.superheroSharedDataAccessor = SharedDataService.globalNamespace("superhero", availableProperties);
            }
        })
        .controller('dogCtrl', function ($scope, SharedDataService) {
            $scope._sharedDataScopedNamespaceId = "soundMaker";
            $scope.soundMakerSharedDataAccessor = SharedDataService.scopedNamespace($scope, "soundMaker", ["invoke"]);
            $scope.soundMakerSharedDataAccessor.getData().invoke = function( ){
                alert ("woof woof!");
            }
        })
        .controller('catCtrl', function ($scope, SharedDataService) {
            $scope._sharedDataScopedNamespaceId = "soundMaker";
            $scope.soundMakerSharedDataAccessor = SharedDataService.scopedNamespace($scope, "soundMaker", ["invoke"]);
            $scope.soundMakerSharedDataAccessor.getData().invoke = function( ){
                alert ("Meow!");
            }
        })
        .directive('soundMaker', function (SharedDataService) {
            return {
                replace: true,
                scope: {},
                link: function($scope) {
                    var soundMakerSharedDataAccessor = SharedDataService.scopedNamespace($scope, "soundMaker", ["invoke"]);
                    $scope.makeSound = function () {
                        soundMakerSharedDataAccessor.getData().invoke();
                    }
                },
                template: "<div><button type='button' ng-click='makeSound()'>Make sound</button></div>"

            }
        })
        .directive('sharedDataInfo', function() {
            return {
                replace: true,
                scope: {
                    accessor: "="
                },
                template: "<div class='column'><span class='info' ng-repeat='(key, value) in accessor.getInfo()'>{{key}}: {{value}}</span></div>"            
            }
        })
        .directive('sharedDataInputs', function() {
            return {
                replace: true,
                scope: {
                    properties: "@",
                    accessor: "="
                },
                template: function(scope, attrs) {
                    var template = "";
                    _.each(attrs.properties.split(","), function(property) {
                        template += "<span class='input'>" + property + ":<input type='text' ng-model='accessor.getData()." + property + "'/></span>"
                    })
                    return "<div class='column'>" + template + "</div>"     
                }
            }
        })
        .factory('SharedDataService', function () {
            var SharedDataService = function () {
                var _scopedData = {},
                    _namespacedData = {},
                    _determineNamespacedScopeId = function ($scope, scopeNamespace) {
                        if($scope === null || typeof $scope === 'undefined') {
                            return '$rootScope';
                        }
                        if($scope._sharedDataScopedNamespaceId === scopeNamespace) {
                            return $scope.$id;
                        }

                        return _determineNamespacedScopeId($scope.$parent, scopeNamespace);
                        
                    },
                    _setupAccessor = function (referenceObject, accessiblePropertyNames, type, namespace, scopeId) {
                        var accessorObject = {},
                            propertyNames = typeof accessiblePropertyNames === 'string' ? [accessiblePropertyNames] : accessiblePropertyNames;
                        propertyNames.forEach(function(propertyName) {
                            Object.defineProperty(accessorObject, propertyName, {
                                get: function() { return referenceObject[propertyName] },
                                set : function(newValue){ referenceObject[propertyName] = newValue },
                                enumerable: true,
                                configurable: true
                            }); 
                        });
                        return {
                            getData: function() {
                                return accessorObject;
                            },
                            getInfo: function () {
                                return {
                                    type: type,
                                    namespace: typeof scopeId !== "undefined" ? scopeId + "." + namespace : namespace,
                                    properties: propertyNames
                                }
                            }
                        }
                    };
                return {
                    scopedNamespace: function ($scope, scopeNamespace, accessiblePropertyNames) {
                        var namespacedScopeId = _determineNamespacedScopeId($scope, scopeNamespace);
                        if (typeof _scopedData[namespacedScopeId] === 'undefined') {
                            _scopedData[namespacedScopeId] = {};
                        }
                        if (typeof _scopedData[namespacedScopeId][scopeNamespace] === 'undefined') {
                            _scopedData[namespacedScopeId][scopeNamespace] = {};
                        }
                        return _setupAccessor(_scopedData[namespacedScopeId][scopeNamespace], accessiblePropertyNames, "scoped", scopeNamespace, namespacedScopeId);
                    },
                    globalNamespace: function (namespace, accessiblePropertyNames) {
                        if (typeof _namespacedData[namespace] === 'undefined') {
                            _namespacedData[namespace] = {};
                        }
                        return _setupAccessor(_namespacedData[namespace], accessiblePropertyNames, "global", namespace);

                    }
                }
            };
            return SharedDataService();
        });
}());
