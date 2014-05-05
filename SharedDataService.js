
(function () {

    angular.module('SharedDataService', [])
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
