function updateChart(data) {
  const container = document.querySelector('.bar-container');
  const touchLine = document.querySelector('.touch-line');
  const floatingLabel = document.querySelector('.floating-uptime-label');
  const staticLabel = document.querySelector('.static-uptime-label');
  const staticTitle = staticLabel.querySelector('.uptime-title');
  staticTitle.textContent = "Today"; // Dynamically set "Today" label
  const uptimeTitle = floatingLabel.querySelector('.uptime-title');
  const uptimeValue = floatingLabel.querySelector('.uptime-value');
  const staticValue = staticLabel.querySelector('.uptime-value');
  const summaryUptime = document.querySelector('.summary-uptime');
  const statusText = document.getElementById('status-text');
  const wrapper = document.querySelector('.bar-chart-wrapper');

  // Reverse data.days to show today's uptime first
  data.days.reverse();

  const maxValue = Math.max(...data.days, 1);
  const scaleMax = maxValue * 1.4;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const labels = [];

  const todayVal = data.days[0]; // Today's uptime is now at index 0
  const hours = Math.floor(todayVal / 60);
  const minutes = todayVal % 60;
  const formatted = `${hours}h ${minutes}m`;
  staticValue.textContent = formatted;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragTimeout = null;

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    labels.push(days[d.getDay()]);
  }

  const existingBars = container.querySelectorAll('.bar');

  if (existingBars.length === 7) {
    data.days.forEach((val, i) => {
      const bar = existingBars[i];
      const oldUptime = parseInt(bar.dataset.uptime || "0", 10);

      const percentHeight = Math.max(1, (val / scaleMax) * 100);

      if (val !== oldUptime) {
        const bounceHeight = percentHeight * 1.05;

        // Step 1: Slightly overshoot (even if shrinking)
        bar.style.transition = 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => {
          bar.style.height = `${bounceHeight}%`;

          // Step 2: Bounce back or shrink
          setTimeout(() => {
            bar.style.transition = 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            bar.style.height = `${percentHeight}%`;
          }, 300);
        }, i * 100);
      } else {
        // 🔁 Even if unchanged, make sure height stays in sync (e.g. after scaleMax change)
        bar.style.height = `${percentHeight}%`;
      }

      // Always update the stored uptime
      bar.dataset.uptime = val;
    });
  } else {
    // Create new bars
    container.innerHTML = '';
    data.days.forEach((val, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = '0%';
      bar.style.transition = 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      bar.dataset.index = i;
      bar.dataset.uptime = val;
      bar.style.backgroundColor = (val === 0) ? '#4a558e' : (i === 0) ? '#7349ff' : '#00ffff';

      const label = document.createElement('div');
      label.className = 'bar-label';
      label.textContent = labels[i];
      bar.appendChild(label);
      container.appendChild(bar);

      // Bounce effect on initial grow
      setTimeout(() => {
        const percentHeight = Math.max(1, (val / scaleMax) * 100);
        const bounceHeight = percentHeight * 1.05;

        // Step 1: Overshoot
        bar.style.height = `${bounceHeight}%`;

        // Step 2: Settle back
        setTimeout(() => {
          bar.style.transition = 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
          bar.style.height = `${percentHeight}%`;
        }, 300);
      }, 30 + i * 100); // Wave effect: staggered by 100ms for each bar
    });
  }

  const todayMin = data.days[6];
  const total = data.days.reduce((a, b) => a + b, 0);
  const avg = total / 7;

  let weeklyChange = 0;
let weeklyChangeText = '';

const lastWeek = data.lastWeek || 0; // Default to zero if no value is provided
const thisWeek = data.thisWeek || 0; // Default to zero if no value is provided

if (lastWeek === 0) {  
  if (thisWeek === 0) {
    weeklyChangeText = '0%';
  } else {
    weeklyChangeText = 'New!';
  }
} else {
  weeklyChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  const changeArrow = weeklyChange >= 0 
    ? '<span style="color:#00FF00;">▲</span>' 
    : '<span style="color:#FF0000;">▼</span>';
  weeklyChangeText = `${changeArrow} ${Math.abs(weeklyChange)}%`;
}

  const changeArrow = weeklyChange >= 0 ? '▲' : '▼';
  const changeColor = weeklyChange >= 0 ? '#00FF00' : '#FF0000';

 summaryUptime.innerHTML = `
<div class="uptime-left">
  <span>Total:</span><br>${Math.floor(total/60)}h ${total%60}m
</div>
<div class="uptime-center">
  <span>Daily Avg:</span><br>${Math.floor(avg/60)}h ${Math.round(avg%60)}m
</div>
<div class="uptime-right">
  <span>Last Week:</span><br>${weeklyChangeText}
</div>
`;

  // 🛠 Show floating toast if weekly message exists
  if (data.weeklyMsg) {
    const toast = document.getElementById('weekly-toast');
    if (toast) {
      toast.textContent = data.weeklyMsg;
      toast.style.display = 'block';
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 600);
      }, 4000);
    }
  }

  statusText.innerHTML = "<span>Energy Saving:</span> " + (avg <= 90 ? "Excellent" : avg <= 240 ? "Good" : "Bad");
  statusText.style.color = avg <= 90 ? "#FFFFFF" : avg <= 240 ? "#FFD700" : "#FF0000";

  function updateTouchLine(x) {
    const bars = Array.from(container.querySelectorAll('.bar'));
    const rect = container.getBoundingClientRect();
    const margin = 5;
    const relX = Math.max(margin, Math.min(x - rect.left, container.offsetWidth - margin));

    touchLine.style.left = `${relX}px`;
    touchLine.style.display = 'block';

    const labelW = floatingLabel.offsetWidth;
    let labelX = Math.max(0, Math.min(relX - labelW / 2, wrapper.offsetWidth - labelW));
    floatingLabel.style.left = `${labelX}px`;
    floatingLabel.style.display = 'flex';
    staticLabel.style.opacity = '0';

    let closest = null, minDist = Infinity;
    bars.forEach(bar => {
      const barX = bar.getBoundingClientRect().left + bar.offsetWidth / 2;
      const dist = Math.abs(barX - x);
      if (dist < minDist) {
        minDist = dist;
        closest = bar;
      }
    });

    if (closest) {
      const up = parseInt(closest.dataset.uptime, 10);
      const idx = parseInt(closest.dataset.index, 10);
      uptimeTitle.textContent = idx === 6 ? "Today" : labels[idx];
      uptimeValue.textContent = `${Math.floor(up/60)}h ${up%60}m`;
      
      // HAPTIC or SOUND feedback
      if (idx !== lastTouchedIndex) {
          if (navigator.vibrate) navigator.vibrate(10); 
          lastTouchedIndex = idx;
      }
    }
  }

  container.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragStarted = false;
      isDragging = false;
    }, { passive: true });
    
    container.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
    
      if (!dragStarted) {
        if (Math.abs(dy) > Math.abs(dx)) {
          // Vertical scroll detected — do nothing, allow scroll
          isDragging = false;
          return;
        } else {
          // Horizontal drag detected
          isDragging = true;
          dragStarted = true;
        }
      }

      if (isDragging) {
        e.preventDefault(); // Only block scrolling if dragging horizontally
        updateTouchLine(e.touches[0].clientX);
      }
    }, { passive: false });
    
    container.addEventListener('touchend', () => {
      isDragging = false;
      dragStarted = false;
      floatingLabel.style.display = 'none';
      staticLabel.style.opacity = '1';
      touchLine.style.display = 'none';
    });

    container.addEventListener('mousemove', e => updateTouchLine(e.clientX));
      container.addEventListener('mouseleave', () => {
      floatingLabel.style.display = 'none';
      staticLabel.style.opacity = '1';
      touchLine.style.display = 'none';
  });
}

function fetchUptimeData() {
  const spinner = document.getElementById('chart-spinner');
  spinner.style.display = 'block'; // Show spinner before fetching

  fetch('/uptime-data')
    .then(res => res.json())
    .then(data => {
      updateChart(data);
    })
    .finally(() => {
      spinner.style.display = 'none'; // Hide spinner after chart updates
    });
}


document.addEventListener('DOMContentLoaded', () => {
  fetchUptimeData();
  setInterval(fetchUptimeData, 60000);
});

function resetUptime() {
  fetch('/reset-uptime', { method: 'POST' })
    .then(() => {
      fetchUptimeData();
      alert("Uptime history has been reset!");
    })
    .catch(err => {
      console.error('Reset failed:', err);
      alert("Failed to reset uptime.");
    });
}

document.getElementById("freshRolloverBtn").addEventListener("click", () => {
  const status = document.getElementById("rolloverStatus");
  status.textContent = "⏳ Triggering...";
  fetch("/force-rollover", { method: "POST" })
    .then(() => {
      status.textContent = "✅ Rollover complete";
      setTimeout(() => (status.textContent = ""), 3000);
    })
    .catch(err => {
      console.error("❌ Rollover failed:", err);
      status.textContent = "❌ Rollover failed";
    });
});
