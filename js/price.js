(() => {
  const dial = document.getElementById('dial');
  const displayPricePerKwh = document.getElementById('display-priceperkwh');
  const hiddenPricePerKwh = document.getElementById('priceperkwh');
  const submitBtn = document.getElementById('submitBtn'); // <-- Add this

  const tickWidth = 30; // px between ticks
  const step = 0.01;    // Increment per tick
  const maxValue = 1.0; // Maximum value (adjust as needed)
  const totalTicks = Math.round(maxValue / step) + 1;

  const repeatCount = 3;
  const totalTicksRepeated = totalTicks * repeatCount;

  // Store the original value at initialization
  const originalPrice = hiddenPricePerKwh.value;

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

  function updateSubmitBtn() {
    if (!submitBtn) return;
    if (hiddenPricePerKwh.value !== originalPrice) {
      submitBtn.style.display = "block";
      requestAnimationFrame(() => {
        submitBtn.style.opacity = "1";
        submitBtn.style.transform = 'scale(1.2)';
      });
    } else {
      submitBtn.style.opacity = "0";
      submitBtn.style.transform = 'scale(1)';
    }
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
    displayPricePerKwh.textContent = value.toFixed(2) + 'p';
    hiddenPricePerKwh.value = value.toFixed(2);

    // Adjust translateX to keep the dial centered for seamless looping
    const targetCenterOffsetPx = tickIndex * tickWidth - containerWidth / 2;
    const offsetWithRepeats = -targetCenterOffsetPx - (totalTicks * tickWidth);
    dial.style.transform = `translateX(${offsetWithRepeats}px)`;

    currentTranslateX = offsetWithRepeats;

    // Check if value changed and update submit button
    updateSubmitBtn();

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

  createTicks();
  initializeDial();

  dial.addEventListener('mousedown', onDragStart);
  dial.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);

  updateValueFromTranslateX(currentTranslateX);
})();
