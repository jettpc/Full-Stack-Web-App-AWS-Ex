

var ProblemsWin = window.ProblemsWin || {};

(function problemsScopeWrapper($) { 
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

    // Register click handler for #request button
    $(function onDocReady() {
        $('#signOut').click(function () {
            ProblemsWin.signOut();
            window.location = "signin.html";
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    //step 1: load all problems into a variable as soon as the page loads
    //get request api
    $('document').ready(function problemsGET() {
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
    });

    var storeProblems = [];
    var currentProblem = 0;
    //fill storeProblems array!!
    function completeGETProblemsRequest(result) {
        result.Items.forEach(function (probItem) {
            let temp = {
                probQ: probItem.problemQ,
                probA: probItem.problemA
            };
            storeProblems.push(temp);
        });
    }

    //if user chooses to skip a question
    function nextQuestion() {
        currentProblem++;
        currentProblem = currentProblem % storeProblems.length;
        console.log(currentProblem);
        document.getElementById("displayProblem").innerHTML = storeProblems[currentProblem].probQ;
    }

    //timer and buttons related to timer!
    var ss = document.getElementsByClassName('stopwatch');
    //[] gives access to array prototypes like .forEach
    //keep seperate from on doc ready clicks to keep variables from being passed as params so much
    [].forEach.call(ss, function (s) {
        var currentTimer = 0,
            interval = 0,
            lastUpdateTime = new Date().getTime(),
            start = s.querySelector('button.start'),
            stop = s.querySelector('button.stop'),
            reset = s.querySelector('button.reset'),
            mins = s.querySelector('span.minutes'),
            secs = s.querySelector('span.seconds');
            start.addEventListener('click', startTimer);
            stop.addEventListener('click', stopTimer);
            reset.addEventListener('click', resetTimer);

        function pad(n) {
            return ('00' + n).substr(-2);
        }

        function update() {
            var now = new Date().getTime(),
            dt = now - lastUpdateTime;
            currentTimer += dt;
            var time = new Date(currentTimer);
            mins.innerHTML = pad(time.getMinutes());
            secs.innerHTML = pad(time.getSeconds());
            lastUpdateTime = now;
            document.getElementById("stopId").disabled = false;
        }

        //when start occurs - display element hiding the first question!
        function startTimer() {
            if (!interval) {
                lastUpdateTime = new Date().getTime();
                interval = setInterval(update, 1000);
            }
            nextQuestion();
            //document.getElementById("displayProblem").style.color = "black";
            document.getElementById("startId").style.display = "none";
        }

        function stopTimer() {
            let tempAnswer = document.getElementById("answerBox").value;
            //check if the input field is empty
            if (tempAnswer != "") {
                //check if the answer is correct!
                if (storeProblems[currentProblem].probA == tempAnswer) {
                    //set it back to default with no animation
                    correctAnimation();
                    document.getElementById("answerBox").value = '';
                    clearInterval(interval); //reset timer
                    interval = 0;
                    document.getElementById("inspiration").innerHTML = "Puppy: knows you're amazing.";
                    document.getElementById("stopId").disabled = true;
                } else {
                    wrongAnimation();
                    document.getElementById("answerBox").value = '';
                    document.getElementById("inspiration").innerHTML = "Puppy: helps you focus.";
                }
            } else { //if the input field is empty
                document.getElementById("inspiration").innerHTML = 'Puppy: stares at the EMPTY input field!';
            }
        }

        function resetTimer() {
            document.getElementById("answerBox").value = '';
            updatePuppy();
            clearInterval(interval);
            interval = 0;
            currentTimer = 0;
            mins.innerHTML = secs.innerHTML = pad(0);
            startTimer();
        }
    });

    //set anitmation name to correct keyframe and then change it back after 1s
    function correctAnimation() {
        document.getElementById("midContainer").style.animationName = "correct";
        setTimeout(function () {
            document.getElementById("midContainer").style.animationName = "none";
        }, 1000)
    }

    //set anitmation name to correct keyframe and then change it back after 1s
    function wrongAnimation() {
        document.getElementById("midContainer").style.animationName = "wrong";
        setTimeout(function () {
            document.getElementById("midContainer").style.animationName = "none";
        }, 2200)
    }

    //update the puppy to a random picture!
    var currentPuppy=0;
    var numOfPuppies = 8;
    function updatePuppy() {
        var randomInt = Math.floor(Math.random() * (7 - 0 + 1)) + 0;
        if (currentPuppy == randomInt) {
            currentPuppy = (randomInt + 1) % 8;
        } else {
            currentPuppy = randomInt;
        }
        //document.getElementById("puppyPics").style.backgroundImage = "url('../0 website - coding - comp/images/cp" + currentPuppy + ".jpg')";
        document.getElementById("puppyPics").style.backgroundImage = "url('images/cp" + currentPuppy + ".jpg')";
    }
    
    //used for authToken
    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
