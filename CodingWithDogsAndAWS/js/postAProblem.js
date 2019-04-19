/*global WildRydes _config*/

var ProblemsWin = window.ProblemsWin || {};

(function problemsScopeWrapper($) {
    //auth token used as 
    var authToken;
    ProblemsWin.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });

    //step 1: load all problems into a variable as soon as the page loads
    //get request api 
    function problemsGET() {
        $.ajax({
            type: 'GET',
            url: _config.api.invokeUrl + '/problems',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: completeGETProblemsRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('Error during GET request:\n' + jqXHR.responseText);
            }
        });
    }
    
    //put request api
    function problemsPOST(q , a) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/problems',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({ 
                problemQ: q, //question
                problemA: a  //answer
            }),
            contentType: 'application/json',
            
            success: function (data) {
                alert("Post Successful!"); //reload the page and trigger the "GET" call above
            },
            
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert(jqXHR.responseText);
            }
        });
        //return false;
        //prevent the default behavior of a button because otherwise 
        //if you don't do this, it will just refresh the page before
        //your Ajax requests can complete
    }


    //fill storeProblems array!!
    function completeGETProblemsRequest(result) {
        //clear
        $('#probTable').html('');
        result.Items.forEach(function (prob) {
            $('#probTable').append('<tr><td>' + prob.problemQ + '</td><td>' + prob.problemA + '</td></tr>');
        })
        alert("Get Successful!");
    }


    // Register click handler for #request button
    $(function onDocReady() {
        $('#put').click(handlePOSTClick);
        $('#get').click(handleGETClick);
        $('#signOut').click(function () {
            ProblemsWin.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });

        ProblemsWin.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    //put problem event
    function handlePOSTClick(event) {
        var q = $('#probQ').val();
        var a = $('#probA').val();
        if (q == '' || a == '') {
            alert("Please fill out both fields!");
            return;
        }
        document.getElementById("put").value = '';
        document.getElementById("get").value = '';
        event.preventDefault();
        problemsPOST(q, a);
    }
    
    //get problem event
    function handleGETClick(event) {
        event.preventDefault();
        problemsGET();
    }

    //used for authToken
    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
