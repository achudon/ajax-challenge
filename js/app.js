"use strict";

// set URL to use for getting all comments associated with app
var commentsUrl = 'https://api.parse.com/1/classes/comments';

// comments in sorted order
var sortedComments = [];

// set default https headers
angular.module('CommentsApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = '6OhY3PfXVGzUl1EtykGrx8mwFucViPaiQ2whvfLI';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'VCKjFlrHLe7l8YaMhAU9HmOu5dBhQaico5mMwNKh';
    })

    // set up controller
    .controller('CommentsController', function($scope, $http) {
        // function to refresh list of comments
        $scope.refreshComments = function() {
            $scope.loading = true;

            $http.get(commentsUrl)
                .success(function (data) {
                    if (data != null) {
                        $('#no-comments').hide();
                        sortedComments = data.results;
                        $scope.comments = data.results;
                        sortedComments = sortedComments.sort(function(a, b){return b.score- a.score});
                    }

                })
                .error(function (err) {
                    $scope.errorMessage = err;
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        // call function and refresh comments
        $scope.refreshComments();

        // set the score of a new comment to zero
        $scope.newComment = {score: 0};

        // add a comment to the page and to the database
        $scope.addComment = function() {
            $scope.inserting = true;
            // only add the comment if the user has entered both a title and comment body
            if (!($('#body').val() == "" || $('#title').val() == "")) {
                $('#errorMessage').hide();
                $http.post(commentsUrl, $scope.newComment)
                    .success(function(responseData) {
                        $scope.newComment.objectId = responseData.objectId;
                        $scope.comments.push($scope.newComment);
                        $scope.newComment = {score: 0};
                    })
                    .error (function(err){
                        $scope.errorMessage = err;
                    })
                    .finally(function() {
                        $scope.inserting = false;
                    }); //end of post request
            } else {
                $('#errorMessage').show();
                $scope.inserting = false;
                window.location.assign('#errorMessage');
            }
        }; // end of addComment function

        // reflect a change in a comment's score
        $scope.updateComment = function(comment) {
            $http.put(commentsUrl + '/' + comment.objectId, comment)
                .success(function() {
                    console.log('success');
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                });
        }; // end of updateComment function

        // delete a comment from the database and the page
        $scope.deleteComment = function(comment) {
            $scope.updating = true;
            $http.delete(commentsUrl + '/' + comment.objectId, comment)
                .success(function() {
                    console.log('success');
                    $scope.refreshComments();
                })
                .error(function(err) {
                    console.log(err);
                })
                .finally(function() {
                    $scope.updating = false;
                });
        }; //end of delete comment

        // increment or decrement the votes that a comment receives
        $scope.incrementVotes = function(comment, amount) {
            $scope.updating = true;
            $http.put(commentsUrl + '/' + comment.objectId, {
                score: {
                    __op: 'Increment',
                    amount: amount
                }
            })
                .success(function(responseData) {
                    console.log(responseData);
                    comment.score= responseData.score;
                })
                .error(function(err){
                    console.log(err);
                })
                .finally(function(responseData) {
                    $scope.updating = false;
                })

        }; // end of incrementVotes


    }); //end of controller function


