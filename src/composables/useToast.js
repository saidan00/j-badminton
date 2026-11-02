import { reactive } from 'vue';

// Một toast cho cả app; component nào cũng gọi được show().
const state = reactive({ message: '', action: null, visible: false });
let timer;

function hide() {
  state.visible = false;
}

function show(message, action = null) {
  state.message = message;
  state.action = action;
  state.visible = true;
  clearTimeout(timer);
  timer = setTimeout(hide, action ? 8000 : 2500);
}

function runAction() {
  const action = state.action;
  hide();
  action?.run();
}

export function useToast() {
  return { state, show, hide, runAction };
}
