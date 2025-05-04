document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("settings");
    const submitBtn = document.getElementById("submitBtn");
    const myinputs = form.querySelectorAll("input");
    const sliders = document.querySelectorAll(".slider_wrap div");

    var brightness = document.getElementById("brightness"),
        sensor_timer = document.getElementById("sensor_timer"),
        summer_offset = document.getElementById("summer_offset"),
        winter_offset = document.getElementById("winter_offset"),
        cool = document.getElementById("cool"),
        warm = document.getElementById("warm"),
        hot = document.getElementById("hot"),
        inputs = [cool, warm, hot],
        led = [brightness],
        timer = [sensor_timer],
        summOff = [summer_offset],
        wintOff = [winter_offset],
        br = brightness.value,
        st = sensor_timer.value,
        so = summer_offset.value,
        wo = winter_offset.value,
        c = cool.value,
        w = warm.value,
        h = hot.value;

    let originalValues = new Map();

    // Slider configurations
    const sliderConfigs = [
        { id: "slider1", start: [br], range: { min: 0, max: 50 }, inputId: "brightness", padding: [1, 0] },
        { id: "slider2", start: [st], range: { min: 0, max: 15 }, inputId: "sensor_timer", padding: [1, 0] },
        { id: "slider3", start: [c, w, h], range: { min: 0, max: 40 }, inputIds: ["cool", "warm", "hot"], connect: [true, true, true, true], padding: [0, 0] },
        { id: "slider4", start: [so], range: { min: -12, max: 12 }, inputId: "summer_offset", padding: [1, 1] },
        { id: "slider5", start: [wo], range: { min: -12, max: 12 }, inputId: "winter_offset", padding: [1, 1] }
    ];

    // Initialize NoUiSliders
    sliders.forEach((slider, index) => {
        const config = sliderConfigs[index];

        noUiSlider.create(slider, {
            start: config.start,
            range: config.range,
            tooltips: true,
            connect: config.connect || [true, false],
            padding: config.padding || [0, 0], // Disable edges
            format: {
                to: value => Math.round(value),
                from: value => Number(value)
            }
        });

        // Store original values
        originalValues.set(slider, slider.noUiSlider.get());

        // Update corresponding input when slider changes
        if (Array.isArray(config.inputIds)) {
            slider.noUiSlider.on("update", function (values) {
                config.inputIds.forEach((inputId, idx) => {
                    document.getElementById(inputId).value = values[idx];
                });
            });
        } else {
            slider.noUiSlider.on("update", function (values) {
                document.getElementById(config.inputId).value = values;
            });
        }

        // Update slider when input changes
        if (Array.isArray(config.inputIds)) {
            config.inputIds.forEach((inputId, idx) => {
                document.getElementById(inputId).addEventListener("input", function () {
                    let newValues = config.inputIds.map(id => document.getElementById(id).value);
                    slider.noUiSlider.set(newValues);
                    checkChanges();
                });
            });
        } else {
            document.getElementById(config.inputId).addEventListener("input", function () {
                slider.noUiSlider.set(this.value);
                checkChanges();
            });
        }
    });

    // Store initial values for inputs
    myinputs.forEach(input => {
        originalValues.set(input, input.type === "checkbox" || input.type === "radio" ? input.checked : input.value);
    });

    function checkChanges() {
        let changed = false;

        myinputs.forEach(input => {
            if (originalValues.get(input) !== (input.type === "checkbox" || input.type === "radio" ? input.checked : input.value)) {
                changed = true;
            }
        });

        sliders.forEach(slider => {
            if (JSON.stringify(slider.noUiSlider.get()) !== JSON.stringify(originalValues.get(slider))) {
                changed = true;
            }
        });

        if (changed) {
            if (submitBtn.style.display === "none" || submitBtn.style.display === "") {
                submitBtn.style.display = "block"; // Ensure it's visible
                requestAnimationFrame(() => {
                    submitBtn.style.opacity = "1"; // Fade in
                    submitBtn.style.transform = 'scale(1.2)'; // Scale in
                });
            } else {
                // If already visible, just fade in again
                submitBtn.style.opacity = "1";
                submitBtn.style.transform = 'scale(1.2)'; // Scale in
            }
        } else {
            submitBtn.style.opacity = "0"; // Fade out
            submitBtn.style.transform = 'scale(1)'; // Scale out
        }
    }

    myinputs.forEach(input => input.addEventListener("input", checkChanges));
    sliders.forEach(slider => slider.noUiSlider.on("update", checkChanges));
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('settings');
    const submitBtn = document.getElementById('submitBtn');
    const overlay = document.getElementById('overlay');
  
    if (!form || !submitBtn || !overlay) {
      console.error('Required elements not found.');
      return;
    }
  
    // Display overlay when form is submitted
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent default form submission
  
      // Hide the submit button
      submitBtn.style.display = 'none';
  
      // Display the overlay and spinner
      overlay.classList.add('reveal');
      submitBtn.disabled = true;
  
      const formData = new FormData(form);
  
      fetch(form.action, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }
          return response.text(); // Adjust based on your server's response format
        })
        .then(data => {
          // Reload the page after a brief pause (optional for smoother transition)
          setTimeout(() => {
            window.location.reload();
          }, 300); // Feel free to tweak the delay
        })
        .catch(error => {
          console.error('Form submission error:', error);
          overlay.classList.remove('reveal');
          submitBtn.style.display = 'block';
          submitBtn.disabled = false;
          // Optional: Display an error message to the user
        });
    });
  });
// Temperature Toggle Switcher
const celciusRadio = document.getElementById("celcius");
const fahrenheitRadio = document.getElementById("fahrenheit");

const cel = document.getElementById("cel");
const fah = document.getElementById("fah");

function tempToggleBoxes() {
    cel.style.display = celciusRadio.checked ? "block" : "none";
    fah.style.display = fahrenheitRadio.checked ? "block" : "none";
}

document.querySelectorAll('.temp-toggles .radio-input').forEach(radio => {
    radio.addEventListener('change', tempToggleBoxes);
});
// Initialize correct box visibility on page load
tempToggleBoxes();

// DST Toggle Switcher
const summerRadio = document.getElementById("summer");
const winterRadio = document.getElementById("winter");

const sumR = document.getElementById("sumR");
const wintR = document.getElementById("wintR");

function dstToggleBoxes() {
    sumR.style.display = summerRadio.checked ? "block" : "none";
    wintR.style.display = winterRadio.checked ? "block" : "none";
}

document.querySelectorAll('.dst-toggles .radio-input').forEach(radio => {
    radio.addEventListener('change', dstToggleBoxes);
});
// Initialize correct box visibility on page load
dstToggleBoxes();


! function() {
    "use strict";
    document.getElementById("tabs");
    var e = document.querySelectorAll(".tab_panel"),
        t = document.querySelectorAll(".tab_heading"),
        i = [].slice.call(e);
    [].slice.call(t);

    function n(e, i) {
        i.forEach((function(i, n, o) {
            i !== e ? (i.setAttribute("aria-hidden", !0), t[n].setAttribute("aria-selected", !1)) : (i.setAttribute("aria-hidden", !1), t[n].setAttribute("aria-selected", !0))
        }))
    }

    function o(e) {
        var t = e.target.getAttribute("aria-controls");
        n(document.querySelector("#" + t), i), localStorage.setItem("lastTab", t)
    }(t.forEach((function(e, t, i) {
        e.addEventListener("click", o)
    })), localStorage.length > 0) && n(document.getElementById(localStorage.getItem("lastTab")), i)
}();


function removeSpaces(string){return string.split(' ').join('');}
function removeSpaceAfterComma(string){return string.replace(", ", ",");}

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}  

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}
/*
var today = new Date();
if (today.isDstObserved()) { 
    dst.classList.add("show");
}
*/

function update(){Math.floor((new Date).getTime()/1e3);document.body.className="darkmode",requestAnimationFrame(update)}requestAnimationFrame(update);

const accordionBtns = document.querySelectorAll(".accordion");
accordionBtns.forEach((accordion) => {
    accordion.onclick = function () {
        this.classList.toggle("is-open");
        let content = this.nextElementSibling;
        console.log(content);
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            console.log(content.style.maxHeight);
        }
    };
});

const fanenContent = document.querySelector('.fanen-content');
const faner = document.querySelectorAll('.fanen');
const tabIndicator = document.querySelector('.fanen-indicator');

faner.forEach((fanen, index) => {
    fanen.addEventListener('click', () => {
        faner.forEach(t => t.classList.remove('active'));
        fanen.classList.add('active');

        if (index === 0) {
            switchToTab(1);
        } else {
            switchToTab(2);
        }
    });
});

// Swipe Support
let startX = 0;
let currentX = 0;
let startY = 0;
let isSwiping = false;
let hasDragged = false;
let dragThreshold = 20; // Minimum movement to confirm dragging

function startSwipe(e) {
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    isSwiping = true;
    hasDragged = false;
}

function moveSwipe(e) {
    if (!isSwiping) return;

    currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diffX = currentX - startX;
    const diffY = (e.touches ? e.touches[0].clientY : e.clientY) - startY;

    // Only allow swipe when dragging beyond threshold
    if (Math.abs(diffX) > dragThreshold && Math.abs(diffX) > Math.abs(diffY)) {
        hasDragged = true;
        e.preventDefault(); // Prevent vertical scrolling
        fanenContent.style.transition = 'none';
        fanenContent.style.transform = `translateX(${getCurrentOffset() + diffX}px)`;
    }
}

function endSwipe(e) {
    if (!isSwiping) return;

    const diffX = currentX - startX;

    // If dragging occurred, process swipe logic
    if (hasDragged) {
        if (diffX > 50) {
            switchToTab(1); // Swipe Right → Show Tab 1
        } else if (diffX < -50) {
            switchToTab(2); // Swipe Left → Show Tab 2
        } else {
            resetPosition(); // Reset if swipe is too short
        }
    }

    isSwiping = false;
    hasDragged = false;
}

fanenContent.addEventListener('touchstart', startSwipe, { passive: false });
fanenContent.addEventListener('touchmove', moveSwipe, { passive: false });
fanenContent.addEventListener('touchend', endSwipe);

fanenContent.addEventListener('pointerdown', startSwipe);
fanenContent.addEventListener('pointermove', moveSwipe);
fanenContent.addEventListener('pointerup', endSwipe);

// Utility Functions
function switchToTab(tabNumber) {
    if (tabNumber === 1) {
        fanenContent.classList.remove('tab2-active');
        fanenContent.classList.add('tab1-active');
        tabIndicator.style.transform = 'translateX(0)';
    } else {
        fanenContent.classList.remove('tab1-active');
        fanenContent.classList.add('tab2-active');
        tabIndicator.style.transform = 'translateX(100%)';
    }

    fanenContent.style.transition = 'transform 0.2s ease-in-out';
    fanenContent.style.transform = getCurrentOffset() === 0 ? 'translateX(0)' : 'translateX(-50%)';
}

function getCurrentOffset() {
    return fanenContent.classList.contains('tab1-active') ? 0 : -fanenContent.clientWidth / 2;
}

function resetPosition() {
    fanenContent.style.transition = 'transform 0.2s ease-in-out';
    fanenContent.style.transform = getCurrentOffset() === 0 ? 'translateX(0)' : 'translateX(-50%)';
}

// Function to flip the card
function flipCard() {
    const card = document.getElementById('flipCard');
    card.classList.toggle('flip');
}

// OpenWeatherMap Sunrise/Sunset Widget
document.addEventListener('DOMContentLoaded', function() {
    function initOpenWeatherWidget() {
        const locationInput = document.getElementById('location');
        const apiKeyInput = document.getElementById('apikey');
        const submitButton = document.getElementById('submit-location');
        submitButton.style.display = 'none';
        const originalLocation = locationInput.value.trim();
        locationInput.addEventListener("input", function () {
            if (locationInput.value.trim() !== originalLocation) {
                submitButton.style.display = "block";
            } else {
                submitButton.style.display = "none";
            }
        });
        const sunPath = document.getElementById('curve');
        const titleElement = document.getElementById('title_');
        const sunriseTimeElement = document.getElementById('first-event');
        const sunsetTimeElement = document.getElementById('second-event');
        const sunlightHoursElement = document.getElementById('sunlight-hours-time');
        let sunriseTime, sunsetTime, timezoneOffset;
        function validateLocationInput(value) {
            return value && value.trim() !== '' && value.includes(',');
        }
        function updateSubmitButtonState() {
            submitButton.disabled = !validateLocationInput(locationInput.value);
        }
        function formatTime(date) {
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        function updateLocalTime(timezoneOffset) {
            const locationElement = document.getElementById('location');
            const localTimeElement = document.getElementById('localTime');
            if (!locationElement || !localTimeElement) return;
            const locationName = locationElement.textContent;
        
            function refreshTime() {
                const currentTime = new Date();
        
                // Create a Date object adjusted to the provided timezoneOffset
                const adjustedTime = new Date(currentTime.getTime() + (timezoneOffset) * 1000);
        
                // Use Intl.DateTimeFormat with the local time in mind
                const formattedTime = new Intl.DateTimeFormat('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC' // we can leave this as UTC, as the offset already corrects for time zone.
                }).format(adjustedTime);
        
                localTimeElement.textContent = `${locationName} ${formattedTime}`;
            }
        
            refreshTime();
            if (localTimeElement.dataset.timeIntervalId) clearInterval(localTimeElement.dataset.timeIntervalId);
            const intervalId = setInterval(refreshTime, 60000);
            localTimeElement.dataset.timeIntervalId = intervalId;
        } 
        function updateTimeZoneOffsetDisplay(timezoneOffset) {
            const offsetElement = document.getElementById('timezoneOffset');
            if (!offsetElement) return;
        
            const localOffsetMinutes = new Date().getTimezoneOffset(); // in minutes
            const localOffsetSeconds = -localOffsetMinutes * 60; // Convert to seconds
        
            const diffInHours = (timezoneOffset - localOffsetSeconds) / 3600;
        
            if (diffInHours === 0) {
                offsetElement.textContent = '';
            } else {
                const sign = diffInHours > 0 ? '+' : '';
                offsetElement.textContent = `${sign}${diffInHours}`;
            }
        }  
        function positionMarkerAlongPath(markerElement, progress) {
            const path = document.getElementById('curve');
            if (!path || !markerElement) return;
            const pathLength = path.getTotalLength();
            const point = path.getPointAtLength(progress * pathLength);
            markerElement.setAttribute('cx', point.x);
            markerElement.setAttribute('cy', point.y);
        }
        function setupSunAnimation() {
            if (!sunriseTime || !sunsetTime) return;
            const sunElement = document.getElementById('sunSVG');
            const sunMotion = document.getElementById('sunMotion');
            const sunriseMark = document.getElementById('sunriseMarker');
            const sunsetMark = document.getElementById('sunsetMarker');
            if (!sunElement || !sunriseMark || !sunsetMark) {
                console.warn("Missing SVG elements needed for animation");
                return;
            }
            function updateSunPosition() {
                const now = new Date();
                const localNow = new Date(now.getTime() + timezoneOffset * 1000);
                const secondsSinceMidnight = localNow.getUTCHours() * 3600 + localNow.getUTCMinutes() * 60 + localNow.getUTCSeconds();
                const dayProgress = secondsSinceMidnight / 86400;
                let existingMotion = sunElement.querySelector('animateMotion');
                const newMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
                newMotion.setAttribute("id", "sunMotion");
                newMotion.setAttribute("begin", "0s");
                newMotion.setAttribute("dur", "24h");
                newMotion.setAttribute("repeatCount", "indefinite");
                newMotion.setAttribute("path", "M0 69.8975C56.1994 69.8975 111.319 3 167.541 3C227.168 3 274.438 69.8975 335 69.8975");
                newMotion.setAttribute("keyPoints", `${dayProgress};1`);
                newMotion.setAttribute("keyTimes", "0;1");
                newMotion.setAttribute("calcMode", "linear");
                if (existingMotion) sunElement.removeChild(existingMotion);
                sunElement.appendChild(newMotion);
                if (localNow >= sunriseTime && localNow < sunsetTime) {
                    sunElement.setAttribute('fill', '#FFC300');
                } else {
                    sunElement.setAttribute('fill', '#777777');
                }
                updateBackgroundColor(localNow);
                console.log(`Updated sun position to ${dayProgress.toFixed(4)} of day`);
            }
            function updateBackgroundColor(currentTime) {
                const boxElement = document.querySelector('.box-large');
                if (!boxElement || !sunriseTime || !sunsetTime) return;
                const twentyMinutes = 20 * 60 * 1000;
                const beforeSunrise = new Date(sunriseTime.getTime() - twentyMinutes);
                const afterSunset = new Date(sunsetTime.getTime() + twentyMinutes);
                if (currentTime >= beforeSunrise && currentTime < sunriseTime) {
                    boxElement.style.backgroundColor = '#ff06bb0a';
                } else if (currentTime >= sunriseTime && currentTime < sunsetTime) {
                    boxElement.style.backgroundColor = '#ffffff0a';
                } else if (currentTime >= sunsetTime && currentTime < afterSunset) {
                    boxElement.style.backgroundColor = '#ff06bb0a';
                } else {
                    boxElement.style.backgroundColor = '#00000026';
                }
            }
            const sunriseSeconds = sunriseTime.getUTCHours() * 3600 + sunriseTime.getUTCMinutes() * 60;
            const sunriseProgress = sunriseSeconds / 86400;
            positionMarkerAlongPath(sunriseMark, sunriseProgress);
            const sunsetSeconds = sunsetTime.getUTCHours() * 3600 + sunsetTime.getUTCMinutes() * 60;
            const sunsetProgress = sunsetSeconds / 86400;
            positionMarkerAlongPath(sunsetMark, sunsetProgress);
            updateSunPosition();
            if (sunElement.dataset.updateIntervalId) clearInterval(parseInt(sunElement.dataset.updateIntervalId));
            const updateIntervalId = setInterval(updateSunPosition, 30000);
            sunElement.dataset.updateIntervalId = updateIntervalId;
        }       
        function updateSunTimes() {
            if (!sunriseTime || !sunsetTime || !sunriseTimeElement || !sunsetTimeElement) return;
            
            const now = new Date();
            const localNow = new Date(now.getTime() + timezoneOffset * 1000);
            const isBeforeSunrise = localNow < sunriseTime;
            const isAfterSunset = localNow > sunsetTime;
            const adjustedSunrise = new Date(sunriseTime.getTime() + 2 * 60000); // Add 2 minutes
            const adjustedSunset = new Date(sunsetTime.getTime() + 2 * 60000); // Add 2 minutes
        
            const firstEventElement = document.getElementById('first-event');
            const secondEventElement = document.getElementById('second-event');
        
            function updateElementContent(element, newContent) {
                if (element) {
                    // Add "hide" class to start the animation
                    element.classList.add('hide');
        
                    // Wait for the "hide" animation to complete, then update content
                    setTimeout(() => {
                        element.innerHTML = newContent;
        
                        // Remove "hide" and add "show" class for the reveal animation
                        element.classList.remove('hide');
                        element.classList.add('show');
                    }, 500); // Match this with the CSS transition duration
                }
            }
        
            // If it's before sunrise
            if (isBeforeSunrise) {
                updateElementContent(firstEventElement, `<span>Sunrise</span> ${formatTime(sunriseTime)}`);
                updateElementContent(secondEventElement, `<span>Sunset</span> ${formatTime(sunsetTime)}`);
            } 
            // If it's after sunset
            else if (isAfterSunset) {
                updateElementContent(firstEventElement, `<span>Sunrise Tomorrow</span> ${formatTime(adjustedSunrise)}`);
                updateElementContent(secondEventElement, `<span>Sunset Tomorrow</span> ${formatTime(adjustedSunset)}`);
            }
            // If it's between sunrise and sunset
            else {
                updateElementContent(firstEventElement, `<span>Sunset</span> ${formatTime(sunsetTime)}`);
                updateElementContent(secondEventElement, `<span>Sunrise Tomorrow</span> ${formatTime(adjustedSunrise)}`);
            }
        }
        
        function updateSunlightHours() {
            if (!sunriseTime || !sunsetTime || !sunlightHoursElement) return;
            const sunlightDuration = (sunsetTime - sunriseTime) / 1000;
            const hours = Math.floor(sunlightDuration / 3600);
            const minutes = Math.floor((sunlightDuration % 3600) / 60);
            sunlightHoursElement.textContent = `Total daylight hours ${hours}hrs ${minutes}mins`;
        }      
        async function fetchWeatherData() {
            try {
                const sunElement = document.getElementById('sunSVG');
                if (sunElement && sunElement.dataset.updateIntervalId) {
                    clearInterval(parseInt(sunElement.dataset.updateIntervalId));
                    sunElement.dataset.updateIntervalId = '';
                }
                if (sunriseTimeElement) sunriseTimeElement.textContent = '';
                if (sunsetTimeElement) sunsetTimeElement.textContent = '';
                if (sunlightHoursElement) sunlightHoursElement.textContent = '';
                if (submitButton) submitButton.disabled = true;
                const location = locationInput.value;
                const apiKey = apiKeyInput.value;
                const [city, countryCode] = location.split(',').map(part => part.trim());
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${apiKey}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Weather API returned ${response.status}: ${response.statusText}`);
                const data = await response.json();
                const sunriseUnix = data.sys.sunrise;
                const sunsetUnix = data.sys.sunset;
                timezoneOffset = data.timezone;

                updateTimeZoneOffsetDisplay(timezoneOffset);

                sunriseTime = new Date((sunriseUnix + timezoneOffset) * 1000);
                sunsetTime = new Date((sunsetUnix + timezoneOffset) * 1000);
                //if (titleElement) titleElement.textContent = `${data.name}, ${data.sys.country}`;
                updateSunTimes();
                updateSunlightHours();
                updateTemperatureDisplays(data);
                updateLocalTime(timezoneOffset);
                setupSunAnimation();
                updateSubmitButtonState();
                return true;
            } catch (error) {
                console.error('Error fetching weather data:', error);
                alert('Failed to fetch weather data. Please check your location input and try again.');
                updateSubmitButtonState();
                return false;
            }
        }
        function updateTemperatureDisplays(data) {
            if (!data || !data.main || !data.main.temp) return;
            const tempKelvin = data.main.temp;
            const tempCelsius = Math.round(tempKelvin - 273.15);
            const tempFahrenheit = Math.round((tempKelvin - 273.15) * 9/5 + 32);
            const celsiusDisplay = document.querySelector('#cel h4');
            const fahrenheitDisplay = document.querySelector('#fah h4');
            if (celsiusDisplay) celsiusDisplay.innerHTML = `${tempCelsius} <span>C</span>`;
            if (fahrenheitDisplay) fahrenheitDisplay.innerHTML = `${tempFahrenheit} <span>F</span>`;
            const conditionsElement = document.getElementById('conditions');
            if (conditionsElement && data.weather && data.weather[0]) {
                const weatherIcon = data.weather[0].icon;
                const weatherDescription = data.weather[0].description;
                conditionsElement.innerHTML =
                  `<img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" 
                       alt="${weatherDescription}" 
                       title="${weatherDescription}"
                       style="width: 50px; height: 50px;">`;
            }
        }
        locationInput.addEventListener('input', updateSubmitButtonState);
        submitButton.addEventListener('click', function() {
            if (validateLocationInput(locationInput.value)) {
                fetchWeatherData();
            }
        });
        locationInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter' && validateLocationInput(this.value)) {
                fetchWeatherData();
            }
        });
        updateSubmitButtonState();
        if (validateLocationInput(locationInput.value)) {
            fetchWeatherData();
        }
    }
    initOpenWeatherWidget();
});

/*
  function loadSystemInfo() {
    fetch('/system-info')
      .then(res => res.json())
      .then(info => {
        document.getElementById('sys-info').innerHTML = `
        <h3>System and Memory Health</h3>
        <div class="health_row" id="heap-status">Free Heap <span>${info.freeHeap} bytes</span></div>
        <div class="health_row">Heap Fragmentation <span>${info.heapFragmentation}%</span></div>
        <div class="health_row">Max Free Block <span>${info.maxFreeBlockSize} bytes</span></div>
        <div class="health_row">Uptime <span>${info.uptime}</span></div>
        `;
      })
      .catch(err => console.error(err));
  }*/

  function loadSystemInfo() {
    fetch('/system-info')
      .then(res => res.json())
      .then(info => {
        let heapStatus = "Unknown";
        let heapColor = "#aaa";
  
        if (info.freeHeap > 25000) {
          heapStatus = "Excellent";
          heapColor = "#00FF00";
        } else if (info.freeHeap > 15000) {
          heapStatus = "Good";
          heapColor = "#FFD700";
        } else {
          heapStatus = "Bad";
          heapColor = "#FF0000";
        }
        document.getElementById('sys-info').innerHTML = `
          <h3>System and Memory Health</h3>
          <div class="health_row" id="heap-status">
            Free Heap <span>${info.freeHeap} bytes</span>
          </div>
          <div class="health_row">Heap Fragmentation <span>${info.heapFragmentation}%</span></div>
          <div class="health_row">Max Free Block <span>${info.maxFreeBlockSize} bytes</span></div>
          <div class="health_row">Uptime <span>${info.uptime}</span></div>
          <div class="heap-status">Memory Status: <span style="color: ${heapColor};">${heapStatus}</span></div>
        `;
      })
      .catch(err => console.error(err));
  }
  

   // JavaScript to toggle the accordion open and closed
   const accordion = document.querySelector('.accordion');
   const header = accordion.querySelector('.accordion-header');

   header.addEventListener('click', () => {
     const content = accordion.querySelector('.accordion-content');
     accordion.classList.toggle('open');

     // Manually handle max-height transition on open/close
     if (accordion.classList.contains('open')) {
       content.style.maxHeight = content.scrollHeight + 'px'; // Set max-height to content's natural height
     } else {
       content.style.maxHeight = '0'; // Collapse content smoothly
     }
   });

function fetchUptimeHistory() {
  fetch("/uptime-history")
    .then(res => res.json())
    .then(data => {
      const container = document.querySelector(".bar-container");
      container.innerHTML = "";

      const max = Math.max(...data.days);
      const avg = data.avg;
      const lastWeekAvg = parseInt(localStorage.getItem("lastWeekAvg") || avg);
      localStorage.setItem("lastWeekAvg", avg);

      data.days.forEach(min => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = (min / max * 100) + "%";
        bar.dataset.min = min;
        container.appendChild(bar);
      });

      const diff = avg - lastWeekAvg;
      const diffText = diff === 0 ? "No change from last week." :
                       diff > 0 ? `Up by ${diff} minutes.` : `Down by ${Math.abs(diff)} minutes.`;
      document.querySelector(".summary").textContent = `Weekly avg: ${avg} min — ${diffText}`;
    });
}

document.addEventListener("DOMContentLoaded", fetchUptimeHistory);
