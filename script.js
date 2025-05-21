document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const gtInput = document.getElementById('gt');
  const cargoTypeSelect = document.getElementById('cargoType');
  const cranesInput = document.getElementById('cranes');
  const craneValue = document.getElementById('craneValue');
  const calculateBtn = document.getElementById('calculateBtn');
  const timeResult = document.getElementById('time');
  const progressFill = document.getElementById('progressFill');
  const recommendationText = document.getElementById('recommendation');
  const breakdownText = document.getElementById('breakdown');
  const liquidFields = document.getElementById('liquidFields');
  const craneGroup = document.getElementById('craneGroup');
  const pumpCapacityInput = document.getElementById('pumpCapacity');

  // 1. Format dan Validasi Input GT (Angka saja)
  gtInput.addEventListener('input', function() {
    // Hapus semua karakter non-digit
    let value = this.value.replace(/[^\d]/g, '');
    
    // Format dengan titik ribuan
    if (value.length > 3) {
      value = parseInt(value).toLocaleString('id-ID');
    }
    
    this.value = value;
  });

  // 2. Toggle Visibility: Pumping (Liquid) vs Crane (Non-Liquid)
  function toggleInputFields() {
    const isLiquid = cargoTypeSelect.value === 'liquid';
    
    // Tampilkan/sembunyikan fields
    liquidFields.style.display = isLiquid ? 'block' : 'none';
    craneGroup.style.display = isLiquid ? 'none' : 'block';
    
    // Reset nilai pumping jika bukan liquid
    if (!isLiquid) pumpCapacityInput.value = '';
  }

  // 3. Update Crane Value Display
  cranesInput.addEventListener('input', function() {
    craneValue.textContent = this.value;
  });

  // 4. Hitung Waktu Bongkar Muat
  calculateBtn.addEventListener('click', function() {
    // Validasi GT
    const gt = parseInt(gtInput.value.replace(/\./g, ''));
    if (!gt || gt <= 0) {
      alert('Masukkan GT kapal yang valid!');
      gtInput.focus();
      return;
    }

    const cargoType = cargoTypeSelect.value;
    let operationalTime, breakdownDetails;

    if (cargoType === 'liquid') {
      // Kalkulasi untuk Liquid (Pumping)
      const pumpCapacity = parseInt(pumpCapacityInput.value) || 1000; // Default 1000 m³/jam
      operationalTime = (gt / 500) * (1000 / pumpCapacity);
      breakdownDetails = `
        <strong>Breakdown Waktu:</strong><br>
        - Pumping: ~${Math.round(operationalTime)} jam (${pumpCapacity} m³/jam)<br>
        - Administrasi: ~4 jam<br>
        <small>Kapal Tanker ${gt.toLocaleString('id-ID')} GT</small>
      `;
    } else {
      // Kalkulasi untuk Container/Dry Bulk (Crane)
      const cranes = parseInt(cranesInput.value);
      const baseTime = (gt / 1000) * (cargoType === 'container' ? 0.9 : 1.3);
      const craneEfficiency = 1 - (0.08 * (cranes - 1)); // Efisiensi per crane
      operationalTime = baseTime * craneEfficiency;
      
      breakdownDetails = `
        <strong>Breakdown Waktu:</strong><br>
        - Bongkar muat: ~${Math.round(operationalTime)} jam<br>
        - Crane: ${cranes} unit (efisiensi ${Math.round(craneEfficiency * 100)}%)<br>
        - Administrasi: ~4 jam<br>
        <small>Kapal ${cargoType === 'container' ? 'Container' : 'Dry Bulk'} ${gt.toLocaleString('id-ID')} GT</small>
      `;
    }

    // Total waktu termasuk administrasi
    const totalTime = operationalTime + 4;
    timeResult.textContent = Math.round(totalTime);
    breakdownText.innerHTML = breakdownDetails;
    updateProgressBar(totalTime, cargoType);
    generateRecommendation(totalTime, cargoType);
  });

  // 5. Update Progress Bar
  function updateProgressBar(time, cargoType) {
    const maxTime = cargoType === 'liquid' ? 36 : 24;
    const percentage = (time / maxTime) * 100;
    progressFill.style.width = `${Math.min(percentage, 100)}%`;
    
    // Warna berdasarkan efisiensi
    progressFill.style.background = 
      time <= 12 ? '#10b981' :  // Hijau
      time <= (cargoType === 'liquid' ? 24 : 18) ? '#f59e0b' :  // Kuning
      '#ef4444';  // Merah
  }

  // 6. Generate Rekomendasi
  function generateRecommendation(time, cargoType) {
    let icon, message;
    
    if (cargoType === 'liquid') {
      if (time <= 18) {
        icon = 'fa-check-circle';
        message = 'Efisiensi pumping sangat baik';
      } else {
        icon = 'fa-exclamation-triangle';
        message = 'Butuh peningkatan kapasitas pumping';
      }
    } else {
      const cranes = parseInt(cranesInput.value);
      
      if (time <= 12) {
        icon = 'fa-check-circle';
        message = 'Operasi sangat efisien';
      } else if (time <= 18) {
        icon = 'fa-info-circle';
        message = cranes < 4 ? 'Tambahkan crane' : 'Optimasi alur kerja';
      } else {
        icon = 'fa-exclamation-triangle';
        message = 'Butuh evaluasi menyeluruh';
      }
    }
    
    recommendationText.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  }

  // Inisialisasi awal
  toggleInputFields();
  cargoTypeSelect.addEventListener('change', toggleInputFields);
});