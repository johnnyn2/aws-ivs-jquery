/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {PLAYBACK_URL} from './constants.js';

// Playback configuration
// Replace this with your own Amazon IVS Playback URL
const playbackUrl = PLAYBACK_URL;

// App
const videoPlayer = $("#video-player")[0];
const quizEl = $("#quiz");
const waitMessage = $("#waiting");
const questionEl = $("#question");
const answersEl = $("#answers");
const cardInnerEl = $("#card-inner");

$(document).ready(() => {
    // Remove card
    const removeCard = () => {
        quizEl.toggleClass("drop");
    }

    // Trigger quiz
    const triggerQuiz = metadataText => {
        let obj = JSON.parse(metadataText);

        quizEl.css('display', '');
        quizEl.removeClass("drop");
        waitMessage.hide();
        cardInnerEl.hide();
        cardInnerEl.css('pointer-events', 'auto');

        answersEl.empty();
        questionEl.text(obj.question);

        const createAnswers = (obj, i) => {
            const q = $('<a class="answer">' + obj.answers[i] + '</a>');
            q.on('click', event => {
                cardInnerEl.css('pointer-events', 'none');
                if (q.text() === obj.answers[obj.correctIndex]) {
                    q.toggleClass('correct');
                } else {
                    q.toggleClass('wrong');
                }
                setTimeout(() => {
                    removeCard();
                    waitMessage.css('display', '');
                }, 1050);
                return false;
            });
            answersEl.append(q);
        };

        for (let i = 0; i < obj.answers.length; i++) {
            createAnswers(obj, i);
        }
        cardInnerEl.css('display', '');
    }

    const IVSPlayer = window.IVSPlayer;

    const PlayerState = IVSPlayer.PlayerState;
    const PlayerEventType = IVSPlayer.PlayerEventType;

    // Initialize player
    const player = IVSPlayer.create();
    player.attachHTMLVideoElement(videoPlayer);

    // Attach event listeners
    player.addEventListener(PlayerState.PLAYING, () => {
        console.log("Player State - PLAYING");
    });
    player.addEventListener(PlayerState.ENDED, () => {
        console.log("Player State - ENDED");
    });
    player.addEventListener(PlayerState.READY, () => {
        console.log("Player State - READY");
    });
    player.addEventListener(PlayerEventType.ERROR, err => {
        console.warn("Player Event - ERROR:", err);
    });

    player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, cue => {
        const metadataText = cue.text;
        const position = player.getPosition().toFixed(2);
        console.log(
        `Player Event - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`
        );
        triggerQuiz(metadataText);
    });

    // Setup stream and play
    player.setAutoplay(true);
    player.load(playbackUrl);

    // Setvolume
    player.setVolume(0.1);

    waitMessage.css('display', '');
})