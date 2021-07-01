// Speech Speech SDK Authorization token 

// Note: Replace the URL with a valid endpoint to retrieve
//       authorization tokens for your subscription.

// An authorization token is a more secure method to authenticate for a browser deployment as
// it allows the subscription keys to be kept secure on a server and a 10 minute use token to be
// handed out to clients from an endpoint that can be protected from unauthorized access.
var authorizationEndpoint = "token.php";

function RequestAuthorizationToken() {
    if (authorizationEndpoint) {
        var a = new XMLHttpRequest();
        a.open("GET", authorizationEndpoint);
        a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        a.send("");
        a.onload = function () {
            var token = JSON.parse(atob(this.responseText.split(".")[1]));
            regionOptions.value = token.region;
            authorizationToken = this.responseText;
            key.disabled = true;
            key.value = "using authorization token (hit F5 to refresh)";
            console.log("Got an authorization token: " + token);
        }
    }
}


// Speech SDK presence check 

// On document load resolve the Speech SDK dependency
function Initialize(onComplete) {
    if (!!window.SpeechSDK) {
        document.getElementById('content').style.display = 'block';
        document.getElementById('warning').style.display = 'none';
        onComplete(window.SpeechSDK);
    }
}


// Browser Hooks 

var SpeechSDK;
var phraseDiv;
var key, authorizationToken;
var regionOptions;
var languageOptions, formatOption, microphoneSources;
var recognizer;
var inputSourceMicrophoneRadio;
var scenarioSelection, scenarioStartButton;
var formatSimpleRadio;
var reco;
var referenceText;
var recognizedText;

var thingsToDisableDuringSession;

var soundContext = undefined;
try {
    var AudioContext = window.AudioContext // our preferred impl
        || window.webkitAudioContext       // fallback, mostly when on Safari
        || false;                          // could not find.

    if (AudioContext) {
        soundContext = new AudioContext();
    } else {
        alert("Audio context not supported");
    }
} catch (e) {
    window.console.log("no sound context found, no audio output. " + e);
}

function CountDownTimer(duration, granularity) {
    this.duration = duration;
    this.granularity = granularity || 1000;
    this.tickFtns = [];
    this.running = false;
}

CountDownTimer.prototype.start = function () {
    if (this.running) {
        return;
    }
    scenarioStartButton.disabled = true;
    this.running = true;
    var start = Date.now(),
        that = this,
        diff, obj;

    (function timer() {
        diff = that.duration - (((Date.now() - start) / 1000) | 0);

        if (diff > 0) {
            setTimeout(timer, that.granularity);
        } else {
            diff = 0;
            reco.stopContinuousRecognitionAsync(
                function () {
                    reco.close();
                    reco = undefined;
                },
                function (err) {
                    reco.close();
                    reco = undefined;
                }
            );
            that.running = false;
        }

        obj = CountDownTimer.parse(diff);
        that.tickFtns.forEach(function (ftn) {
            ftn.call(this, obj.minutes, obj.seconds);
        }, that);
    }());
};

CountDownTimer.prototype.onTick = function (ftn) {
    if (typeof ftn === 'function') {
        this.tickFtns.push(ftn);
    }
    return this;
};

CountDownTimer.prototype.expired = function () {
    return !this.running;
};

CountDownTimer.parse = function (seconds) {
    return {
        'minutes': (seconds / 60) | 0,
        'seconds': (seconds % 60) | 0
    };
};

function format(minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = minutes + ':' + seconds;
}

function resetUiForScenarioStart() {
    phraseDiv.innerHTML = "";
    recognizedText = "";
}

document.addEventListener("DOMContentLoaded", function () {
    scenarioStartButton = document.getElementById('scenarioStartButton');
    scenarioSelection = document.getElementById('scenarioSelection');
    phraseDiv = document.getElementById("phraseDiv");
    key = document.getElementById("key");
    languageOptions = document.getElementById("languageOptions");
    regionOptions = document.getElementById("regionOptions");
    microphoneSources = document.getElementById("microphoneSources");
    inputSourceMicrophoneRadio = document.getElementById('inputSourceMicrophoneRadio');
    formatSimpleRadio = document.getElementById('formatSimpleRadio');

    referenceText = "Amur Anakonda Aligator Alpaka Bóbr Byk Biedronka Bocian Bąk Bażant Boa Bizon Baran Czapla Chrząszcz Chomik Czajka Czyż Dorsz Daniel Delfin Dzik Dziobak Dingo Dikdik Diabeł Dodo Emu Eland Edredon Ekskulapa Fenek Flądra Flaming Foka Fretka Gołąb Guziec Gepard Goryl Grizly Gęś Gil Gronostaj Hiena Hipopotam Homar Halibut Iguana Indyk Ibis Irbis Impala Jaguar Jeleń Jastrząb Jeż Jak Jaskółka Jedwabnik Jeżozwierz Jesiotr Jednot Jaszczurka Koala Krowa Koń Kura Kapibara Kaczka Kanczyl Kangur Królik Kruk Kalmar Kajman Karaluch Koza Karaś Kormoran Koczkodan Kondor Kaszalot Kret Kot Leszcz Likaon Lama Legwan Leming Leniwiec Lew Lis Leopard Łabędź Łania Łasica Łęczak Łoś Łosoś Mrówkojad Małpa Mysz Manta Mors Morświn Murena Motyl Małż Mol Makrela Nietoperz Nosorożec Nartnik Narwal Niedźwiedź Norka Nornica Nosacz Orangutan Okapi Okoń Ocelot Orka Orzeł Ostryga Osa Osioł Ośmiornica Owca Pająk Panda Pantera Papuga Pawian Pelikan Pies Pingwin Puma Pyton Rak Rekin Renifer Ropucha Rosomak Rozgwiazda Rybik Ryś Surykatka Struś Szczur Sęp Sikorka Sarna Sowa Salamandra Szympans Słoń Sokół Szczupak Traszka Tygrys Tarantula Truteń Tapir Trzmiel Uszatka Uchatka Ukleja Wombat Wieloryb Wilk Wielbłąd Wąż Wieprz Wół Ważka Wiewiórka Waran Wrona Zebra Zając Zaskroniec Zięba Zimorodek Żyrafa Żuk Żółw Żuraw Żmija Żubroń Żbik Żubr";

    display = document.querySelector('#timer');
    timer = new CountDownTimer(30),
        timeObj = CountDownTimer.parse(30);
    format(timeObj.minutes, timeObj.seconds);

    timer.onTick(format);

    thingsToDisableDuringSession = [
        key,
        regionOptions,
        languageOptions,
        inputSourceMicrophoneRadio,
        scenarioSelection,
        formatSimpleRadio
    ];

    scenarioStartButton.addEventListener("click", function (e) {
        if (!key.value) {
            alert("Please enter your Cognitive Services Speech subscription key!");
            e.preventDefault();
            return false;
        }
        else {
            timer.start();
            doContinuousRecognition();
        }
    });

    function enumerateMicrophones() {
        if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log(`Unable to query for audio input devices. Default will be used.\r\n`);
            return;
        }

        navigator.mediaDevices.enumerateDevices().then((devices) => {
            microphoneSources.innerHTML = '';

            // Not all environments will be able to enumerate mic labels and ids. All environments will be able
            // to select a default input, assuming appropriate permissions.
            var defaultOption = document.createElement('option');
            defaultOption.appendChild(document.createTextNode('Default Microphone'));
            microphoneSources.appendChild(defaultOption);

            for (const device of devices) {
                if (device.kind === "audioinput") {
                    if (!device.deviceId) {
                        window.console.log(
                            `Warning: unable to enumerate a microphone deviceId. This may be due to limitations`
                            + ` with availability in a non-HTTPS context per mediaDevices constraints.`);
                    }
                    else {
                        var opt = document.createElement('option');
                        opt.value = device.deviceId;
                        opt.appendChild(document.createTextNode(device.label));

                        microphoneSources.appendChild(opt);
                    }
                }
            }

            microphoneSources.disabled = (microphoneSources.options.length == 1);
        });
    }

    inputSourceMicrophoneRadio.addEventListener("click", function () {
        enumerateMicrophones();
    });

    enumerateMicrophones();

    Initialize(function (speechSdk) {
        SpeechSDK = speechSdk;

        // in case we have a function for getting an authorization token, call it.
        if (typeof RequestAuthorizationToken === "function") {
            RequestAuthorizationToken();
        }
    });
});


// Configuration and setup common to SDK objects, including events 

function getAudioConfig() {
    // Depending on browser security settings, the user may be prompted to allow microphone use. Using
    // continuous recognition allows multiple phrases to be recognized from a single use authorization.
    if (microphoneSources.value) {
        return SpeechSDK.AudioConfig.fromMicrophoneInput(microphoneSources.value);
    } else {
        return SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    }
}

function getSpeechConfig(sdkConfigType) {
    var speechConfig;
    if (authorizationToken) {
        speechConfig = sdkConfigType.fromAuthorizationToken(authorizationToken, regionOptions.value);
    } else if (!key.value) {
        alert("Please enter your Cognitive Services Speech subscription key!");
        return undefined;
    } else {
        speechConfig = sdkConfigType.fromSubscription(key.value, regionOptions.value);
    }

    speechConfig.speechRecognitionLanguage = languageOptions.value;
    return speechConfig;
}

function onRecognizing(sender, recognitionEventArgs) {
    var result = recognitionEventArgs.result;
    console.log(`(recognizing) Reason: ${SpeechSDK.ResultReason[result.reason]}`
        + ` Text: ${result.text}\r\n`);
    // Update the hypothesis line in the phrase/result view (only have one)
    phraseDiv.innerHTML = phraseDiv.innerHTML.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2')
        + `${result.text} [...]\r\n`;
    phraseDiv.scrollTop = phraseDiv.scrollHeight;
}

function onRecognized(sender, recognitionEventArgs) {
    var result = recognitionEventArgs.result;
    onRecognizedResult(recognitionEventArgs.result);
}

function onRecognizedResult(result) {
    phraseDiv.scrollTop = phraseDiv.scrollHeight;

    console.log(`(recognized)  Reason: ${SpeechSDK.ResultReason[result.reason]}`);
    if (scenarioSelection.value === 'speechRecognizerRecognizeOnce'
        || scenarioSelection.value === 'intentRecognizerRecognizeOnce') {
        // Clear the final results view for single-shot scenarios
        phraseDiv.innerHTML = '';
    } else {
        // Otherwise, just remove the ongoing hypothesis line
        phraseDiv.innerHTML = phraseDiv.innerHTML.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2');
    }

    if (result.text !== "") {
        recognizedText += (" " + result.text);
    }
    console.log(recognizedText);
}

function onSessionStarted(sender, sessionEventArgs) {
    console.log(`(sessionStarted) SessionId: ${sessionEventArgs.sessionId}\r\n`);

    for (const thingToDisableDuringSession of thingsToDisableDuringSession) {
        thingToDisableDuringSession.disabled = true;
    }

    scenarioStartButton.disabled = true;
}

function onSessionStopped(sender, sessionEventArgs) {
    console.log(`(sessionStopped) SessionId: ${sessionEventArgs.sessionId}\r\n`);

    if (scenarioSelection.value == 'speechRecognizerContinuous') {
        newCombeTestScore(sessionEventArgs.sessionId);
    }

    for (const thingToDisableDuringSession of thingsToDisableDuringSession) {
        thingToDisableDuringSession.disabled = false;
    }

    scenarioStartButton.disabled = false;
}

function onCanceled(sender, cancellationEventArgs) {
    window.console.log(e);

    console.log("(cancel) Reason: " + SpeechSDK.CancellationReason[e.reason]);
    if (e.reason === SpeechSDK.CancellationReason.Error) {
        console.log(": " + e.errorDetails);
    }
    console.log("\r\n");
}

function applyCommonConfigurationTo(recognizer) {
    // The 'recognizing' event signals that an intermediate recognition result is received.
    // Intermediate results arrive while audio is being processed and represent the current "best guess" about
    // what's been spoken so far.
    recognizer.recognizing = onRecognizing;

    // The 'recognized' event signals that a finalized recognition result has been received. These results are
    // formed across complete utterance audio (with either silence or eof at the end) and will include
    // punctuation, capitalization, and potentially other extra details.
    // 
    // * In the case of continuous scenarios, these final results will be generated after each segment of audio
    //   with sufficient silence at the end.
    // * In the case of intent scenarios, only these final results will contain intent JSON data.
    // * Single-shot scenarios can also use a continuation on recognizeOnceAsync calls to handle this without
    //   event registration.
    recognizer.recognized = onRecognized;

    // The 'canceled' event signals that the service has stopped processing speech.
    // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
    // This can happen for two broad classes of reasons:
    // 1. An error was encountered.
    //    In this case, the .errorDetails property will contain a textual representation of the error.
    // 2. No additional audio is available.
    //    This is caused by the input stream being closed or reaching the end of an audio file.
    recognizer.canceled = onCanceled;

    // The 'sessionStarted' event signals that audio has begun flowing and an interaction with the service has
    // started.
    recognizer.sessionStarted = onSessionStarted;

    // The 'sessionStopped' event signals that the current interaction with the speech service has ended and
    // audio has stopped flowing.
    recognizer.sessionStopped = onSessionStopped;
}

function newCombeTestScore(sessionId) {
    // strip punctuation
    var referenceWords = referenceText.toLowerCase().split(' ');

    var recognizedWords = [];
    recognizedWords = recognizedText.toLowerCase().replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "").split(' ').slice(1, -1);

    const intersection = [...new Set(referenceWords.filter(element => recognizedWords.includes(element)))]
    var matches = intersection.length;

    var completeness = (matches / referenceWords.length) * 100;

    phraseDiv.innerHTML =
        `SessionId: ${sessionId};
                Reference words: ${referenceWords.length};
                Recognized words: ${recognizedWords.length};
                Matched words: ${matches};
                Score: ${completeness}%.\n`;
}


// Top-level scenario function 


function doContinuousRecognition() {
    resetUiForScenarioStart();

    var audioConfig = getAudioConfig();
    var speechConfig = getSpeechConfig(SpeechSDK.SpeechConfig);
    if (!speechConfig) return;

    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    applyCommonConfigurationTo(reco);

    // Start the continuous recognition. Note that, in this continuous scenario, activity is purely event-
    // driven, as use of continuation (as is in the single-shot sample) isn't applicable when there's not a
    // single result.
    reco.startContinuousRecognitionAsync();
}
