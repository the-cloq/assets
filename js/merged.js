document.addEventListener("DOMContentLoaded", function () {
    // ===== Form Change Detection Logic =====
    const form = document.getElementById("settings");
    const submitBtn = document.getElementById("submitBtn");
    const myinputs = form.querySelectorAll("input");
    const sliders = document.querySelectorAll(".slider_wrap div");

    // Form control elements
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

    // Map to store original values
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

    // ===== Price Dial Implementation =====
    const dial = document.getElementById('dial');
    const displayPricePerKwh = document.getElementById('display-priceperkwh');
    const hiddenPricePerKwh = document.getElementById('priceperkwh');
  
    const tickWidth = 30; // px between ticks
    const step = 0.01;    // Increment per tick
    const maxValue = 1.0; // Maximum value (adjust as needed)
    const totalTicks = Math.round(maxValue / step) + 1;
  
    const repeatCount = 3;
    const totalTicksRepeated = totalTicks * repeatCount;
  
    function createTicks() {
        for (let r = 0; r < repeatCount; r++) {
            for (let i = 0; i < totalTicks; i++) {
                const tick = document.createElement('div');
                tick.className = 'tick';
                const value = i * step;
  
                if (i % 5 === 0) {
                    tick.textContent = value.toFixed(2); // Label every 5th tick
                } else {
                    tick.classList.add('hide-label');
                }
                dial.appendChild(tick);
            }
        }
    }
  
    const dialWidth = totalTicksRepeated * tickWidth;
    dial.style.width = dialWidth + 'px';
  
    function mod(n, m) {
        return ((n % m) + m) % m;
    }
  
    function updateValueFromTranslateX(translateX) {
        let normalizedX = mod(-translateX - (totalTicks * tickWidth), dialWidth);
    
        const containerWidth = 320;
        let centerOffsetPx = normalizedX + containerWidth / 2;
        centerOffsetPx = mod(centerOffsetPx, dialWidth);
    
        let tickIndex = Math.round(centerOffsetPx / tickWidth);
        tickIndex = tickIndex % totalTicks;
    
        // Ensure seamless looping by resetting translateX to its equivalent position
        if (tickIndex < 0) tickIndex += totalTicks;
        const value = tickIndex * step;
    
        // Update the hidden value and display
        displayPricePerKwh.textContent = value.toFixed(2);
        hiddenPricePerKwh.value = value.toFixed(2);
        
        // Trigger an input event to activate form change detection
        const event = new Event('input', { bubbles: true });
        hiddenPricePerKwh.dispatchEvent(event);
    
        // Adjust translateX to keep the dial centered for seamless looping
        const targetCenterOffsetPx = tickIndex * tickWidth - containerWidth / 2;
        const offsetWithRepeats = -targetCenterOffsetPx - (totalTicks * tickWidth);
        dial.style.transform = `translateX(${offsetWithRepeats}px)`;
    
        currentTranslateX = offsetWithRepeats;
        return tickIndex;
    }
  
    function initializeDial() {
        const initialValue = parseFloat(hiddenPricePerKwh.value) || 0;
        const initialTickIndex = Math.round(initialValue / step);
    
        const containerWidth = 320;
        const targetCenterOffsetPx = initialTickIndex * tickWidth - containerWidth / 2;
        const offsetWithRepeats = -targetCenterOffsetPx - (totalTicks * tickWidth);
    
        currentTranslateX = offsetWithRepeats;
        dial.style.transform = `translateX(${currentTranslateX}px)`;
    
        updateValueFromTranslateX(currentTranslateX);
    }
  
    let currentTranslateX = 0;
    let isDragging = false;
    let startX = 0;
    let startTranslateX = 0;
  
    function onDragStart(e) {
        isDragging = true;
        startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        startTranslateX = currentTranslateX;
        dial.style.transition = 'none';
        e.preventDefault();
    }
  
    function onDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const dx = currentX - startX;
        currentTranslateX = startTranslateX + dx;
        dial.style.transform = `translateX(${currentTranslateX}px)`;
        updateValueFromTranslateX(currentTranslateX);
    }
  
    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
    
        let tickIndex = updateValueFromTranslateX(currentTranslateX);
        const containerWidth = 320;
        let targetCenterOffsetPx = tickIndex * tickWidth - containerWidth / 2;
        targetCenterOffsetPx += totalTicks * tickWidth;
    
        currentTranslateX = -targetCenterOffsetPx;
        dial.style.transition = 'transform 0.3s ease-out';
        dial.style.transform = `translateX(${currentTranslateX}px)`;
    }
    
    // Initialize price dial and add to change tracking
    if (hiddenPricePerKwh) {
        originalValues.set(hiddenPricePerKwh, hiddenPricePerKwh.value);
    }
    
    // ===== Function to check for changes in all form elements =====
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

    // Add event listeners to form inputs
    myinputs.forEach(input => input.addEventListener("input", checkChanges));
    sliders.forEach(slider => slider.noUiSlider.on("update", checkChanges));
    
    // Initialize price dial controls
    createTicks();
    initializeDial();
  
    dial.addEventListener('mousedown', onDragStart);
    dial.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
    
    // Form submission with overlay
    const overlay = document.getElementById('overlay');
  
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
function tempToggleBoxes() {
    const celciusRadio = document.getElementById("celcius");
    const fahrenheitRadio = document.getElementById("fahrenheit");
    const cel = document.getElementById("cel");
    const fah = document.getElementById("fah");
    
    cel.style.display = celciusRadio.checked ? "block" : "none";
    fah.style.display = fahrenheitRadio.checked ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.temp-toggles .radio-input').forEach(radio => {
        radio.addEventListener('change', tempToggleBoxes);
    });
    // Initialize correct box visibility on page load
    tempToggleBoxes();
});

// DST Toggle Switcher
function dstToggleBoxes() {
    const summerRadio = document.getElementById("summer");
    const winterRadio = document.getElementById("winter");
    const sumR = document.getElementById("sumR");
    const wintR = document.getElementById("wintR");
    
    sumR.style.display = summerRadio.checked ? "block" : "none";
    wintR.style.display = winterRadio.checked ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.dst-toggles .radio-input').forEach(radio => {
        radio.addEventListener('change', dstToggleBoxes);
    });
    // Initialize correct box visibility on page load
    dstToggleBoxes();
});

// Tabs functionality
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

// Utility functions
function removeSpaces(string){return string.split(' ').join('');}
function removeSpaceAfterComma(string){return string.replace(", ", ",");}

// Date prototype extensions
Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}  

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

// Dark mode
function update(){
    Math.floor((new Date).getTime()/1e3);
    document.body.className="darkmode";
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Accordion functionality
document.addEventListener("DOMContentLoaded", function() {
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
});

// Fanen tab functionality
document.addEventListener("DOMContentLoaded", function() {
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
});

// Swipe Support for tabs
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
        const fanenContent = document.querySelector('.fanen-content');
        if (fanenContent) {
            fanenContent.style.transition = 'none';
            fanenContent.style.transform = `translateX(${getCurrentOffset() + diffX}px)`;
        }
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

// Utility Functions for tab swiping
function switchToTab(tabNumber) {
    const fanenContent = document.querySelector('.fanen-content');
    const tabIndicator = document.querySelector('.fanen-indicator');
    
    if (!fanenContent || !tabIndicator) return;
    
    if (tabNumber === 1) {
        fanenContent.classList.remove('tab2-active');
        fanenContent.classList.add('tab1-active');
        tabIndicator.style.transform = 'translateX(0)';
    } else {
        fanenContent.classList.remove('tab1-active');
        fanenContent.classList.add('tab2-active');
        tabIndicator.style.transform = 'translateX(100%)';
    }
}

function getCurrentOffset() {
    const fanenContent = document.querySelector('.fanen-content');
    if (!fanenContent) return 0;
    
    const style = window.getComputedStyle(fanenContent);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41; // Get translateX value
}

function resetPosition() {
    const fanenContent = document.querySelector('.fanen-content');
    if (!fanenContent) return;
    
    fanenContent.style.transition = 'transform 0.3s ease';
    fanenContent.style.transform = fanenContent.classList.contains('tab2-active') ? 
        'translateX(-100%)' : 'translateX(0)';
}

// Add swipe event listeners
document.addEventListener("DOMContentLoaded", function() {
    const fanenContent = document.querySelector('.fanen-content');
    if (fanenContent) {
        fanenContent.addEventListener('touchstart', startSwipe, { passive: false });
        fanenContent.addEventListener('touchmove', moveSwipe, { passive: false });
        fanenContent.addEventListener('touchend', endSwipe);
        
        fanenContent.addEventListener('pointerdown', startSwipe);
        fanenContent.addEventListener('pointermove', moveSwipe);
        fanenContent.addEventListener('pointerup', endSwipe);
    }
});

// Card flip functionality
function flipCard(element) {
    if (!element) return;
    
    // Find parent card
    let currentNode = element;
    while (currentNode && !currentNode.classList.contains('card')) {
        currentNode = currentNode.parentElement;
    }
    
    if (currentNode) {
        currentNode.classList.toggle('is-flipped');
    }
}
