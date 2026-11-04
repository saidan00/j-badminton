import { ref, watch } from 'vue';
import { storage } from '@/lib/browser.js';

const MODE_KEY = 'badminton-split:equal';

// Bật "chia đều" thì ai cũng trả như nhau, không tính hệ số nam/nữ.
// Dùng chung cho form, kết quả và chip luật chơi ở header.
const equal = ref(storage.get(MODE_KEY) === '1');
watch(equal, (on) => storage.set(MODE_KEY, on ? '1' : '0'));

export function useSplitMode() {
  return equal;
}
