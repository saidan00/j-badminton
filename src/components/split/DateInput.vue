<script setup>
// Ô chọn ngày dùng lịch có sẵn của trình duyệt, giá trị dạng YYYY-MM-DD.
const model = defineModel({ type: String, required: true });
defineProps({ id: { type: String, default: undefined } });

// Bấm vào đâu trong ô cũng mở lịch, không chỉ mỗi biểu tượng (Chrome, Edge…).
function openPicker(e) {
  try { e.target.showPicker?.(); } catch { }
}
</script>

<template>
  <span class="date">
    <input :id="id" v-model="model" type="date" @click="openPicker">
  </span>
</template>

<style scoped>
.date {
  display: flex;
  align-items: center;
  height: 52px;
  background: #fff;
  border: 1.5px solid var(--rule);
  border-radius: 14px;
  transition: border-color .15s, box-shadow .15s;
}

.date:focus-within {
  border-color: var(--lime-deep);
  box-shadow: 0 0 0 4px rgba(169, 212, 0, .22);
}

input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  padding: 0 12px 0 14px;
  font: 700 21px/1 var(--display);
  font-variant-numeric: tabular-nums;
  letter-spacing: .01em;
  color: var(--ink);
  outline: none;
}

input::-webkit-date-and-time-value {
  text-align: left;
}

input::-webkit-calendar-picker-indicator {
  margin-left: 4px;
  opacity: .55;
  cursor: pointer;
}
</style>
