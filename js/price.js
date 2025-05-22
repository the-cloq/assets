(() => {
  const dial = document.getElementById('dial');
  const displayPricePerKwh = document.getElementById('display-priceperkwh');
  const hiddenPricePerKwh = document.getElementById('hidden-priceperkwh');

  const tickWidth = 30;       // px between ticks
  const step = 1;             // increment per tick
  const maxValue = 100;
  const totalTicks = maxValue + 1;  // 0 to 100 inclusive

  const repeatCount = 3;
  const totalTicksRepeated = totalTicks * repeatCount;

  // Create ticks repeated 3 times for looping
  function createTicks() {
    for (let r = 0; r < repeatCount; r++) {
      for (let i = 0; i < totalTicks; i++) {
        const tick = document.createElement('div');
        tick.className = 'tick';
        const value = i * step;

        // Label every 5th tick starting from 10
        if (value >= 10 && value % 5 === 0) {
          tick.textContent = value;
        } else {
          tick.classList.add('hide-label');
        }
        dial.appendChild(tick);
      }
    }
  }
  createTicks();

  const dialWidth = totalTicksRepeated * tickWidth;
  dial.style.width = dialWidth + 'px';

  // Start centered on the middle repeat at value 10
  let currentTranslateX = -totalTicks * tickWidth + tickWidth * 10;
  dial.style.transform = `translateX(${currentTranslateX}px)`;

  let isDragging = false;
  let startX = 0;
  let startTranslateX = currentTranslateX;

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function updateValueFromTranslateX(translateX) {
    // Normalize translateX to positive range in [0, dialWidth)
    let normalizedX = mod(-translateX - (totalTicks * tickWidth), dialWidth);

    // Add half container width (marker center) to normalizedX
    const containerWidth = 320;
    let centerOffsetPx = normalizedX + containerWidth / 2;
    centerOffsetPx = mod(centerOffsetPx, dialWidth);

    // Find nearest tick index
    let tickIndex = Math.round(centerOffsetPx / tickWidth);
    tickIndex = tickIndex % totalTicks;

    // Calculate value
    const value = tickIndex * step;
    displayPricePerKwh.textContent = `${value}p`;
    hiddenPricePerKwh.value = value; // Update the hidden input's value

    return tickIndex;
  }

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
  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    // Snap to closest tick so it aligns with center marker
    let tickIndex = updateValueFromTranslateX(currentTranslateX);

    const containerWidth = 320;
    let targetCenterOffsetPx = tickIndex * tickWidth - containerWidth / 2;
    targetCenterOffsetPx += totalTicks * tickWidth;

    currentTranslateX = -targetCenterOffsetPx;
    dial.style.transition = 'transform 0.3s ease-out';
    dial.style.transform = `translateX(${currentTranslateX}px)`;
  }

  dial.addEventListener('mousedown', onDragStart);
  dial.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);

  updateValueFromTranslateX(currentTranslateX);
})();
